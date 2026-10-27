import mongoose from 'mongoose';

export const APPLICATION_STATUSES = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const WORK_MODES = ['onsite', 'hybrid', 'remote'];
export const EMPLOYMENT_TYPES = ['internship', 'full-time', 'part-time', 'contract'];

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a user'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    normalizedCompany: {
      type: String,
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    normalizedJobTitle: {
      type: String,
      index: true,
    },
    jobDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [20000, 'Job description cannot exceed 20,000 characters'],
    },
    jobUrl: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    workMode: {
      type: String,
      enum: {
        values: WORK_MODES,
        message: '{VALUE} is not a valid work mode',
      },
      default: 'remote',
    },
    employmentType: {
      type: String,
      enum: {
        values: EMPLOYMENT_TYPES,
        message: '{VALUE} is not a valid employment type',
      },
      default: 'full-time',
    },
    salary: {
      type: String,
      default: '',
      trim: true,
      maxlength: [80, 'Salary info cannot exceed 80 characters'],
    },
    dateSaved: {
      type: Date,
      default: Date.now,
    },
    dateApplied: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: '{VALUE} is not a valid application status',
      },
      default: 'SAVED',
      index: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    contact: {
      name: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      role: { type: String, default: '', trim: true },
    },
    resumeVersion: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Resume version label cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Normalize company and jobTitle for duplicate check and populate initial statusHistory
applicationSchema.pre('save', function (next) {
  if (this.company) {
    this.normalizedCompany = this.company.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  if (this.jobTitle) {
    this.normalizedJobTitle = this.jobTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // If status is changed or brand new, record in statusHistory
  if (this.isModified('status') || this.isNew) {
    if (this.statusHistory.length === 0 || this.statusHistory[this.statusHistory.length - 1].status !== this.status) {
      this.statusHistory.push({
        status: this.status,
        changedAt: new Date(),
        note: this.isNew ? 'Application created' : `Status changed to ${this.status}`,
      });
    }

    // Automatically set dateApplied if status moved to APPLIED or beyond and dateApplied was not set
    if (this.status !== 'SAVED' && !this.dateApplied) {
      this.dateApplied = new Date();
    }
  }

  next();
});

// Indexes for high performance queries
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, normalizedCompany: 1, normalizedJobTitle: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, deadline: 1 });

export const Application = mongoose.model('Application', applicationSchema);
