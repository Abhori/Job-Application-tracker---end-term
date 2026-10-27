import { axiosClient } from './axiosClient.js';

export const analyticsApi = {
  getAnalytics: async (timeRange = 'all') => {
    const res = await axiosClient.get('/analytics', { params: { timeRange } });
    return res.data;
  },
};
