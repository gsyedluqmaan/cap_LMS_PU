import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
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

    const userData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate role
    if (!['student', 'teacher'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Role must be either student or teacher' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Generate ID based on role
    let generatedId = '';
    if (userData.role === 'student') {
      const lastStudent = await User.findOne({ role: 'student', studentId: { $exists: true } })
        .sort({ studentId: -1 })
        .limit(1);
      
      const lastStudentNumber = lastStudent?.studentId ? 
        parseInt(lastStudent.studentId.replace(/\D/g, '')) : 0;
      generatedId = `STU${(lastStudentNumber + 1).toString().padStart(4, '0')}`;
    } else {
      const lastTeacher = await User.findOne({ role: 'teacher', employeeId: { $exists: true } })
        .sort({ employeeId: -1 })
        .limit(1);
      
      const lastEmployeeNumber = lastTeacher?.employeeId ? 
        parseInt(lastTeacher.employeeId.replace(/\D/g, '')) : 0;
      generatedId = `EMP${(lastEmployeeNumber + 1).toString().padStart(4, '0')}`;
    }

    // Create user object
    const newUserData = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role,
      university: userData.university || 'Presidency University',
      department: userData.department?.trim(),
      isVerified: userData.isVerified !== undefined ? userData.isVerified : true
    };

    // Add role-specific ID
    if (userData.role === 'student') {
      newUserData.studentId = userData.studentId || generatedId;
    } else {
      newUserData.employeeId = userData.employeeId || generatedId;
    }

    // Create user
    const newUser = new User(newUserData);
    await newUser.save();

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      university: newUser.university,
      department: newUser.department,
      studentId: newUser.studentId,
      employeeId: newUser.employeeId,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return NextResponse.json({
      message: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} created successfully`,
      user: userResponse
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors)[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}