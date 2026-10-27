import { axiosClient } from './axiosClient.js';

export const applicationApi = {
  getApplications: async (params = {}) => {
    const res = await axiosClient.get('/applications', { params });
    return res.data;
  },
  getApplicationById: async (id) => {
    const res = await axiosClient.get(`/applications/${id}`);
    return res.data;
  },
  createApplication: async (applicationData) => {
    const res = await axiosClient.post('/applications', applicationData);
    return res.data;
  },
  updateApplication: async (id, applicationData) => {
    const res = await axiosClient.put(`/applications/${id}`, applicationData);
    return res.data;
  },
  updateStatus: async (id, status, note = '') => {
    const res = await axiosClient.patch(`/applications/${id}/status`, { status, note });
    return res.data;
  },
  deleteApplication: async (id) => {
    const res = await axiosClient.delete(`/applications/${id}`);
    return res.data;
  },
};
