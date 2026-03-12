import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/ngo';

export const ngoApi = {
    loginNGO: async (ngoId, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                ngoId,
                password
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Login failed';
        }
    },

    getNGOProfile: async (ngoId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile/${ngoId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Failed to fetch profile';
        }
    },

    updateResources: async (resourceData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/resources`, resourceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Failed to update resources';
        }
    },

    updateAvailability: async (availabilityData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/availability`, availabilityData);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Failed to update availability';
        }
    },

    getAllNGOs: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Failed to fetch NGOs';
        }
    }
};
