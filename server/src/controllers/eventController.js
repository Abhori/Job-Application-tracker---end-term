import { Event } from '../models/Event.js';
import { Application } from '../models/Application.js';

export const getEvents = async (req, res, next) => {
  try {
    const { applicationId, eventType, isCompleted, upcomingOnly } = req.query;

    const query = { user: req.user._id };

    if (applicationId) {
      query.application = applicationId;
    }
    if (eventType) {
      query.eventType = eventType;
    }
    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }
    if (upcomingOnly === 'true') {
      query.dateTime = { $gte: new Date() };
      query.isCompleted = false;
    }

    const events = await Event.find(query)
      .populate('application', 'company jobTitle status')
      .sort({ dateTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { applicationId, eventType, title, dateTime, locationOrLink, notes } = req.body;

    // Strict ownership verification: verify the application belongs to this user
    const application = await Application.findOne({
      _id: applicationId,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Target application not found or you do not have permission to attach events to it.',
      });
    }

    const event = await Event.create({
      user: req.user._id,
      application: applicationId,
      eventType,
      title,
      dateTime,
      locationOrLink: locationOrLink || '',
      notes: notes || '',
    });

    const populated = await Event.findById(event._id)
      .populate('application', 'company jobTitle status')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or you do not have permission to modify it.',
      });
    }

    if (updates.isCompleted !== undefined && updates.isCompleted !== event.isCompleted) {
      event.isCompleted = updates.isCompleted;
      event.completedAt = updates.isCompleted ? new Date() : null;
    }

    ['eventType', 'title', 'dateTime', 'locationOrLink', 'notes'].forEach((key) => {
      if (updates[key] !== undefined) {
        event[key] = updates[key];
      }
    });

    await event.save();

    const populated = await Event.findById(event._id)
      .populate('application', 'company jobTitle status')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEventCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or you do not have permission to modify it.',
      });
    }

    event.isCompleted = !event.isCompleted;
    event.completedAt = event.isCompleted ? new Date() : null;

    await event.save();

    const populated = await Event.findById(event._id)
      .populate('application', 'company jobTitle status')
      .lean();

    res.status(200).json({
      success: true,
      message: `Event marked as ${event.isCompleted ? 'completed' : 'incomplete'}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
