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

// GET - Get user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Find existing user
    const existingUser = await User.findById(params.id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent updating admin users
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot modify admin users' },
        { status: 403 }
      );
    }

    // Check if email is being changed and if it already exists
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: userData.email.toLowerCase().trim(),
        _id: { $ne: params.id }
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (userData.name) updateData.name = userData.name.trim();
    if (userData.email) updateData.email = userData.email.toLowerCase().trim();
    if (userData.department !== undefined) updateData.department = userData.department?.trim();
    if (userData.isVerified !== undefined) updateData.isVerified = userData.isVerified;
    if (userData.studentId && existingUser.role === 'student') updateData.studentId = userData.studentId.trim();
    if (userData.employeeId && existingUser.role === 'teacher') updateData.employeeId = userData.employeeId.trim();

    // Handle password update
    if (userData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(userData.password, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update user error:', error);
    
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

// DELETE - Delete user
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

    // Find user
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Prevent deleting self
    if (user._id.toString() === admin._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 403 }
      );
    }

    // TODO: Check if user is enrolled in any classes and handle accordingly
    // For now, we'll allow deletion but in production you might want to:
    // 1. Remove user from all classes first
    // 2. Or prevent deletion if user is enrolled
    // 3. Or soft delete instead of hard delete

    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'User deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}