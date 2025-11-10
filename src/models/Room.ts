import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  roomName: string;
  roomType: 'lab' | 'classroom' | 'lecture-hall' | 'seminar-room' | 'auditorium';
  building: string;
  floor?: string;
  seatingCapacity: number;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasComputers: boolean;
  computerCount?: number;
  hasAC: boolean;
  hasWifi: boolean;
  facilities: string[];
  isActive: boolean;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    roomName: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['lab', 'classroom', 'lecture-hall', 'seminar-room', 'auditorium'],
      required: [true, 'Room type is required'],
      default: 'classroom',
    },
    building: {
      type: String,
      required: [true, 'Building is required'],
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Seating capacity must be at least 1'],
      max: [500, 'Seating capacity cannot exceed 500'],
    },
    hasProjector: {
      type: Boolean,
      default: false,
    },
    hasWhiteboard: {
      type: Boolean,
      default: true,
    },
    hasComputers: {
      type: Boolean,
      default: false,
    },
    computerCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    hasAC: {
      type: Boolean,
      default: false,
    },
    hasWifi: {
      type: Boolean,
      default: true,
    },
    facilities: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
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

// Create indexes for optimized queries
RoomSchema.index({ roomNumber: 1 });
RoomSchema.index({ roomType: 1 });
RoomSchema.index({ building: 1 });
RoomSchema.index({ isActive: 1 });
RoomSchema.index({ seatingCapacity: 1 });
// Compound index for common queries
RoomSchema.index({ building: 1, floor: 1, roomNumber: 1 });
RoomSchema.index({ roomType: 1, isActive: 1 });

// Virtual for full location
RoomSchema.virtual('fullLocation').get(function() {
  return `${this.building}${this.floor ? `, Floor ${this.floor}` : ''}, Room ${this.roomNumber}`;
});

// Ensure virtual fields are serialised
RoomSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
