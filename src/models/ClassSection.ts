import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectTeacher {
  subject: string;
  teacher: mongoose.Types.ObjectId;
  hoursPerWeek: number;
  sessionType: 'theory' | 'lab' | 'practical' | 'tutorial';
}

export interface IClassSection extends Document {
  className: string;
  classCode: string;
  description?: string;
  subjects: ISubjectTeacher[];
  department: string;
  semester?: string;
  academicYear: string;
  students: mongoose.Types.ObjectId[];
  maxStudents: number;
  currentEnrollment: number;
  theoryRoom?: mongoose.Types.ObjectId;
  labRoom?: mongoose.Types.ObjectId;
  schedule: {
    days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
    startTime: string;
    endTime: string;
    room?: string;
    building?: string;
  }[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectTeacherSchema = new Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
  },
  hoursPerWeek: {
    type: Number,
    required: [true, 'Hours per week is required'],
    min: [1, 'Hours per week must be at least 1'],
    max: [20, 'Hours per week cannot exceed 20'],
  },
  sessionType: {
    type: String,
    enum: ['theory', 'lab', 'practical', 'tutorial'],
    default: 'theory',
    required: [true, 'Session type is required'],
  },
}, { _id: false });

const ClassSectionSchema: Schema = new Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    classCode: {
      type: String,
      required: [true, 'Class code is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subjects: [SubjectTeacherSchema],
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: async function(studentId: mongoose.Types.ObjectId) {
          const User = mongoose.model('User');
          const student = await User.findById(studentId);
          return student && student.role === 'student';
        },
        message: 'All assigned users must have student role'
      }
    }],
    maxStudents: {
      type: Number,
      required: [true, 'Maximum students limit is required'],
      min: [1, 'Maximum students must be at least 1'],
      max: [200, 'Maximum students cannot exceed 200'],
      default: 50,
    },
    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0,
    },
    theoryRoom: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    labRoom: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    schedule: [{
      days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      }],
      startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
      endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
      room: {
        type: String,
        trim: true,
      },
      building: {
        type: String,
        trim: true,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
// classCode index already created by unique: true
ClassSectionSchema.index({ department: 1 });
ClassSectionSchema.index({ academicYear: 1 });
ClassSectionSchema.index({ isActive: 1 });
ClassSectionSchema.index({ 'subjects.teacher': 1 });
ClassSectionSchema.index({ 'students': 1 });
ClassSectionSchema.index({ theoryRoom: 1 });
ClassSectionSchema.index({ labRoom: 1 });

// Generate unique class code if not provided
ClassSectionSchema.pre('save', async function(next) {
  if (this.isNew && !this.classCode) {
    const count = await mongoose.model('ClassSection').countDocuments();
    this.classCode = `CLS${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Update current enrollment when students array changes
ClassSectionSchema.pre('save', function(next) {
  if (this.isModified('students')) {
    (this as any).currentEnrollment = (this as any).students.length;
    
    // Check enrollment limit
    if ((this as any).currentEnrollment > (this as any).maxStudents) {
      throw new Error(`Enrollment cannot exceed maximum of ${(this as any).maxStudents} students`);
    }
  }
  next();
});

// Validate schedule times
ClassSectionSchema.pre('save', function(next) {
  if ((this as any).schedule && (this as any).schedule.length > 0) {
    for (const scheduleItem of (this as any).schedule) {
      if (scheduleItem.startTime && scheduleItem.endTime) {
        const start = new Date(`2000-01-01T${scheduleItem.startTime}:00`);
        const end = new Date(`2000-01-01T${scheduleItem.endTime}:00`);
        
        if (start >= end) {
          throw new Error('End time must be after start time');
        }
      }
    }
  }
  next();
});

// Virtual for formatted schedule
ClassSectionSchema.virtual('formattedSchedule').get(function() {
  return (this as any).schedule.map((item: any) => ({
    ...item,
    timeRange: `${item.startTime} - ${item.endTime}`,
    daysString: item.days.join(', '),
    location: item.room && item.building ? `${item.room}, ${item.building}` : item.room || item.building || 'TBA'
  }));
});

// Ensure virtual fields are serialised
ClassSectionSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.ClassSection || mongoose.model<IClassSection>('ClassSection', ClassSectionSchema);