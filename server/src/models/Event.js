import mongoose from 'mongoose';

export const EVENT_TYPES = ['interview', 'assessment', 'deadline', 'follow-up', 'reminder'];

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event must belong to a user'],
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Event must be linked to an application'],
      index: true,
    },
    eventType: {
      type: String,
      enum: {
        values: EVENT_TYPES,
        message: '{VALUE} is not a valid event type',
      },
      default: 'interview',
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    locationOrLink: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Link or location cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ user: 1, dateTime: 1 });
eventSchema.index({ user: 1, isCompleted: 1, dateTime: 1 });

export const Event = mongoose.model('Event', eventSchema);
