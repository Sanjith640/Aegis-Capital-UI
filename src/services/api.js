import axios from 'axios';

const BASE = 'http://localhost:8090';

const api = axios.create({ baseURL: BASE });

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ────────────────────────────────────────────────────────
export const authAPI = {
  registerInit: (data) => api.post('/auth/register/init', data),
  registerVerifyOtp: (data) => api.post('/auth/register/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ─── ACCOUNTS ────────────────────────────────────────────────────
export const accountAPI = {
  getProfile: () => api.get('/accounts/profile'),
  addAccount: (data) => api.post('/accounts/add', data),
  requestPinOtp: (data) => api.post('/accounts/pin/request-otp', data),
  setPin: (data) => api.post('/accounts/pin/set', data),
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────
export const txnAPI = {
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  getHistory: (accountNumber, page = 0, size = 10) =>
    api.get(`/transactions/history/${accountNumber}?page=${page}&size=${size}`),
  getStatement: (accountNumber, from, to) =>
    api.get(`/transactions/statement/${accountNumber}?from=${from}&to=${to}`),
  getByRef: (ref) => api.get(`/transactions/${ref}`),
  getRemaining: (accountNumber) => api.get(`/transactions/remaining/${accountNumber}`),
};

// ─── AUDIT ────────────────────────────────────────────────────────
export const auditAPI = {
  myTransactions: (accountNumber, from, to) =>
    api.get(`/audit/my-transactions?accountNumber=${accountNumber}&from=${from}&to=${to}`),
  mySummary: (accountNumber, from, to) =>
    api.get(`/audit/summary?accountNumber=${accountNumber}&from=${from}&to=${to}`),
  complianceTransactions: (accountNumber, from, to) =>
    api.get(`/audit/compliance/transactions?accountNumber=${accountNumber}&from=${from}&to=${to}`),
  complianceSummary: (accountNumber, from, to) =>
    api.get(`/audit/compliance/summary?accountNumber=${accountNumber}&from=${from}&to=${to}`),
  complianceByCustomer: (customerId, from, to) =>
    api.get(`/audit/compliance/user/${customerId}?from=${from}&to=${to}`),
};

// ─── COMPLIANCE ───────────────────────────────────────────────────
export const complianceAPI = {
  register: (data) => api.post('/compliance/register', data),
  login: (data) => api.post('/compliance/login', data),
  getAllUsers: () => api.get('/compliance/users'),
  getUserProfile: (customerId) => api.get(`/compliance/users/${customerId}`),
  freezeAccount: (data) => api.post('/compliance/accounts/freeze', data),
  unfreezeAccount: (data) => api.post('/compliance/accounts/unfreeze', data),
  lockUser: (customerId) => api.post(`/compliance/users/${customerId}/lock`),
  unlockUser: (customerId) => api.post(`/compliance/users/${customerId}/unlock`),
};

// ─── ADMIN ────────────────────────────────────────────────────────
export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getPendingOfficers: () => api.get('/admin/officers/pending'),
  getAllOfficers: () => api.get('/admin/officers'),
  approveOfficer: (data) => api.post('/admin/officers/approve', data),
  rejectOfficer: (data) => api.post('/admin/officers/reject', data),
  removeOfficer: (officerId) => api.delete(`/admin/officers/${officerId}`),
  reactivateOfficer: (officerId) => api.post(`/admin/officers/${officerId}/reactivate`),
  getAllUsers: () => api.get('/admin/users'),
  getUserProfile: (customerId) => api.get(`/admin/users/${customerId}`),
  freezeAccount: (data) => api.post('/admin/accounts/freeze', data),
  unfreezeAccount: (data) => api.post('/admin/accounts/unfreeze', data),
  lockUser: (customerId) => api.post(`/admin/users/${customerId}/lock`),
  unlockUser: (customerId) => api.post(`/admin/users/${customerId}/unlock`),
  complianceTransactions: (accountNumber, from, to) =>
    api.get(`/audit/compliance/transactions?accountNumber=${accountNumber}&from=${from}&to=${to}`),
  complianceSummary: (accountNumber, from, to) =>
    api.get(`/audit/compliance/summary?accountNumber=${accountNumber}&from=${from}&to=${to}`),
  complianceByCustomer: (customerId, from, to) =>
    api.get(`/audit/compliance/user/${customerId}?from=${from}&to=${to}`),
};

export default api;
