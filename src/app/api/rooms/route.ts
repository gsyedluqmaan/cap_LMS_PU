import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Room from '@/models/Room';
import User from '@/models/User';

// Helper function to verify token and get user
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

// GET - Get all rooms (accessible to all authenticated users)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify user is authenticated
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const roomType = searchParams.get('roomType') || '';
    const building = searchParams.get('building') || '';
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { roomName: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } }
      ];
    }

    if (roomType) {
      query.roomType = roomType;
    }

    if (building) {
      query.building = { $regex: building, $options: 'i' };
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    // Get rooms with pagination
    const [rooms, totalItems] = await Promise.all([
      Room.find(query)
        .populate('createdBy', 'name email')
        .sort({ building: 1, roomNumber: 1 })
        .skip(skip)
        .limit(limit),
      Room.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: rooms,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new room (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin access
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      roomNumber,
      roomName,
      roomType,
      building,
      floor,
      seatingCapacity,
      hasProjector,
      hasWhiteboard,
      hasComputers,
      computerCount,
      hasAC,
      hasWifi,
      facilities,
      description,
    } = body;

    // Validate required fields
    if (!roomNumber || !roomName || !roomType || !building || !seatingCapacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: roomNumber.toUpperCase() });
    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room number already exists' },
        { status: 400 }
      );
    }

    // Create new room
    const room = await Room.create({
      roomNumber: roomNumber.toUpperCase(),
      roomName,
      roomType,
      building,
      floor,
      seatingCapacity,
      hasProjector: hasProjector || false,
      hasWhiteboard: hasWhiteboard !== undefined ? hasWhiteboard : true,
      hasComputers: hasComputers || false,
      computerCount: computerCount || 0,
      hasAC: hasAC || false,
      hasWifi: hasWifi !== undefined ? hasWifi : true,
      facilities: facilities || [],
      description,
      createdBy: admin._id,
      isActive: true,
    });

    const populatedRoom = await Room.findById(room._id).populate('createdBy', 'name email');

    return NextResponse.json(
      { message: 'Room created successfully', data: populatedRoom },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
