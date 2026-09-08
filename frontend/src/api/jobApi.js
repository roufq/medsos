import api from './axios';

export const jobApi = {
  getAllJobs: async () => {
    const res = await api.get('/jobs');
    return res.data;
  },
  applyJob: async (jobId) => {
    const res = await api.post('/jobs/apply', { job_id: jobId });
    return res.data;
  }
};
