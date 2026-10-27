import { Application, APPLICATION_STATUSES } from '../models/Application.js';
import { Event } from '../models/Event.js';

export const calculateUserAnalytics = async (userId, timeRange = 'all') => {
  const query = { user: userId };

  // Optional date filtering based on timeRange
  if (timeRange && timeRange !== 'all') {
    const now = new Date();
    let startDate = new Date();
    if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (timeRange === '180d') {
      startDate.setDate(now.getDate() - 180);
    } else if (timeRange === '1y') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    query.createdAt = { $gte: startDate };
  }

  // Fetch all applications for user
  const applications = await Application.find(query).lean();

  // Status Counts
  const statusCounts = {};
  APPLICATION_STATUSES.forEach((s) => {
    statusCounts[s] = 0;
  });

  let totalActive = 0;
  let totalSubmitted = 0;
  let offersCount = 0;
  let rejectionCount = 0;

  // Work Mode Counts
  const workModeCounts = {
    remote: 0,
    hybrid: 0,
    onsite: 0,
  };

  // Applications over time (bucketed by YYYY-MM)
  const timelineMap = new Map();

  // Count distinct applications that ever reached interview or offer
  let reachedInterviewCount = 0;
  let reachedOfferCount = 0;

  applications.forEach((app) => {
    const st = app.status;
    if (statusCounts[st] !== undefined) {
      statusCounts[st]++;
    }

    // Active applications are in progress
    if (['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW'].includes(st)) {
      totalActive++;
    }

    // Submitted applications are any beyond SAVED
    const isSubmitted = st !== 'SAVED' || app.dateApplied != null;
    if (isSubmitted) {
      totalSubmitted++;
    }

    if (st === 'OFFER') {
      offersCount++;
    }
    if (st === 'REJECTED') {
      rejectionCount++;
    }

    // Work mode
    if (app.workMode && workModeCounts[app.workMode] !== undefined) {
      workModeCounts[app.workMode]++;
    }

    // Reached Interview stage check: check current status or history
    const hasReachedInterview =
      st === 'INTERVIEW' ||
      st === 'OFFER' ||
      (app.statusHistory && app.statusHistory.some((h) => h.status === 'INTERVIEW'));
    if (hasReachedInterview) {
      reachedInterviewCount++;
    }

    // Reached Offer check
    const hasReachedOffer =
      st === 'OFFER' ||
      (app.statusHistory && app.statusHistory.some((h) => h.status === 'OFFER'));
    if (hasReachedOffer) {
      reachedOfferCount++;
    }

    // Timeline bucket (use dateApplied if available, else dateSaved / createdAt)
    const refDate = app.dateApplied ? new Date(app.dateApplied) : new Date(app.createdAt);
    const monthKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}`;
    timelineMap.set(monthKey, (timelineMap.get(monthKey) || 0) + 1);
  });

  // Calculate conversion rates safely (handle 0 denominator)
  const interviewConversionRate =
    totalSubmitted > 0
      ? Number(((reachedInterviewCount / totalSubmitted) * 100).toFixed(1))
      : 0;

  const offerConversionRate =
    totalSubmitted > 0
      ? Number(((reachedOfferCount / totalSubmitted) * 100).toFixed(1))
      : 0;

  // Format timeline sorted chronologically
  const applicationsOverTime = Array.from(timelineMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      const [year, month] = date.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        key: date,
        label: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
        count,
      };
    });

  // Fetch upcoming and overdue events from DB
  const now = new Date();

  const [upcomingEvents, overdueEvents] = await Promise.all([
    Event.find({
      user: userId,
      isCompleted: false,
      dateTime: { $gte: now },
    })
      .populate('application', 'company jobTitle status')
      .sort({ dateTime: 1 })
      .limit(10)
      .lean(),

    Event.find({
      user: userId,
      isCompleted: false,
      dateTime: { $lt: now },
    })
      .populate('application', 'company jobTitle status')
      .sort({ dateTime: -1 })
      .limit(10)
      .lean(),
  ]);

  const upcomingInterviewsCount = upcomingEvents.filter(
    (e) => e.eventType === 'interview' || e.eventType === 'assessment'
  ).length;

  return {
    totalApplications: applications.length,
    totalActive,
    totalSubmitted,
    statusCounts,
    workModeCounts,
    offersCount,
    rejectionCount,
    interviewConversionRate,
    offerConversionRate,
    applicationsOverTime,
    upcomingEventsCount: upcomingEvents.length,
    upcomingInterviewsCount,
    overdueEventsCount: overdueEvents.length,
    upcomingEvents,
    overdueEvents,
    definitions: {
      interviewConversionRate:
        'Distinct submitted applications that reached an interview or offer stage divided by total submitted applications.',
      offerConversionRate:
        'Distinct submitted applications that reached an offer stage divided by total submitted applications.',
      activeApplications:
        'Applications currently in SAVED, APPLIED, ASSESSMENT, or INTERVIEW stage.',
    },
  };
};
