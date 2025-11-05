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

// POST /api/class-sections/[id]/students - Add students to class section
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

    const { studentIds } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      );
    }

    // Validate students exist and have student role
    const students = await User.find({ 
      _id: { $in: studentIds }, 
      role: 'student' 
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some selected students are invalid' },
        { status: 400 }
      );
    }

    // Check for duplicates and capacity
    const newStudents = studentIds.filter(id => !classSection.students.includes(id));
    const totalAfterAdding = classSection.students.length + newStudents.length;

    if (totalAfterAdding > classSection.maxStudents) {
      return NextResponse.json(
        { error: `Adding these students would exceed maximum capacity of ${classSection.maxStudents}` },
        { status: 400 }
      );
    }

    // Add new students
    classSection.students.push(...newStudents);
    await classSection.save();

    const updatedClass = await ClassSection.findById(params.id)
      .populate('teachers', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email');

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error('Add students error:', error);
    return NextResponse.json(
      { error: 'Failed to add students to class section' },
      { status: 500 }
    );
  }
}

// DELETE /api/class-sections/[id]/students - Remove students from class section
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

    const { studentIds } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      );
    }

    // Remove students
    classSection.students = classSection.students.filter(
      (studentId: any) => !studentIds.includes(studentId.toString())
    );

    await classSection.save();

    const updatedClass = await ClassSection.findById(params.id)
      .populate('teachers', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email');

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error('Remove students error:', error);
    return NextResponse.json(
      { error: 'Failed to remove students from class section' },
      { status: 500 }
    );
  }
}