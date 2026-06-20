import api from './api';

export const submitContactMessage = (payload) => api.post('/contact', payload);
export const fetchAdminMessages = (params) => api.get('/contact/admin/messages', { params });
export const fetchAdminMessage = (id) => api.get(`/contact/admin/messages/${id}`);
export const updateAdminMessage = (id, payload) => api.put(`/contact/admin/messages/${id}`, payload);
export const replyAdminMessage = (id, replyText) => api.post(`/contact/admin/messages/${id}/reply`, { replyText });
export const deleteAdminMessage = (id) => api.delete(`/contact/admin/messages/${id}`);
export const fetchContactSummary = () => api.get('/contact/admin/messages/summary');
