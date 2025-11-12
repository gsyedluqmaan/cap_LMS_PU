import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import ClassSection from '@/models/ClassSection';
import User from '@/models/User';

interface DecodedToken {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

const verifyToken = (request: NextRequest): DecodedToken | null => {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) return null;
    
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as DecodedToken;
  } catch {
    return null;
  }
};

// GET /api/class-sections - Get all class sections with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const academicYear = searchParams.get('academicYear') || '';
    const teacherId = searchParams.get('teacherId') || '';
    const studentId = searchParams.get('studentId') || '';
    const isActive = searchParams.get('isActive');

    // Build filter query
    const filter: any = {};

    if (search) {
      filter.$or = [
        { className: { $regex: search, $options: 'i' } },
        { classCode: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) filter.department = department;
    if (academicYear) filter.academicYear = academicYear;
    if (teacherId) filter['subjects.teacher'] = teacherId;
    if (studentId) filter.students = { $in: [studentId] };
    if (isActive !== null) filter.isActive = isActive === 'true';

    // Role-based filtering
    if (user.role === 'teacher') {
      filter['subjects.teacher'] = user.userId;
    } else if (user.role === 'student') {
      filter.students = { $in: [user.userId] };
    }

    const skip = (page - 1) * limit;
    
    const [classes, totalCount] = await Promise.all([
      ClassSection.find(filter)
        .populate('subjects.teacher', 'name email employeeId')
        .populate('students', 'name email studentId')
        .populate('createdBy', 'name email')
        .populate('theoryRoom', 'roomNumber roomName building')
        .populate('labRoom', 'roomNumber roomName building')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      ClassSection.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: classes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    console.error('Get class sections error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class sections' },
      { status: 500 }
    );
  }
}

// POST /api/class-sections - Create new class section (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const {
      className,
      classCode,
      description,
      subjects = [],
      department,
      semester,
      academicYear,
      students = [],
      maxStudents,
      schedule = [],
      theoryRoom,
      labRoom,
      isActive = true
    } = body;

    // Validate required fields
    if (!className || !department || !academicYear || !maxStudents) {
      return NextResponse.json(
        { error: 'Class name, department, academic year, and max students are required' },
        { status: 400 }
      );
    }

    // Validate subjects array
    if (subjects.length === 0) {
      return NextResponse.json(
        { error: 'At least one subject with teacher assignment is required' },
        { status: 400 }
      );
    }

    // Check if class code is unique (if provided)
    if (classCode) {
      const existingClass = await ClassSection.findOne({ classCode });
      if (existingClass) {
        return NextResponse.json(
          { error: 'Class code already exists' },
          { status: 409 }
        );
      }
    }

    // Validate teachers exist and have teacher role
    if (subjects.length > 0) {
      const teacherIds = subjects.map((s: any) => s.teacher);
      const teacherUsers = await User.find({ 
        _id: { $in: teacherIds }, 
        role: 'teacher' 
      });
      if (teacherUsers.length !== teacherIds.length) {
        return NextResponse.json(
          { error: 'Some selected teachers are invalid' },
          { status: 400 }
        );
      }
    }

    // Validate students exist and have student role
    if (students.length > 0) {
      const studentUsers = await User.find({ 
        _id: { $in: students }, 
        role: 'student' 
      });
      if (studentUsers.length !== students.length) {
        return NextResponse.json(
          { error: 'Some selected students are invalid' },
          { status: 400 }
        );
      }
    }

    // Check enrollment limit
    if (students.length > maxStudents) {
      return NextResponse.json(
        { error: `Number of students cannot exceed maximum of ${maxStudents}` },
        { status: 400 }
      );
    }

    const classSection = new ClassSection({
      className,
      classCode: classCode || undefined, // Let the pre-save hook generate if empty
      description,
      subjects,
      department,
      semester,
      academicYear,
      students,
      maxStudents,
      schedule,
      theoryRoom: theoryRoom || undefined,
      labRoom: labRoom || undefined,
      isActive,
      createdBy: user.userId
    });

    await classSection.save();

    // Populate the created class section
    const populatedClass = await ClassSection.findById(classSection._id)
      .populate('subjects.teacher', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email')
      .populate('theoryRoom', 'roomNumber roomName building')
      .populate('labRoom', 'roomNumber roomName building');

    return NextResponse.json(populatedClass, { status: 201 });
  } catch (error: any) {
    console.error('Create class section error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create class section' },
      { status: 500 }
    );
  }
}