import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import User from '@/models/User';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
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

// POST - Add students to class
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs are required' },
        { status: 400 }
      );
    }

    // Find the class
    const classDoc = await Class.findById(params.id);
    if (!classDoc) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Verify all students exist and have student role
    const students = await User.find({ 
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students are invalid' },
        { status: 400 }
      );
    }

    // Check if adding students would exceed maxStudents
    const newStudentIds = studentIds.filter(id => !classDoc.students.includes(id));
    const newTotalStudents = classDoc.students.length + newStudentIds.length;

    if (newTotalStudents > classDoc.maxStudents) {
      return NextResponse.json(
        { error: `Cannot exceed maximum students limit of ${classDoc.maxStudents}` },
        { status: 400 }
      );
    }

    // Add students to class (avoid duplicates)
    classDoc.students = [...new Set([...classDoc.students, ...studentIds])];
    await classDoc.save();

    // Populate and return updated class
    await classDoc.populate([
      { path: 'teacher', select: 'name email employeeId department' },
      { path: 'students', select: 'name email studentId department' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return NextResponse.json({
      message: 'Students added successfully',
      class: classDoc
    }, { status: 200 });

  } catch (error: any) {
    console.error('Add students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove students from class
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs are required' },
        { status: 400 }
      );
    }

    // Find the class
    const classDoc = await Class.findById(params.id);
    if (!classDoc) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Remove students from class
    classDoc.students = classDoc.students.filter(
      studentId => !studentIds.includes(studentId.toString())
    );
    await classDoc.save();

    // Populate and return updated class
    await classDoc.populate([
      { path: 'teacher', select: 'name email employeeId department' },
      { path: 'students', select: 'name email studentId department' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return NextResponse.json({
      message: 'Students removed successfully',
      class: classDoc
    }, { status: 200 });

  } catch (error: any) {
    console.error('Remove students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}