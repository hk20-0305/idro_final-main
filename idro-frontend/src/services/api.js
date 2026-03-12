import axios from "axios";

const API_URL = "http://localhost:8085/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const idroApi = {
  login: (data) => api.post("/login", data),

  getAlerts: () => api.get("/alerts"),
  getAlertById: (id) => api.get(`/alerts/${id}`),
  submitReport: (data) => api.post("/alerts", data),
  updateReport: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),


  getImpact: (id) => api.get(`/analytics/impact/${id}`),
  getStats: () => api.get("/analytics/stats"),

  getCamps: () => api.get("/camps"),
  getCampsByAlert: (alertId) => api.get(`/camps/by-alert/${alertId}`),
  createCamp: (data) => api.post("/camps", data),


  getActions: () => api.get("/actions"),
  createAction: (data) => api.post("/actions", data),
  getHighPriorityActions: () => api.get("/actions/priority/high"),
  getActionsByRole: (role) => api.get(`/actions/role/${role}`),
  getImpactAnalysis: (missionId) => api.get(`/impact-analysis/${missionId}`),

  getAllNGOs: (disasterId) => api.get(`/ngo/all${disasterId ? `?disasterId=${disasterId}` : ""}`),
  getAllAgencies: (disasterId) => api.get(`/government/all${disasterId ? `?disasterId=${disasterId}` : ""}`),
};

export default api;
