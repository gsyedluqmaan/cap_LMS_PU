import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Timetable from '@/models/Timetable';
import ClassSection from '@/models/ClassSection';
import Room from '@/models/Room';
import User from '@/models/User';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  // Check both cookie and authorization header
  const cookieToken = request.cookies.get('authToken')?.value;
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  const token = cookieToken || headerToken;
  
  if (!token) {
    return null;
  }

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

// Time slots configuration (9 AM to 5 PM with 1-hour slots)
const TIME_SLOTS = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' }, // Lunch break typically skipped
  { startTime: '13:00', endTime: '14:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface SlotAssignment {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: any;
  room: any;
  sessionType: string;
}

// Helper to check if a time slot is available for a teacher
function isTeacherAvailable(
  teacherId: string,
  day: string,
  startTime: string,
  endTime: string,
  existingSlots: SlotAssignment[]
): boolean {
  return !existingSlots.some(slot => 
    slot.teacher._id.toString() === teacherId.toString() &&
    slot.day === day &&
    slot.startTime === startTime &&
    slot.endTime === endTime
  );
}

// Helper to check if a room is available
function isRoomAvailable(
  roomId: string,
  day: string,
  startTime: string,
  endTime: string,
  existingSlots: SlotAssignment[]
): boolean {
  return !existingSlots.some(slot => 
    slot.room._id.toString() === roomId.toString() &&
    slot.day === day &&
    slot.startTime === startTime &&
    slot.endTime === endTime
  );
}

// POST - Generate timetables for all classes (admin only)
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

    const body = await request.json();
    const {
      academicYear,
      semester,
      effectiveFrom,
      effectiveTo,
      classSectionIds // Optional: generate for specific classes only
    } = body;

    if (!academicYear || !semester || !effectiveFrom) {
      return NextResponse.json(
        { error: 'Missing required fields: academicYear, semester, effectiveFrom' },
        { status: 400 }
      );
    }

    // Get class sections to generate timetables for
    let classSectionsQuery: any = { isActive: true };
    if (classSectionIds && classSectionIds.length > 0) {
      classSectionsQuery._id = { $in: classSectionIds };
    }

    const classSections = await ClassSection.find(classSectionsQuery)
      .populate('subjects.teacher', 'name email')
      .populate('theoryRoom')
      .populate('labRoom')
      .populate('students', 'name');

    if (classSections.length === 0) {
      return NextResponse.json(
        { error: 'No active class sections found' },
        { status: 404 }
      );
    }

    // Get all available rooms
    const rooms = await Room.find({ isActive: true });
    if (rooms.length === 0) {
      return NextResponse.json(
        { error: 'No active rooms found. Please add rooms first.' },
        { status: 400 }
      );
    }

    const labRooms = rooms.filter(r => r.roomType === 'lab');
    const theoryRooms = rooms.filter(r => r.roomType !== 'lab');

    // Track all assigned slots globally to avoid conflicts
    const globalSlots: SlotAssignment[] = [];
    const generatedTimetables: any[] = [];
    const errors: string[] = [];

    // Generate timetable for each class section
    for (const classSection of classSections) {
      try {
        const slots: SlotAssignment[] = [];

        // Process each subject
        for (const subjectTeacher of classSection.subjects) {
          const hoursNeeded = subjectTeacher.hoursPerWeek;
          const sessionType = subjectTeacher.sessionType;
          let hoursAssigned = 0;

          // Determine which rooms to use based on session type
          const availableRooms = sessionType === 'lab' ? labRooms : theoryRooms;
          
          // Prefer assigned rooms if available
          let preferredRoom = null;
          if (sessionType === 'lab' && classSection.labRoom) {
            preferredRoom = classSection.labRoom;
          } else if (sessionType === 'theory' && classSection.theoryRoom) {
            preferredRoom = classSection.theoryRoom;
          }

          if (availableRooms.length === 0) {
            errors.push(`No ${sessionType} rooms available for ${classSection.className} - ${subjectTeacher.subject}`);
            continue;
          }

          // Try to assign time slots
          outerLoop: for (const day of DAYS) {
            for (const timeSlot of TIME_SLOTS) {
              // Skip lunch hour (12:00-13:00)
              if (timeSlot.startTime === '12:00') continue;

              if (hoursAssigned >= hoursNeeded) break outerLoop;

              // Check if teacher is available (only check against global slots, not current class slots)
              if (!isTeacherAvailable(
                subjectTeacher.teacher._id,
                day,
                timeSlot.startTime,
                timeSlot.endTime,
                globalSlots  // Only check global conflicts, not within same class
              )) {
                continue;
              }

              // Try preferred room first, then other rooms
              let assignedRoom = null;
              
              if (preferredRoom && isRoomAvailable(
                preferredRoom._id,
                day,
                timeSlot.startTime,
                timeSlot.endTime,
                globalSlots  // Only check global conflicts, not within same class
              )) {
                assignedRoom = preferredRoom;
              } else {
                // Find any available room
                for (const room of availableRooms) {
                  if (room.seatingCapacity >= classSection.currentEnrollment &&
                      isRoomAvailable(
                        room._id,
                        day,
                        timeSlot.startTime,
                        timeSlot.endTime,
                        globalSlots  // Only check global conflicts, not within same class
                      )) {
                    assignedRoom = room;
                    break;
                  }
                }
              }

              if (assignedRoom) {
                const slot: SlotAssignment = {
                  day,
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                  subject: subjectTeacher.subject,
                  teacher: subjectTeacher.teacher,
                  room: assignedRoom,
                  sessionType
                };
                slots.push(slot);
                hoursAssigned++;
              }
            }
          }

          if (hoursAssigned < hoursNeeded) {
            errors.push(
              `Could not assign all hours for ${classSection.className} - ${subjectTeacher.subject}. ` +
              `Assigned ${hoursAssigned}/${hoursNeeded} hours.`
            );
          }
        }

        if (slots.length === 0) {
          errors.push(`No slots could be generated for ${classSection.className}`);
          continue;
        }

        // Create timetable
        const timetable = await Timetable.create({
          classSection: classSection._id,
          academicYear,
          semester,
          effectiveFrom,
          effectiveTo,
          slots: slots.map(slot => ({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subject: slot.subject,
            teacher: slot.teacher._id,
            room: slot.room._id,
            sessionType: slot.sessionType
          })),
          isActive: true,
          generatedBy: admin._id,
          generatedAt: new Date(),
        });

        const populatedTimetable = await Timetable.findById(timetable._id)
          .populate('classSection', 'className classCode department')
          .populate('slots.teacher', 'name email')
          .populate('slots.room', 'roomNumber roomName building')
          .populate('generatedBy', 'name email');

        generatedTimetables.push(populatedTimetable);

        // Add slots to global tracking
        globalSlots.push(...slots);

      } catch (error: any) {
        errors.push(`Error generating timetable for ${classSection.className}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: `Successfully generated ${generatedTimetables.length} timetable(s)`,
      data: {
        timetables: generatedTimetables,
        warnings: errors.length > 0 ? errors : undefined,
        summary: {
          total: classSections.length,
          generated: generatedTimetables.length,
          failed: classSections.length - generatedTimetables.length
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Generate timetable error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
