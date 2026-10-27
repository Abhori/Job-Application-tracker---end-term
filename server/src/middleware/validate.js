import { z } from 'zod';
import { APPLICATION_STATUSES, WORK_MODES, EMPLOYMENT_TYPES } from '../models/Application.js';
import { EVENT_TYPES } from '../models/Event.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with sanitized/parsed values
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.slice(1).join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formattedErrors,
      });
    }
    next(err);
  }
};

// --- AUTH SCHEMAS ---
export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    headline: z.string().trim().max(150).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    headline: z.string().trim().max(150).optional(),
    targetRoles: z.array(z.string().trim()).optional(),
    preferences: z
      .object({
        defaultView: z.enum(['list', 'kanban']).optional(),
        emailAlerts: z.boolean().optional(),
        inAppReminders: z.boolean().optional(),
      })
      .optional(),
  }),
});

// --- APPLICATION SCHEMAS ---
export const createApplicationSchema = z.object({
  body: z.object({
    company: z.string().trim().min(1, 'Company name is required').max(120),
    jobTitle: z.string().trim().min(1, 'Job title is required').max(150),
    jobDescription: z.string().max(20000).optional().default(''),
    jobUrl: z.string().trim().url('Job URL must be a valid URL').or(z.literal('')).optional().default(''),
    location: z.string().trim().max(100).optional().default('Remote'),
    workMode: z.enum(WORK_MODES).optional().default('remote'),
    employmentType: z.enum(EMPLOYMENT_TYPES).optional().default('full-time'),
    salary: z.string().trim().max(80).optional().default(''),
    status: z.enum(APPLICATION_STATUSES).optional().default('SAVED'),
    dateSaved: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    dateApplied: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    deadline: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    contact: z
      .object({
        name: z.string().trim().max(100).optional().default(''),
        email: z.string().trim().email().or(z.literal('')).optional().default(''),
        phone: z.string().trim().max(40).optional().default(''),
        role: z.string().trim().max(100).optional().default(''),
      })
      .optional()
      .default({}),
    resumeVersion: z.string().trim().max(100).optional().default(''),
    notes: z.string().max(5000).optional().default(''),
    tags: z.array(z.string().trim().max(50)).optional().default([]),
    forceDuplicate: z.boolean().optional().default(false),
  }),
});

export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format'),
  }),
  body: z.object({
    company: z.string().trim().min(1).max(120).optional(),
    jobTitle: z.string().trim().min(1).max(150).optional(),
    jobDescription: z.string().max(20000).optional(),
    jobUrl: z.string().trim().url('Job URL must be a valid URL').or(z.literal('')).optional(),
    location: z.string().trim().max(100).optional(),
    workMode: z.enum(WORK_MODES).optional(),
    employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
    salary: z.string().trim().max(80).optional(),
    status: z.enum(APPLICATION_STATUSES).optional(),
    statusNote: z.string().trim().max(500).optional(),
    dateApplied: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    deadline: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    contact: z
      .object({
        name: z.string().trim().max(100).optional(),
        email: z.string().trim().email().or(z.literal('')).optional(),
        phone: z.string().trim().max(40).optional(),
        role: z.string().trim().max(100).optional(),
      })
      .optional(),
    resumeVersion: z.string().trim().max(100).optional(),
    notes: z.string().max(5000).optional(),
    tags: z.array(z.string().trim().max(50)).optional(),
    forceDuplicate: z.boolean().optional().default(false),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format'),
  }),
  body: z.object({
    status: z.enum(APPLICATION_STATUSES),
    note: z.string().trim().max(500).optional().default(''),
  }),
});

// --- EVENT SCHEMAS ---
export const createEventSchema = z.object({
  body: z.object({
    applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format'),
    eventType: z.enum(EVENT_TYPES),
    title: z.string().trim().min(1, 'Title is required').max(150),
    dateTime: z.string().datetime({ offset: true }).or(z.string().min(1, 'Date and time is required')),
    locationOrLink: z.string().trim().max(500).optional().default(''),
    notes: z.string().max(2000).optional().default(''),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),
  }),
  body: z.object({
    eventType: z.enum(EVENT_TYPES).optional(),
    title: z.string().trim().min(1).max(150).optional(),
    dateTime: z.string().datetime({ offset: true }).or(z.string()).optional(),
    locationOrLink: z.string().trim().max(500).optional(),
    notes: z.string().max(2000).optional(),
    isCompleted: z.boolean().optional(),
  }),
});

// --- SKILL ANALYZER SCHEMA ---
export const compareSkillsSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters long'),
    resumeText: z.string().min(10, 'Resume text must be at least 10 characters long'),
  }),
});
