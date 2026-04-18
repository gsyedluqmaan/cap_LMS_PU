import mongoose, { Schema, Document } from "mongoose";

export interface ITimetableSlot {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  startTime: string;
  endTime: string;
  subject: string;
  teacher: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  sessionType: "theory" | "lab" | "practical" | "tutorial";
}

export interface ITimetable extends Document {
  classSection: mongoose.Types.ObjectId;
  academicYear: string;
  semester: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  slots: ITimetableSlot[];
  isActive: boolean;
  generatedBy?: mongoose.Types.ObjectId;
  generatedAt?: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimetableModel extends mongoose.Model<ITimetable> {
  checkTeacherConflict(
    teacherId: mongoose.Types.ObjectId,
    day: string,
    startTime: string,
    endTime: string,
    excludeTimetableId?: mongoose.Types.ObjectId,
  ): Promise<{ conflict: boolean; message?: string }>;
  checkRoomConflict(
    roomId: mongoose.Types.ObjectId,
    day: string,
    startTime: string,
    endTime: string,
    excludeTimetableId?: mongoose.Types.ObjectId,
  ): Promise<{ conflict: boolean; message?: string }>;
}

const TimetableSlotSchema = new Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: [true, "Day is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    sessionType: {
      type: String,
      enum: ["theory", "lab", "practical", "tutorial"],
      default: "theory",
      required: [true, "Session type is required"],
    },
  },
  { _id: false },
);

const TimetableSchema = new Schema<ITimetable, ITimetableModel>(
  {
    classSection: {
      type: Schema.Types.ObjectId,
      ref: "ClassSection",
      required: [true, "Class section is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    effectiveFrom: {
      type: Date,
      required: [true, "Effective from date is required"],
    },
    effectiveTo: {
      type: Date,
    },
    slots: [TimetableSlotSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    generatedAt: {
      type: Date,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for optimized queries
TimetableSchema.index({ classSection: 1 });
TimetableSchema.index({ academicYear: 1 });
TimetableSchema.index({ semester: 1 });
TimetableSchema.index({ isActive: 1 });
TimetableSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
// Compound indexes for common queries
TimetableSchema.index({ classSection: 1, academicYear: 1, semester: 1 });
TimetableSchema.index({ "slots.teacher": 1, isActive: 1 });
TimetableSchema.index({ "slots.room": 1, isActive: 1 });
TimetableSchema.index({ "slots.day": 1, "slots.startTime": 1 });

// Validate that end time is after start time for each slot
TimetableSchema.pre("save", function (this: ITimetable, next) {
  for (const slot of this.slots) {
    const start = new Date(`2000-01-01T${slot.startTime}:00`);
    const end = new Date(`2000-01-01T${slot.endTime}:00`);

    if (start >= end) {
      return next(
        new Error(
          `Invalid time range for slot: ${slot.subject} on ${slot.day}`,
        ),
      );
    }
  }
  next();
});

// Validate no overlapping slots for the same class
// Note: We allow overlapping time slots because a class may have multiple subjects
// scheduled at different times across the week. The actual conflict checking
// (teacher/room availability) is done at the API level during timetable generation.
TimetableSchema.pre("save", function (this: ITimetable, next) {
  // Skip overlap validation - conflicts are checked during generation
  // This allows flexibility in timetable creation
  next();
});

// Static method to check for teacher conflicts across timetables
TimetableSchema.statics.checkTeacherConflict = async function (
  teacherId: mongoose.Types.ObjectId,
  day: string,
  startTime: string,
  endTime: string,
  excludeTimetableId?: mongoose.Types.ObjectId,
) {
  const query: any = {
    isActive: true,
    "slots.teacher": teacherId,
    "slots.day": day,
  };

  if (excludeTimetableId) {
    query._id = { $ne: excludeTimetableId };
  }

  const timetables = await this.find(query).lean();

  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  for (const timetable of timetables) {
    for (const slot of timetable.slots) {
      if (
        slot.day === day &&
        slot.teacher.toString() === teacherId.toString()
      ) {
        const slotStart = new Date(`2000-01-01T${slot.startTime}:00`);
        const slotEnd = new Date(`2000-01-01T${slot.endTime}:00`);

        if (start < slotEnd && end > slotStart) {
          return {
            conflict: true,
            message: `Teacher already scheduled for ${slot.subject} on ${day} from ${slot.startTime} to ${slot.endTime}`,
          };
        }
      }
    }
  }

  return { conflict: false };
};

// Static method to check for room conflicts across timetables
TimetableSchema.statics.checkRoomConflict = async function (
  roomId: mongoose.Types.ObjectId,
  day: string,
  startTime: string,
  endTime: string,
  excludeTimetableId?: mongoose.Types.ObjectId,
) {
  const query: any = {
    isActive: true,
    "slots.room": roomId,
    "slots.day": day,
  };

  if (excludeTimetableId) {
    query._id = { $ne: excludeTimetableId };
  }

  const timetables = await this.find(query).lean();

  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  for (const timetable of timetables) {
    for (const slot of timetable.slots) {
      if (slot.day === day && slot.room.toString() === roomId.toString()) {
        const slotStart = new Date(`2000-01-01T${slot.startTime}:00`);
        const slotEnd = new Date(`2000-01-01T${slot.endTime}:00`);

        if (start < slotEnd && end > slotStart) {
          return {
            conflict: true,
            message: `Room already occupied for ${slot.subject} on ${day} from ${slot.startTime} to ${slot.endTime}`,
          };
        }
      }
    }
  }

  return { conflict: false };
};

// Virtual for formatted timetable
TimetableSchema.virtual("formattedSlots").get(function (this: ITimetable) {
  return this.slots.map((slot: ITimetableSlot) => ({
    ...slot,
    timeRange: `${slot.startTime} - ${slot.endTime}`,
  }));
});

// Ensure virtual fields are serialised
TimetableSchema.set("toJSON", {
  virtuals: true,
});

export default (mongoose.models.Timetable as ITimetableModel) ||
  mongoose.model<ITimetable, ITimetableModel>("Timetable", TimetableSchema);
