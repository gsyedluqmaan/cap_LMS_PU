import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Room from '@/models/Room';
import User from '@/models/User';
import mongoose from 'mongoose';

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

// GET - Get a single room by ID (accessible to all authenticated users)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid room ID' },
        { status: 400 }
      );
    }

    const room = await Room.findById(id).populate('createdBy', 'name email');

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: room }, { status: 200 });

  } catch (error: any) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a room (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid room ID' },
        { status: 400 }
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
      isActive,
    } = body;

    const room = await Room.findById(id);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room number is being changed and if it already exists
    if (roomNumber && roomNumber.toUpperCase() !== room.roomNumber) {
      const existingRoom = await Room.findOne({ 
        roomNumber: roomNumber.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingRoom) {
        return NextResponse.json(
          { error: 'Room number already exists' },
          { status: 400 }
        );
      }
      room.roomNumber = roomNumber.toUpperCase();
    }

    // Update fields
    if (roomName !== undefined) room.roomName = roomName;
    if (roomType !== undefined) room.roomType = roomType;
    if (building !== undefined) room.building = building;
    if (floor !== undefined) room.floor = floor;
    if (seatingCapacity !== undefined) room.seatingCapacity = seatingCapacity;
    if (hasProjector !== undefined) room.hasProjector = hasProjector;
    if (hasWhiteboard !== undefined) room.hasWhiteboard = hasWhiteboard;
    if (hasComputers !== undefined) room.hasComputers = hasComputers;
    if (computerCount !== undefined) room.computerCount = computerCount;
    if (hasAC !== undefined) room.hasAC = hasAC;
    if (hasWifi !== undefined) room.hasWifi = hasWifi;
    if (facilities !== undefined) room.facilities = facilities;
    if (description !== undefined) room.description = description;
    if (isActive !== undefined) room.isActive = isActive;

    await room.save();

    const updatedRoom = await Room.findById(id).populate('createdBy', 'name email');

    return NextResponse.json(
      { message: 'Room updated successfully', data: updatedRoom },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a room (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid room ID' },
        { status: 400 }
      );
    }

    const room = await Room.findById(id);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Instead of hard delete, we can soft delete by setting isActive to false
    // Or we can check if the room is being used in any timetable
    await Room.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Room deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
