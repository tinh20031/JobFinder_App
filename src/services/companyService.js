import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = BASE_URL + '/api';

async function getToken() {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

const companyService = {
  getFavoriteCompanies: async () => {
    try {
      const token = await getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/Application/my-favorite-companies`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      // Normalize to array
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error) {
      throw error;
    }
  },

  unfavoriteCompany: async (companyId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch(`${API_URL}/Application/favorite-company/${companyId}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Network response was not ok');
      if (res.status === 204) return { success: true };
      // Một số backend trả về chuỗi hoặc rỗng thay vì JSON
      const text = await res.text();
      if (!text) return { success: true };
      try {
        return JSON.parse(text);
      } catch (_e) {
        return { success: true, raw: text };
      }
    } catch (error) {
      throw error;
    }
  },

  favoriteCompany: async (companyProfileId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch(`${API_URL}/Application/favorite-company/${companyProfileId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      if (res.status === 204) return { success: true };
      const text = await res.text();
      if (!text) return { success: true };
      try {
        return JSON.parse(text);
      } catch (_e) {
        return { success: true, raw: text };
      }
    } catch (error) {
      throw error;
    }
  },

  filterCompanies: async (params = {}) => {
    try {
      const url = `${BASE_URL}/api/CompanyProfile`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách company sizes
  getCompanySizes: async () => {
    // Return hardcoded data directly since API is not available
    return [
      { id: 1, sizeName: '50 - 100' },
      { id: 2, sizeName: '100 - 150' },
      { id: 3, sizeName: '200 - 250' },
      { id: 4, sizeName: '300 - 350' },
      { id: 5, sizeName: '500 - 1000' },
    ];
  },

  getCompanyDetail: async (companyId) => {
    try {
      const url = `${BASE_URL}/api/CompanyProfile/${companyId}`;
      const token = await getToken();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      throw error;
    }
  },
};

export default companyService; 