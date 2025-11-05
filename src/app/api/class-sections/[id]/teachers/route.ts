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

// POST /api/class-sections/[id]/teachers - Add teachers to class section
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const classSection = await ClassSection.findById(params.id);
    if (!classSection) {
      return NextResponse.json({ error: 'Class section not found' }, { status: 404 });
    }

    const { teacherIds } = await request.json();

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return NextResponse.json(
        { error: 'Teacher IDs array is required' },
        { status: 400 }
      );
    }

    // Validate teachers exist and have teacher role
    const teachers = await User.find({ 
      _id: { $in: teacherIds }, 
      role: 'teacher' 
    });

    if (teachers.length !== teacherIds.length) {
      return NextResponse.json(
        { error: 'Some selected teachers are invalid' },
        { status: 400 }
      );
    }

    // Add new teachers (avoid duplicates)
    const newTeachers = teacherIds.filter(id => !classSection.teachers.includes(id));
    classSection.teachers.push(...newTeachers);
    await classSection.save();

    const updatedClass = await ClassSection.findById(params.id)
      .populate('teachers', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email');

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error('Add teachers error:', error);
    return NextResponse.json(
      { error: 'Failed to add teachers to class section' },
      { status: 500 }
    );
  }
}

// DELETE /api/class-sections/[id]/teachers - Remove teachers from class section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const classSection = await ClassSection.findById(params.id);
    if (!classSection) {
      return NextResponse.json({ error: 'Class section not found' }, { status: 404 });
    }

    const { teacherIds } = await request.json();

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return NextResponse.json(
        { error: 'Teacher IDs array is required' },
        { status: 400 }
      );
    }

    // Remove teachers
    classSection.teachers = classSection.teachers.filter(
      (teacherId: any) => !teacherIds.includes(teacherId.toString())
    );

    await classSection.save();

    const updatedClass = await ClassSection.findById(params.id)
      .populate('teachers', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email');

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error('Remove teachers error:', error);
    return NextResponse.json(
      { error: 'Failed to remove teachers from class section' },
      { status: 500 }
    );
  }
}