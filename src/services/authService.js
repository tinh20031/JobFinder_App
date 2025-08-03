import { BASE_URL, getGoogleLoginUrl } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export const authService = {
  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Login failed');
        error.data = errorData;
        throw error;
      }
      const data = await response.json();
      let decodedToken = null;
      if (data.token) {
        decodedToken = jwtDecode(data.token);
      }
      // Lưu thông tin vào AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role);
      if (data.name) await AsyncStorage.setItem('name', data.name);
      if (decodedToken && decodedToken.fullName) await AsyncStorage.setItem('fullName', decodedToken.fullName);
      if (decodedToken && decodedToken.profileImage) await AsyncStorage.setItem('profileImage', decodedToken.profileImage);
      if (decodedToken && decodedToken.sub) await AsyncStorage.setItem('UserId', decodedToken.sub);
      if (data.companyId) await AsyncStorage.setItem('CompanyProfileId', String(data.companyId));
      if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));
      if (data.user && data.user.companyName) await AsyncStorage.setItem('fullNameCompany', data.user.companyName);
      if (data.user && data.user.urlCompanyLogo) await AsyncStorage.setItem('profileImageCompany', data.user.urlCompanyLogo);
      // Lưu userId chuẩn cho candidate
      let userId = null;
      if (data.user && (data.user.id || data.user.userId)) {
        userId = data.user.id || data.user.userId;
      } else if (decodedToken && (decodedToken.sub || decodedToken.userId || decodedToken.id)) {
        userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      }
      if (userId) await AsyncStorage.setItem('UserId', String(userId));
      return data;
    } catch (error) {
      // Xử lý lỗi email chưa xác thực
      const isUnverifiedEmail =
        error.data?.requiresVerification ||
        (error.message &&
          (error.message.includes('requiresVerification') ||
            error.message.toLowerCase().includes('not verified') ||
            error.message.toLowerCase().includes('unverified') ||
            error.message.toLowerCase().includes('email chưa được xác thực') ||
            error.message.includes('Email has not been verified') ||
            error.message.includes('check your inbox to verify') ||
            error.message.includes('verify your account before logging in') ||
            error.message.toLowerCase().includes('verify') ||
            error.message.toLowerCase().includes('inbox')));
      if (isUnverifiedEmail) {
        const customError = new Error(error.message);
        customError.isUnverifiedEmail = true;
        customError.email = error.data?.email || email;
        customError.originalError = error;
        throw customError;
      }
      throw error;
    }
  },

  // Thêm method Google login
  async googleLogin(googleToken) {
    try {
      // Tách token thành idToken và serverAuthCode nếu cần
      let requestBody = { googleToken };
      
      // Nếu googleToken là object chứa cả idToken và serverAuthCode
      if (typeof googleToken === 'object' && googleToken.idToken) {
        requestBody = {
          idToken: googleToken.idToken,
          serverAuthCode: googleToken.serverAuthCode
        };
      }
      
      const response = await fetch(`${BASE_URL}/api/auth/mobile-google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Google login failed');
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      
      let decodedToken = null;
      if (data.token) {
        decodedToken = jwtDecode(data.token);
      }
      
      // Lưu thông tin vào AsyncStorage (tương tự như login thường)
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role);
      if (data.name) await AsyncStorage.setItem('name', data.name);
      if (decodedToken && decodedToken.fullName) await AsyncStorage.setItem('fullName', decodedToken.fullName);
      if (decodedToken && decodedToken.profileImage) await AsyncStorage.setItem('profileImage', decodedToken.profileImage);
      if (decodedToken && decodedToken.sub) await AsyncStorage.setItem('UserId', decodedToken.sub);
      if (data.companyId) await AsyncStorage.setItem('CompanyProfileId', String(data.companyId));
      if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));
      if (data.user && data.user.companyName) await AsyncStorage.setItem('fullNameCompany', data.user.companyName);
      if (data.user && data.user.urlCompanyLogo) await AsyncStorage.setItem('profileImageCompany', data.user.urlCompanyLogo);
      
      // Lưu userId chuẩn cho candidate
      let userId = null;
      if (data.user && (data.user.id || data.user.userId)) {
        userId = data.user.id || data.user.userId;
      } else if (decodedToken && (decodedToken.sub || decodedToken.userId || decodedToken.id)) {
        userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      }
      if (userId) await AsyncStorage.setItem('UserId', String(userId));
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Helper function để lấy Google login URL
  getGoogleLoginUrl() {
    return getGoogleLoginUrl();
  },

  async register(fullName, email, phone, password) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, phone, password, image: 'string', firebaseUid: 'string', role: '1' }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Registration failed');
        error.data = errorData;
        throw error;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = await authService.getToken();
      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      await AsyncStorage.removeItem('token');
      if (!res.ok) {
        // Vẫn tiếp tục logout ở client dù API lỗi
        console.error('API logout failed, but logged out on client');
      }
    } catch (error) {
      await AsyncStorage.removeItem('token'); // Đảm bảo token luôn được xóa
      throw error;
    }
  },

  async getToken() {
    return AsyncStorage.getItem('token');
  },

  async getRole() {
    return AsyncStorage.getItem('role');
  },

  async getName() {
    return AsyncStorage.getItem('name');
  },

  async getFullName() {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName) return user.fullName;
      } catch {}
    }
    return AsyncStorage.getItem('fullName');
  },

  async getUserId() {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id || user.userId) return user.id || user.userId;
      } catch {}
    }
    return AsyncStorage.getItem('UserId');
  },

  async verifyEmail(email, verificationCode) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        const error = new Error(errorData.message || 'Verification failed');
        error.data = errorData;
        throw error;
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  async resendVerification(email) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Resend verification failed');
        error.data = errorData;
        throw error;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const token = await this.getToken();
      const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        const error = new Error(errorData.message || 'Change password failed');
        error.data = errorData;
        throw error;
      }
      
      // Try to parse as JSON first, if fails, treat as text
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        // If not JSON, treat as success message
        data = { message: responseText || 'Password changed successfully' };
      }
      return data;
    } catch (error) {
      throw error;
    }
  },
}; 