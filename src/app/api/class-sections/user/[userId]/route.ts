import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import ClassSection from '@/models/ClassSection';

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

// GET /api/class-sections/user/[userId] - Get class sections for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'student' | 'teacher' | null;

    // Users can only access their own data unless admin
    if (user.role !== 'admin' && user.userId !== params.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let filter: any = {};

    if (role === 'student') {
      filter.students = { $in: [params.userId] };
    } else if (role === 'teacher') {
      filter.teachers = { $in: [params.userId] };
    } else {
      // If no role specified, get both student and teacher classes
      filter.$or = [
        { students: { $in: [params.userId] } },
        { teachers: { $in: [params.userId] } }
      ];
    }

    // Only active classes
    filter.isActive = true;

    const classes = await ClassSection.find(filter)
      .populate('teachers', 'name email employeeId')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error('Get user classes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user classes' },
      { status: 500 }
    );
  }
}