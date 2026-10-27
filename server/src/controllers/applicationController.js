import { Application } from '../models/Application.js';
import { Event } from '../models/Event.js';
import { checkDuplicateApplication } from '../services/duplicateService.js';

export const getApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      workMode,
      employmentType,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 25,
    } = req.query;

    const query = { user: req.user._id };

    // Search by text across company, jobTitle, notes, tags
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company: searchRegex },
        { jobTitle: searchRegex },
        { location: searchRegex },
        { tags: searchRegex },
        { notes: searchRegex },
      ];
    }

    // Status filter
    if (status && status !== 'ALL') {
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map((s) => s.trim()) };
      } else {
        query.status = status;
      }
    }

    // Work mode filter
    if (workMode && workMode !== 'ALL') {
      query.workMode = workMode;
    }

    // Employment type filter
    if (employmentType && employmentType !== 'ALL') {
      query.employmentType = employmentType;
    }

    // Sort setup
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = {};
    if (['createdAt', 'updatedAt', 'dateApplied', 'deadline', 'company', 'status'].includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: skip + applications.length < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Strict ownership enforcement
    const application = await Application.findOne({
      _id: id,
      user: req.user._id,
    }).lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or you do not have permission to access it.',
      });
    }

    // Fetch linked events
    const events = await Event.find({
      application: id,
      user: req.user._id,
    })
      .sort({ dateTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...application,
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const { company, jobTitle, forceDuplicate, ...rest } = req.body;

    // Duplicate detection check
    const duplicateCheck = await checkDuplicateApplication(req.user._id, company, jobTitle);

    if (duplicateCheck.isDuplicate && !forceDuplicate) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        error: 'Duplicate application detected',
        message: duplicateCheck.message,
        existingApplication: duplicateCheck.existingApplication,
      });
    }

    const application = await Application.create({
      user: req.user._id,
      company,
      jobTitle,
      ...rest,
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statusNote, forceDuplicate, company, jobTitle, ...updates } = req.body;

    // Strict ownership check
    const application = await Application.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or you do not have permission to modify it.',
      });
    }

    // Check duplicate if company or jobTitle changed
    const targetCompany = company || application.company;
    const targetTitle = jobTitle || application.jobTitle;

    if (company || jobTitle) {
      const duplicateCheck = await checkDuplicateApplication(
        req.user._id,
        targetCompany,
        targetTitle,
        id
      );

      if (duplicateCheck.isDuplicate && !forceDuplicate) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          error: 'Duplicate application detected',
          message: duplicateCheck.message,
          existingApplication: duplicateCheck.existingApplication,
        });
      }
    }

    if (company) application.company = company;
    if (jobTitle) application.jobTitle = jobTitle;

    // If status is updated, record history with custom note
    if (updates.status && updates.status !== application.status) {
      application.statusHistory.push({
        status: updates.status,
        changedAt: new Date(),
        note: statusNote || `Status changed from ${application.status} to ${updates.status}`,
      });
      application.status = updates.status;

      if (updates.status !== 'SAVED' && !application.dateApplied) {
        application.dateApplied = new Date();
      }
    }

    // Apply remaining fields
    Object.keys(updates).forEach((key) => {
      if (key !== 'status') {
        application[key] = updates[key];
      }
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const application = await Application.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or you do not have permission to modify it.',
      });
    }

    if (application.status !== status) {
      application.statusHistory.push({
        status,
        changedAt: new Date(),
        note: note || `Status updated to ${status}`,
      });
      application.status = status;

      if (status !== 'SAVED' && !application.dateApplied) {
        application.dateApplied = new Date();
      }

      await application.save();
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or you do not have permission to delete it.',
      });
    }

    // Delete all linked events
    await Event.deleteMany({
      application: id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Application and associated events deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
