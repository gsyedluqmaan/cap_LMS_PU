import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import CalendarEvent from '@/models/CalendarEvent';
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

// Helper function to verify any user token
async function verifyUserToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
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

// GET /api/calendar/events/[id] - Get event by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    const event = await CalendarEvent.findById(params.id)
      .populate('participants', 'name email role')
      .populate('specificClasses', 'name courseCode department')
      .populate('createdBy', 'name email');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/events/[id] - Update event (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const eventData = await request.json();

    const existingEvent = await CalendarEvent.findById(params.id);
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      params.id,
      eventData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'participants', select: 'name email role' },
      { path: 'specificClasses', select: 'name courseCode department' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent
    }, { status: 200 });
  } catch (error: any) {
    console.error('Update event error:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors)[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/events/[id] - Delete event (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const event = await CalendarEvent.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    await CalendarEvent.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Event deleted successfully'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}