import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default user ID for now
const USER_ID = 'player1';

// API Service class
class RPGApiService {
  // Character API
  async getCharacter(userId = USER_ID) {
    try {
      const response = await axios.get(`${API}/character/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting character:', error);
      throw error;
    }
  }

  async updateCharacter(userId = USER_ID, updates) {
    try {
      const response = await axios.put(`${API}/character/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  // Inventory API
  async getInventory(userId = USER_ID) {
    try {
      const response = await axios.get(`${API}/inventory/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting inventory:', error);
      throw error;
    }
  }

  async useItem(userId = USER_ID, itemId, quantity = 1) {
    try {
      const response = await axios.post(`${API}/inventory/${userId}/use`, {
        userId,
        itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error using item:', error);
      throw error;
    }
  }

  async equipItem(userId = USER_ID, itemId) {
    try {
      const response = await axios.post(`${API}/inventory/${userId}/equip`, {
        userId,
        itemId
      });
      return response.data;
    } catch (error) {
      console.error('Error equipping item:', error);
      throw error;
    }
  }

  // Enemy API
  async getEnemies() {
    try {
      const response = await axios.get(`${API}/enemies`);
      return response.data;
    } catch (error) {
      console.error('Error getting enemies:', error);
      throw error;
    }
  }

  // Quest API
  async getQuests(userId = USER_ID) {
    try {
      const response = await axios.get(`${API}/quests/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting quests:', error);
      throw error;
    }
  }

  async completeQuest(userId = USER_ID, questId) {
    try {
      const response = await axios.post(`${API}/quests/${userId}/complete/${questId}`);
      return response.data;
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  // Shop API
  async getShopItems() {
    try {
      const response = await axios.get(`${API}/shop/items`);
      return response.data;
    } catch (error) {
      console.error('Error getting shop items:', error);
      throw error;
    }
  }

  async buyItem(userId = USER_ID, itemId, quantity = 1) {
    try {
      const response = await axios.post(`${API}/shop/buy`, {
        userId,
        itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error buying item:', error);
      throw error;
    }
  }

  async sellItem(userId = USER_ID, itemId, quantity = 1) {
    try {
      const response = await axios.post(`${API}/shop/sell`, {
        userId,
        itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error selling item:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new RPGApiService();

// Utility functions
export const getRarityColor = (rarity) => {
  const colors = {
    common: "text-gray-600",
    uncommon: "text-green-600",
    rare: "text-blue-600",
    epic: "text-purple-600",
    legendary: "text-yellow-600"
  };
  return colors[rarity] || "text-gray-600";
};

export const getRarityBg = (rarity) => {
  const colors = {
    common: "bg-gray-100 border-gray-300",
    uncommon: "bg-green-50 border-green-300",
    rare: "bg-blue-50 border-blue-300",
    epic: "bg-purple-50 border-purple-300",
    legendary: "bg-yellow-50 border-yellow-300"
  };
  return colors[rarity] || "bg-gray-100 border-gray-300";
};