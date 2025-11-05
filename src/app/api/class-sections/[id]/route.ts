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

// GET /api/class-sections/[id] - Get single class section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const classSection = await ClassSection.findById(params.id)
      .populate('teachers', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email');

    if (!classSection) {
      return NextResponse.json({ error: 'Class section not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'teacher' && !classSection.teachers.some((t: any) => t._id.toString() === user.userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (user.role === 'student' && !classSection.students.some((s: any) => s._id.toString() === user.userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(classSection);
  } catch (error: any) {
    console.error('Get class section error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class section' },
      { status: 500 }
    );
  }
}

// PUT /api/class-sections/[id] - Update class section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const classSection = await ClassSection.findById(params.id);
    if (!classSection) {
      return NextResponse.json({ error: 'Class section not found' }, { status: 404 });
    }

    // Check permissions: admin can update any, teacher can update their own classes
    if (user.role === 'admin') {
      // Admin can update any class
    } else if (user.role === 'teacher' && classSection.teachers.includes(user.userId)) {
      // Teacher can update their own classes
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const updates = { ...body };

    // Remove fields that shouldn't be updated by teachers
    if (user.role === 'teacher') {
      delete updates.teachers;
      delete updates.students;
      delete updates.department;
      delete updates.academicYear;
      delete updates.maxStudents;
      delete updates.createdBy;
    }

    // Validate students and teachers if being updated
    if (updates.teachers) {
      const teacherUsers = await User.find({ 
        _id: { $in: updates.teachers }, 
        role: 'teacher' 
      });
      if (teacherUsers.length !== updates.teachers.length) {
        return NextResponse.json(
          { error: 'Some selected teachers are invalid' },
          { status: 400 }
        );
      }
    }

    if (updates.students) {
      const studentUsers = await User.find({ 
        _id: { $in: updates.students }, 
        role: 'student' 
      });
      if (studentUsers.length !== updates.students.length) {
        return NextResponse.json(
          { error: 'Some selected students are invalid' },
          { status: 400 }
        );
      }

      if (updates.students.length > (updates.maxStudents || classSection.maxStudents)) {
        return NextResponse.json(
          { error: `Number of students cannot exceed maximum limit` },
          { status: 400 }
        );
      }
    }

    const updatedClass = await ClassSection.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('teachers', 'name email employeeId')
    .populate('students', 'name email studentId')
    .populate('createdBy', 'name email');

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error('Update class section error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update class section' },
      { status: 500 }
    );
  }
}

// DELETE /api/class-sections/[id] - Delete class section (admin only)
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

    await ClassSection.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Class section deleted successfully' });
  } catch (error: any) {
    console.error('Delete class section error:', error);
    return NextResponse.json(
      { error: 'Failed to delete class section' },
      { status: 500 }
    );
  }
}