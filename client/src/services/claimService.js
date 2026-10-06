import api from './api';

export const claimService = {
  async submitClaim(itemId, claimData) {
    return api.post(`/items/${itemId}/claims`, claimData);
  },

  async trackClaimByCode(code) {
    return api.get(`/claims/track/${code.trim().toUpperCase()}`);
  },

  async getClaims(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.claimant_email) params.append('claimant_email', filters.claimant_email);

    const queryString = params.toString();
    return api.get(`/claims${queryString ? `?${queryString}` : ''}`);
  },

  async getClaimById(id) {
    return api.get(`/claims/${id}`);
  },

  async updateClaimStatus(id, statusData) {
    return api.patch(`/claims/${id}`, statusData);
  }
};
