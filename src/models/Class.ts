import mongoose, { Schema, Document } from 'mongoose';

export interface IOnlineClass extends Document {
  name: string;
  description?: string;
  classCode: string;
  classType: 'lecture' | 'workshop' | 'seminar' | 'meeting' | 'other';
  subject?: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  maxStudents?: number;
  currentEnrollment: number;
  schedule: {
    date: Date;
    startTime: string;
    endTime: string;
    timezone?: string;
    isRecurring: boolean;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
      daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    };
  };
  meetingDetails: {
    platform: 'zoom' | 'meet' | 'teams' | 'other';
    meetingLink?: string;
    meetingId?: string;
    password?: string;
    dialInNumber?: string;
  };
  materials?: {
    title: string;
    url: string;
    type: 'document' | 'video' | 'link' | 'other';
  }[];
  isActive: boolean;
  isLive: boolean;
  recordingAvailable: boolean;
  recordingLink?: string;
  attendance: {
    student: mongoose.Types.ObjectId;
    joinedAt?: Date;
    leftAt?: Date;
    duration?: number;
    status: 'present' | 'absent' | 'late';
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OnlineClassSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    classCode: {
      type: String,
      required: [true, 'Class code is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    classType: {
      type: String,
      enum: ['lecture', 'workshop', 'seminar', 'meeting', 'other'],
      default: 'lecture',
    },
    subject: {
      type: String,
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    maxStudents: {
      type: Number,
      min: 1,
      max: 500,
      default: 100,
    },
    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0,
    },
    schedule: {
      date: {
        type: Date,
        required: [true, 'Class date is required'],
      },
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
      timezone: {
        type: String,
        default: 'UTC',
      },
      isRecurring: {
        type: Boolean,
        default: false,
      },
      recurringPattern: {
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
        },
        interval: {
          type: Number,
          min: 1,
        },
        endDate: Date,
        daysOfWeek: [{
          type: Number,
          min: 0,
          max: 6,
        }],
      },
    },
    meetingDetails: {
      platform: {
        type: String,
        enum: ['zoom', 'meet', 'teams', 'other'],
        required: [true, 'Meeting platform is required'],
      },
      meetingLink: {
        type: String,
        trim: true,
      },
      meetingId: {
        type: String,
        trim: true,
      },
      password: {
        type: String,
        trim: true,
      },
      dialInNumber: {
        type: String,
        trim: true,
      },
    },
    materials: [{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      url: {
        type: String,
        required: true,
        trim: true,
      },
      type: {
        type: String,
        enum: ['document', 'video', 'link', 'other'],
        default: 'document',
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    recordingAvailable: {
      type: Boolean,
      default: false,
    },
    recordingLink: {
      type: String,
      trim: true,
    },
    attendance: [{
      student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      joinedAt: Date,
      leftAt: Date,
      duration: Number, // in minutes
      status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'absent',
      },
    }],
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
OnlineClassSchema.index({ classCode: 1 });
OnlineClassSchema.index({ teacher: 1 });
OnlineClassSchema.index({ 'schedule.date': 1 });
OnlineClassSchema.index({ isActive: 1 });
OnlineClassSchema.index({ isLive: 1 });
OnlineClassSchema.index({ classType: 1 });

// Generate unique class code
OnlineClassSchema.pre('save', async function(next) {
  if (this.isNew && !this.classCode) {
    const count = await mongoose.model('OnlineClass').countDocuments();
    this.classCode = `CLS${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Validate teacher role
OnlineClassSchema.pre('save', async function(next) {
  if (this.isModified('teacher')) {
    const User = mongoose.model('User');
    const teacher = await User.findById(this.teacher);
    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Assigned teacher must have teacher role');
    }
  }
  next();
});

// Validate students roles and update current enrollment
OnlineClassSchema.pre('save', async function(next) {
  if (this.isModified('students')) {
    const User = mongoose.model('User');
    const students = await User.find({ _id: { $in: this.students } });
    const invalidStudents = students.filter(student => student.role !== 'student');
    if (invalidStudents.length > 0) {
      throw new Error('All assigned users must have student role');
    }
    
    // Update current enrollment
    this.currentEnrollment = this.students.length;
    
    // Check enrollment limit
    if (this.currentEnrollment > this.maxStudents) {
      throw new Error(`Enrollment cannot exceed maximum of ${this.maxStudents} students`);
    }
  }
  next();
});

// Validate schedule times
OnlineClassSchema.pre('save', function(next) {
  if (this.schedule && this.schedule.startTime && this.schedule.endTime) {
    const start = new Date(`2000-01-01T${this.schedule.startTime}:00`);
    const end = new Date(`2000-01-01T${this.schedule.endTime}:00`);
    
    if (start >= end) {
      throw new Error('End time must be after start time');
    }
  }
  next();
});

export default mongoose.models.OnlineClass || mongoose.model<IOnlineClass>('OnlineClass', OnlineClassSchema);
