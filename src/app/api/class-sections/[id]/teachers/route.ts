import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import ClassSection from "@/models/ClassSection";
import User from "@/models/User";

// Import Room model as side effect to ensure it's registered
import "@/models/Room";

interface DecodedToken {
  userId: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

const verifyToken = (request: NextRequest): DecodedToken | null => {
  try {
    const token =
      request.cookies.get("authToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return null;

    return jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key",
    ) as DecodedToken;
  } catch {
    return null;
  }
};

// POST /api/class-sections/[id]/teachers - Add subject with teacher to class section
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();

    const classSection = await ClassSection.findById(params.id);
    if (!classSection) {
      return NextResponse.json(
        { error: "Class section not found" },
        { status: 404 },
      );
    }

    const { subjects } = await request.json();

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        {
          error:
            "Subjects array is required with format: [{subject, teacher, hoursPerWeek, sessionType}]",
        },
        { status: 400 },
      );
    }

    // Validate teachers exist and have teacher role
    const teacherIds = subjects.map((s: any) => s.teacher);
    const teachers = await User.find({
      _id: { $in: teacherIds },
      role: "teacher",
    });

    if (teachers.length !== teacherIds.length) {
      return NextResponse.json(
        { error: "Some selected teachers are invalid" },
        { status: 400 },
      );
    }

    // Add new subjects (avoid duplicates based on subject name and teacher)
    for (const newSubject of subjects) {
      const exists = classSection.subjects.some(
        (s: any) =>
          s.subject === newSubject.subject &&
          s.teacher.toString() === newSubject.teacher,
      );
      if (!exists) {
        classSection.subjects.push(newSubject);
      }
    }

    await classSection.save();

    const updatedClass = await ClassSection.findById(params.id)
      .populate("subjects.teacher", "name email employeeId")
      .populate("students", "name email studentId")
      .populate("createdBy", "name email")
      .populate("theoryRoom", "roomNumber roomName building")
      .populate("labRoom", "roomNumber roomName building");

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error("Add subjects error:", error);
    return NextResponse.json(
      { error: "Failed to add subjects to class section" },
      { status: 500 },
    );
  }
}

// DELETE /api/class-sections/[id]/teachers - Remove subjects by subject name or teacher from class section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();

    const classSection = await ClassSection.findById(params.id);
    if (!classSection) {
      return NextResponse.json(
        { error: "Class section not found" },
        { status: 404 },
      );
    }

    const { subjectNames, teacherIds } = await request.json();

    if (
      (!subjectNames || subjectNames.length === 0) &&
      (!teacherIds || teacherIds.length === 0)
    ) {
      return NextResponse.json(
        { error: "Either subjectNames or teacherIds array is required" },
        { status: 400 },
      );
    }

    // Remove subjects by name or teacher
    classSection.subjects = classSection.subjects.filter((s: any) => {
      const matchesSubject = subjectNames && subjectNames.includes(s.subject);
      const matchesTeacher =
        teacherIds && teacherIds.includes(s.teacher.toString());
      return !(matchesSubject || matchesTeacher);
    });

    await classSection.save();

    const updatedClass = await ClassSection.findById(params.id)
      .populate("subjects.teacher", "name email employeeId")
      .populate("students", "name email studentId")
      .populate("createdBy", "name email")
      .populate("theoryRoom", "roomNumber roomName building")
      .populate("labRoom", "roomNumber roomName building");

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error("Remove subjects error:", error);
    return NextResponse.json(
      { error: "Failed to remove subjects from class section" },
      { status: 500 },
    );
  }
}
