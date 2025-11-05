import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  eventType: 'exam' | 'holiday' | 'assignment' | 'class' | 'meeting' | 'other';
  startDate: Date;
  endDate?: Date;
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  participants: mongoose.Types.ObjectId[];
  targetAudience: 'all' | 'students' | 'teachers' | 'specific';
  specificClasses?: mongoose.Types.ObjectId[];
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    eventType: {
      type: String,
      enum: ['exam', 'holiday', 'assignment', 'class', 'meeting', 'other'],
      default: 'other',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: ICalendarEvent, endDate: Date) {
          return !endDate || endDate >= this.startDate;
        },
        message: 'End date must be after or equal to start date',
      },
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    color: {
      type: String,
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      default: '#3b82f6',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      interval: {
        type: Number,
        min: 1,
        max: 365,
      },
      endDate: Date,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'specific'],
      default: 'all',
    },
    specificClasses: [{
      type: Schema.Types.ObjectId,
      ref: 'ClassSection',
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
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
CalendarEventSchema.index({ startDate: 1, endDate: 1 });
CalendarEventSchema.index({ eventType: 1 });
CalendarEventSchema.index({ targetAudience: 1 });
CalendarEventSchema.index({ isActive: 1 });
CalendarEventSchema.index({ createdBy: 1 });
CalendarEventSchema.index({ participants: 1 });

// Validate recurring pattern
CalendarEventSchema.pre('save', function(next) {
  if (this.isRecurring && !this.recurringPattern) {
    throw new Error('Recurring pattern is required for recurring events');
  }
  
  if (this.isRecurring && this.recurringPattern?.endDate && this.recurringPattern.endDate <= this.startDate) {
    throw new Error('Recurring end date must be after event start date');
  }
  
  next();
});

// Validate target audience and specific classes
CalendarEventSchema.pre('save', function(next) {
  if (this.targetAudience === 'specific' && (!this.specificClasses || this.specificClasses.length === 0)) {
    throw new Error('Specific classes must be selected when target audience is "specific"');
  }
  
  next();
});

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);