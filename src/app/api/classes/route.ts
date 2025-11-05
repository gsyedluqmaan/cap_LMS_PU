import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import OnlineClass from '@/models/Class';
import User from '@/models/User';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const cookieToken = request.cookies.get('authToken')?.value;
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

// Helper function to verify any user token
async function verifyUserToken(request: NextRequest) {
  const cookieToken = request.cookies.get('authToken')?.value;
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
    const user = await User.findById(decoded.userId);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Get all classes (all authenticated users can view)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify user authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const academicYear = searchParams.get('academicYear') || '';
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    if (isActive !== null && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    // Get classes with pagination and populate references
    const [classes, totalItems] = await Promise.all([
      OnlineClass.find(query)
        .populate('teacher', 'name email employeeId department')
        .populate('students', 'name email studentId department')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OnlineClass.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: classes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Get classes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new class
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

    const classData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'courseCode', 'department', 'semester', 'academicYear', 'teacher'];
    for (const field of requiredFields) {
      if (!classData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Verify teacher exists and has correct role
    const teacher = await User.findById(classData.teacher);
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Invalid teacher selected' },
        { status: 400 }
      );
    }

    // Create class
    const newClass = new OnlineClass({
      ...classData,
      createdBy: admin._id
    });

    await newClass.save();

    // Populate references for response
    await newClass.populate([
      { path: 'teacher', select: 'name email employeeId department' },
      { path: 'students', select: 'name email studentId department' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create class error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors)[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}