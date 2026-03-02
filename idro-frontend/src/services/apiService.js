const BASE_URL = "http://localhost:8085/api";

class ApiService {

  async request(endpoint, method = "GET", data = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error.message);
      throw error;
    }
  }

  // ---------- AUTH ----------
  login(data) {
    return this.request("/login", "POST", data);
  }

  // ---------- ALERTS ----------
  getAlerts() {
    return this.request("/alerts");
  }

  getAlert(id) {
    return this.request(`/alerts/${id}`);
  }

  createAlert(data) {
    return this.request("/alerts", "POST", data);
  }

  updateAlert(id, data) {
    return this.request(`/alerts/${id}`, "PUT", data);
  }

  deleteAlert(id) {
    return this.request(`/alerts/${id}`, "DELETE");
  }

  // ---------- ANALYTICS ----------
  getImpact(id) {
    return this.request(`/analytics/impact/${id}`);
  }

  getStats() {
    return this.request("/analytics/stats");
  }

  // ---------- CAMPS ----------
  getCamps() {
    return this.request("/camps");
  }

  createCamp(data) {
    return this.request("/camps", "POST", data);
  }

  // ---------- ACTIONS ----------
  getActions() {
    return this.request("/actions");
  }

  createAction(data) {
    return this.request("/actions", "POST", data);
  }
}

const apiService = new ApiService();
export default apiService;
