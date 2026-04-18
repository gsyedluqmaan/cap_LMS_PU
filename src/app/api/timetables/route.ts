import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Timetable from "@/models/Timetable";
import ClassSection from "@/models/ClassSection";
import User from "@/models/User";
import mongoose from "mongoose";

// Import Room model to ensure it's registered with Mongoose
// This MUST be imported before any populate operations on Room references
import "@/models/Room";

// Helper function to verify token and get user
async function verifyToken(request: NextRequest) {
  // Check both cookie and authorization header
  const cookieToken = request.cookies.get("authToken")?.value;
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as any;
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

// GET - Get timetables (role-based access)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify user is authenticated
    const user = await verifyToken(request);
    console.log(user);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classSectionId = searchParams.get("classSection");
    const academicYear = searchParams.get("academicYear");
    const semester = searchParams.get("semester");

    let query: any = { isActive: true };

    if (user.role === "admin") {
      // Admin can see all timetables or filter by classSection
      if (classSectionId) {
        if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
          return NextResponse.json(
            { error: "Invalid class section ID" },
            { status: 400 }
          );
        }
        query.classSection = classSectionId;
      }

      if (academicYear) {
        query.academicYear = academicYear;
      }

      if (semester) {
        query.semester = semester;
      }

      const timetables = await Timetable.find(query)
        .populate("classSection", "className classCode department")
        .populate("slots.teacher", "name email")
        .populate("slots.room", "roomNumber roomName building")
        .populate("generatedBy", "name email")
        .sort({ createdAt: -1 });

      return NextResponse.json({ data: timetables }, { status: 200 });
    } else if (user.role === "teacher") {
      // Teacher can see timetables where they teach
      // Find all class sections where this teacher teaches
      const classSections = await ClassSection.find({
        "subjects.teacher": user._id,
        isActive: true,
      }).select("_id");

      const classSectionIds = classSections.map((cs) => cs._id);

      query["$or"] = [
        { classSection: { $in: classSectionIds } },
        { "slots.teacher": user._id },
      ];

      if (academicYear) {
        query.academicYear = academicYear;
      }

      if (semester) {
        query.semester = semester;
      }

      const timetables = await Timetable.find(query)
        .populate("classSection", "className classCode department")
        .populate("slots.teacher", "name email")
        .populate("slots.room", "roomNumber roomName building")
        .sort({ createdAt: -1 });

      // Aggregate all slots where teacher is teaching
      const allSlots: any[] = [];
      const classSectionMap = new Map();

      for (const timetable of timetables) {
        for (const slot of timetable.slots) {
          if (slot.teacher.toString() === user._id.toString()) {
            allSlots.push({
              ...slot,
              classSection: timetable.classSection,
              academicYear: timetable.academicYear,
              semester: timetable.semester,
            });

            if (!classSectionMap.has(timetable.classSection._id.toString())) {
              classSectionMap.set(
                timetable.classSection._id.toString(),
                timetable.classSection
              );
            }
          }
        }
      }

      return NextResponse.json(
        {
          data: {
            aggregatedView: true,
            slots: allSlots,
            classSections: Array.from(classSectionMap.values()),
            timetables: timetables,
          },
        },
        { status: 200 }
      );
    } else if (user.role === "student") {
      // Student can see timetable of their class
      // Find the class section the student belongs to
      console.log("Looking for student with ID:", user._id);
      console.log("User ID as string:", user._id.toString());
      
      // First, let's see all class sections
      const allSections = await ClassSection.find({ isActive: true });
      console.log("Total active class sections:", allSections.length);
      
      for (const section of allSections) {
        console.log(`Section ${section.classCode}:`, {
          students: section.students,
          studentCount: section.students.length,
          studentsAsStrings: section.students.map((s: any) => s.toString())
        });
      }
      
      // Try to find with string comparison
      const classSection = await ClassSection.findOne({
        students: user._id,
        isActive: true
      });

      console.log("Student's class section found:", classSection);

      if (!classSection) {
        return NextResponse.json(
          {
            data: {
              message: "You are not enrolled in any class section",
              timetables: [],
            },
          },
          { status: 200 }
        );
      }

      query.classSection = classSection._id;

      if (academicYear) {
        query.academicYear = academicYear;
      }

      if (semester) {
        query.semester = semester;
      }

      const timetables = await Timetable.find(query)
        .populate("classSection", "className classCode department")
        .populate("slots.teacher", "name email")
        .populate("slots.room", "roomNumber roomName building")
        .sort({ createdAt: -1 });

      return NextResponse.json(
        {
          data: {
            classSection,
            timetables,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
  } catch (error: any) {
    console.error("Get timetables error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new timetable (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin access
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      classSection,
      academicYear,
      semester,
      effectiveFrom,
      effectiveTo,
      slots,
    } = body;

    // Validate required fields
    if (
      !classSection ||
      !academicYear ||
      !semester ||
      !effectiveFrom ||
      !slots ||
      slots.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(classSection)) {
      return NextResponse.json(
        { error: "Invalid class section ID" },
        { status: 400 }
      );
    }

    // Check if class section exists
    const classSectionDoc = await ClassSection.findById(classSection);
    if (!classSectionDoc) {
      return NextResponse.json(
        { error: "Class section not found" },
        { status: 404 }
      );
    }

    // Validate and check conflicts for each slot
    for (const slot of slots) {
      if (
        !slot.day ||
        !slot.startTime ||
        !slot.endTime ||
        !slot.subject ||
        !slot.teacher ||
        !slot.room
      ) {
        return NextResponse.json(
          {
            error:
              "Each slot must have day, startTime, endTime, subject, teacher, and room",
          },
          { status: 400 }
        );
      }

      // Check teacher conflict
      const teacherConflict = await Timetable.checkTeacherConflict(
        slot.teacher,
        slot.day,
        slot.startTime,
        slot.endTime
      );

      if (teacherConflict.conflict) {
        return NextResponse.json(
          { error: `Teacher conflict: ${teacherConflict.message}` },
          { status: 400 }
        );
      }

      // Check room conflict
      const roomConflict = await Timetable.checkRoomConflict(
        slot.room,
        slot.day,
        slot.startTime,
        slot.endTime
      );

      if (roomConflict.conflict) {
        return NextResponse.json(
          { error: `Room conflict: ${roomConflict.message}` },
          { status: 400 }
        );
      }
    }

    // Create new timetable
    const timetable = await Timetable.create({
      classSection,
      academicYear,
      semester,
      effectiveFrom,
      effectiveTo,
      slots,
      isActive: true,
      generatedBy: admin._id,
      generatedAt: new Date(),
    });

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate("classSection", "className classCode department")
      .populate("slots.teacher", "name email")
      .populate("slots.room", "roomNumber roomName building")
      .populate("generatedBy", "name email");

    return NextResponse.json(
      { message: "Timetable created successfully", data: populatedTimetable },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create timetable error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
