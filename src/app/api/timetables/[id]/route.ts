import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Timetable from '@/models/Timetable';
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

// GET - Get a single timetable by ID
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
        { error: 'Invalid timetable ID' },
        { status: 400 }
      );
    }

    const timetable = await Timetable.findById(id)
      .populate('classSection', 'className classCode department')
      .populate('slots.teacher', 'name email')
      .populate('slots.room', 'roomNumber roomName building')
      .populate('generatedBy', 'name email');

    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: timetable }, { status: 200 });

  } catch (error: any) {
    console.error('Get timetable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a timetable (admin only)
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
        { error: 'Invalid timetable ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      effectiveFrom,
      effectiveTo,
      slots,
      isActive
    } = body;

    const timetable = await Timetable.findById(id);

    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // If slots are being updated, validate and check conflicts
    if (slots && slots.length > 0) {
      for (const slot of slots) {
        if (!slot.day || !slot.startTime || !slot.endTime || !slot.subject || !slot.teacher || !slot.room) {
          return NextResponse.json(
            { error: 'Each slot must have day, startTime, endTime, subject, teacher, and room' },
            { status: 400 }
          );
        }

        // Check teacher conflict (excluding current timetable)
        const teacherConflict = await Timetable.checkTeacherConflict(
          slot.teacher,
          slot.day,
          slot.startTime,
          slot.endTime,
          id
        );

        if (teacherConflict.conflict) {
          return NextResponse.json(
            { error: `Teacher conflict: ${teacherConflict.message}` },
            { status: 400 }
          );
        }

        // Check room conflict (excluding current timetable)
        const roomConflict = await Timetable.checkRoomConflict(
          slot.room,
          slot.day,
          slot.startTime,
          slot.endTime,
          id
        );

        if (roomConflict.conflict) {
          return NextResponse.json(
            { error: `Room conflict: ${roomConflict.message}` },
            { status: 400 }
          );
        }
      }
      timetable.slots = slots;
    }

    // Update fields
    if (effectiveFrom !== undefined) timetable.effectiveFrom = effectiveFrom;
    if (effectiveTo !== undefined) timetable.effectiveTo = effectiveTo;
    if (isActive !== undefined) timetable.isActive = isActive;
    timetable.lastModifiedBy = admin._id;

    await timetable.save();

    const updatedTimetable = await Timetable.findById(id)
      .populate('classSection', 'className classCode department')
      .populate('slots.teacher', 'name email')
      .populate('slots.room', 'roomNumber roomName building')
      .populate('generatedBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    return NextResponse.json(
      { message: 'Timetable updated successfully', data: updatedTimetable },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update timetable error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a timetable (admin only)
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
        { error: 'Invalid timetable ID' },
        { status: 400 }
      );
    }

    const timetable = await Timetable.findById(id);

    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    await Timetable.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Timetable deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete timetable error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
