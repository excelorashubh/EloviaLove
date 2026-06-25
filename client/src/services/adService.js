import api from './api';

/**
 * Ad Service - Handles custom ad fetching and tracking
 */

class AdService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get ad for specific placement
   * @param {string} placement - Ad placement identifier
   * @returns {Promise<object|null>} Ad object or null
   */
  async getAdForPlacement(placement) {
    try {
      // Check cache first
      const cached = this.cache.get(placement);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.ad;
      }

      // Fetch from API
      const response = await api.get(`/ads/placement/${placement}`);
      const ad = response.data.ad;

      // Cache the result
      this.cache.set(placement, {
        ad,
        timestamp: Date.now()
      });

      return ad;
    } catch (error) {
      console.error('Error fetching ad:', error);
      return null;
    }
  }

  /**
   * Record ad impression
   * @param {string} adId - Ad ID
   * @returns {Promise<boolean>} Success status
   */
  async recordImpression(adId) {
    try {
      await api.post(`/ads/${adId}/impression`);
      return true;
    } catch (error) {
      console.error('Error recording impression:', error);
      return false;
    }
  }

  /**
   * Record ad click
   * @param {string} adId - Ad ID
   * @returns {Promise<string|null>} Ad link or null
   */
  async recordClick(adId) {
    try {
      const response = await api.post(`/ads/${adId}/click`);
      return response.data.link;
    } catch (error) {
      console.error('Error recording click:', error);
      return null;
    }
  }

  /**
   * Clear cache for specific placement or all
   * @param {string} placement - Optional placement to clear
   */
  clearCache(placement) {
    if (placement) {
      this.cache.delete(placement);
    } else {
      this.cache.clear();
    }
  }
}

export default new AdService();
