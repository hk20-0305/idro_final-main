import axios from "axios";

// Backend base URL
const API_URL = "http://localhost:8085/api";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const idroApi = {
  // -------- AUTH ----------
  login: (data) => api.post("/login", data),

  // -------- ALERTS ----------
  getAlerts: () => api.get("/alerts"),
  getAlertById: (id) => api.get(`/alerts/${id}`),
  submitReport: (data) => api.post("/alerts", data),
  updateReport: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),


  // -------- ANALYTICS ----------
  getImpact: (id) => api.get(`/analytics/impact/${id}`),
  getStats: () => api.get("/analytics/stats"),

  // -------- CAMPS ----------
  getCamps: () => api.get("/camps"),
  getCampsByAlert: (alertId) => api.get(`/camps/by-alert/${alertId}`),
  createCamp: (data) => api.post("/camps", data),


  // -------- ACTIONS ----------
  getActions: () => api.get("/actions"),
  createAction: (data) => api.post("/actions", data),
  getHighPriorityActions: () => api.get("/actions/priority/high"),
  getActionsByRole: (role) => api.get(`/actions/role/${role}`),
  // -------- AI IMPACT ANALYSIS ----------
  getImpactAnalysis: (missionId) => api.get(`/impact-analysis/${missionId}`),

  // -------- PROVIDERS (NGO & GOV) ----------
  getAllNGOs: (disasterId) => api.get(`/ngo/all${disasterId ? `?disasterId=${disasterId}` : ""}`),
  getAllAgencies: (disasterId) => api.get(`/government/all${disasterId ? `?disasterId=${disasterId}` : ""}`),
};

export default api;
