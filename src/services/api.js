// NEXUS API Service
// Centralized API communication layer

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class NexusAPI {
    constructor() {
        this.token = localStorage.getItem('nexus_token');
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    setToken(token) {
        this.token = token;
        localStorage.setItem('nexus_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('nexus_token');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        this.setToken(response.token);
        return response;
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setToken(response.token);
        return response;
    }

    logout() {
        this.clearToken();
    }

    isAuthenticated() {
        return !!this.token;
    }

    // ═══════════════════════════════════════════════════════════════
    // SAGE AI MENTOR
    // ═══════════════════════════════════════════════════════════════

    async chatWithSage(message, conversationHistory = [], mode = 'mentor', language = 'fr') {
        return this.request('/sage/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                conversationHistory,
                mode,
                language
            })
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ORIENTATION ENGINE
    // ═══════════════════════════════════════════════════════════════

    async analyzeOrientation(answers, userProfile = {}) {
        return this.request('/orientation/analyze', {
            method: 'POST',
            body: JSON.stringify({ answers, userProfile })
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SCHOOLS & CAREERS
    // ═══════════════════════════════════════════════════════════════

    async getSchools(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/schools${params ? `?${params}` : ''}`);
    }

    async getSchoolById(id) {
        return this.request(`/schools/${id}`);
    }

    async getCareers(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/careers${params ? `?${params}` : ''}`);
    }

    async getCareerById(id) {
        return this.request(`/careers/${id}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // TIMELINE SIMULATION
    // ═══════════════════════════════════════════════════════════════

    async simulateTimeline(careerPath, startYear = 2025) {
        return this.request('/timeline/simulate', {
            method: 'POST',
            body: JSON.stringify({ careerPath, startYear })
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════

    async healthCheck() {
        return this.request('/health');
    }
}

// Export singleton instance
export const api = new NexusAPI();
export default api;
