import { calculateUserAnalytics } from '../services/analyticsService.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const { timeRange = 'all' } = req.query;

    const analytics = await calculateUserAnalytics(req.user._id, timeRange);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
