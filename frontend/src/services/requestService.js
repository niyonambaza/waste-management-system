import API from './api';

export const getWasteRequests = () => API.get('/waste-requests');
export const createWasteRequest = (data) => API.post('/waste-requests', data);
export const updateWasteRequest = (id, data) => API.put(`/waste-requests/${id}`, data);
export const deleteWasteRequest = (id) => API.delete(`/waste-requests/${id}`);