import { Application } from '../models/Application.js';

export const normalizeString = (str = '') => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Checks if the user already has an application for the same company & title.
 * Returns { isDuplicate: boolean, existingApplication?: object }
 */
export const checkDuplicateApplication = async (userId, company, jobTitle, excludeAppId = null) => {
  const normCompany = normalizeString(company);
  const normTitle = normalizeString(jobTitle);

  if (!normCompany || !normTitle) {
    return { isDuplicate: false };
  }

  const query = {
    user: userId,
    normalizedCompany: normCompany,
    normalizedJobTitle: normTitle,
  };

  if (excludeAppId) {
    query._id = { $ne: excludeAppId };
  }

  const existing = await Application.findOne(query).select('_id company jobTitle status createdAt').lean();

  if (existing) {
    return {
      isDuplicate: true,
      existingApplication: existing,
      message: `You already have an existing application for "${existing.jobTitle}" at "${existing.company}" (Current status: ${existing.status}).`,
    };
  }

  return { isDuplicate: false };
};
