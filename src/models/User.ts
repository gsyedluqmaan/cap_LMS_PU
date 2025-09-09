import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  university: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      default: 'Presidency University',
    },
    department: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
      sparse: true, // Allows null values for non-students
    },
    employeeId: {
      type: String,
      trim: true,
      sparse: true, // Allows null values for non-employees
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ studentId: 1 }, { sparse: true });
UserSchema.index({ employeeId: 1 }, { sparse: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
