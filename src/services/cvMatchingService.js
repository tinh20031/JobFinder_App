import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cvMatchingService = {
  /**
   * Thử khớp CV với công việc
   * @param {Object} request - Dữ liệu yêu cầu
   * @param {number} request.jobId - ID công việc
   * @param {File} [request.cvFile] - File CV (nếu upload CV mới)
   * @param {number} [request.cvId] - ID CV (nếu sử dụng CV đã lưu)
   * @returns {Promise<Object>} Kết quả khớp
   */
  async tryMatch(formData) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để sử dụng tính năng này');
      }

      let response;
      if (formData instanceof FormData) {
        const url = `${BASE_URL}/api/application/try-match`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
        }
        
        return response.json();
      } else {
        // fallback nếu không phải FormData
        const url = `${BASE_URL}/api/application/try-match`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
        }
        
        return response.json();
      }
    } catch (error) {
      console.error('Error in tryMatch:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử thử khớp CV
   * @param {number} userId - ID người dùng
   * @returns {Promise<Array>} Danh sách lịch sử
   */
  async getTryMatchHistory(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const url = `${BASE_URL}/api/application/my-try-match-history/${userId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching try match history:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết kết quả thử khớp
   * @param {number} tryMatchId - ID kết quả thử khớp
   * @returns {Promise<Object>} Chi tiết kết quả
   */
  async getTryMatchDetail(tryMatchId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const url = `${BASE_URL}/api/application/try-match/${tryMatchId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching try match detail:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử thử khớp của người dùng hiện tại
   * @returns {Promise<Array>} Danh sách lịch sử
   */
  async getMyTryMatchHistory() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const url = `${BASE_URL}/api/application/my-try-match-history`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching my try match history:', error);
      throw error;
    }
  },

  /**
   * Xóa kết quả thử khớp
   * @param {number} tryMatchId - ID kết quả thử khớp
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteTryMatch(tryMatchId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const url = `${BASE_URL}/api/application/try-match/${tryMatchId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error deleting try match:', error);
      throw error;
    }
  },

  /**
   * Tạo FormData từ object data
   * @param {Object} data - Dữ liệu cần chuyển đổi
   * @returns {FormData} FormData object
   */
  createFormData(data) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'cvFile' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key].toString());
        }
      }
    });
    
    return formData;
  }
};

export default cvMatchingService; 