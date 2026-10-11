import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  async getMe() {
    return api.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
  }
};
