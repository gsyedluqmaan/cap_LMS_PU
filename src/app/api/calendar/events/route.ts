import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import CalendarEvent from '@/models/CalendarEvent';
import User from '@/models/User';

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
    return user || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const events = await CalendarEvent.find({ isActive: true })
      .populate('participants', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: events,
      total: events.length
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await verifyUserToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const eventData = await request.json();

    if (!eventData.title || !eventData.startDate || !eventData.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newEvent = new CalendarEvent({
      title: eventData.title,
      description: eventData.description || '',
      eventType: eventData.eventType,
      startDate: new Date(eventData.startDate),
      endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
      isAllDay: eventData.isAllDay || false,
      location: eventData.location || '',
      color: eventData.color || '#3b82f6',
      targetAudience: eventData.targetAudience || 'all',
      priority: eventData.priority || 'medium',
      isActive: true,
      createdBy: user._id,
      participants: eventData.participants || []
    });

    await newEvent.save();

    const populatedEvent = await CalendarEvent.findById(newEvent._id)
      .populate('participants', 'name email role')
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      message: 'Event created successfully',
      event: populatedEvent
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}