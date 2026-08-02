import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

export const getMetrics = () => client.get('/metrics').then((r) => r.data);
export const getJob = (id) => client.get(`/job/${id}`).then((r) => r.data);
export const getDlqList = () => client.get('/dlq').then((r) => r.data);
export const getDlqJob = (id) => client.get(`/dlq/${id}`).then((r) => r.data);
export const replayJob = (id) => client.post(`/dlq/${id}/retry`).then((r) => r.data);
export const getWorkers = () => client.get('/workers').then((r) => r.data);

export default client;