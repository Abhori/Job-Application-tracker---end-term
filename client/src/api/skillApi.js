import { axiosClient } from './axiosClient.js';

export const skillApi = {
  compareJobAndResume: async (jobDescription, resumeText) => {
    const res = await axiosClient.post('/skills/compare', { jobDescription, resumeText });
    return res.data;
  },
  extractSkills: async (text) => {
    const res = await axiosClient.post('/skills/extract', { text });
    return res.data;
  },
  getDictionary: async () => {
    const res = await axiosClient.get('/skills/dictionary');
    return res.data;
  },
};
