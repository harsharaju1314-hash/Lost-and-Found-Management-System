import api from './api';

export const itemService = {
  async getItems(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    return api.get(`/items${queryString ? `?${queryString}` : ''}`);
  },

  async getItemById(id) {
    return api.get(`/items/${id}`);
  },

  async getItemMatches(id) {
    return api.get(`/items/${id}/matches`);
  },

  async createItem(formData) {
    return api.post('/items', formData);
  },

  async updateItem(id, updateData) {
    return api.patch(`/items/${id}`, updateData);
  },

  async deleteItem(id) {
    return api.delete(`/items/${id}`);
  }
};
