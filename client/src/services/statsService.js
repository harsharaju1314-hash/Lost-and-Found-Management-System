import api from './api';

export const statsService = {
  async getOverviewStats() {
    return api.get('/stats/overview');
  }
};
