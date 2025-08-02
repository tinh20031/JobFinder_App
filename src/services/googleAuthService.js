import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getGoogleWebClientId } from '../constants/googleConfig';
import { authService } from './authService';

export const googleAuthService = {
  // Khởi tạo Google Sign-In
  configure() {
    const config = {
      webClientId: getGoogleWebClientId(),
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['email', 'profile'],
    };

    console.log('Google Sign-In Config:', config);
    GoogleSignin.configure(config);
  },

  // Kiểm tra xem user đã đăng nhập Google chưa
  async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Đăng nhập với Google
  async signIn() {
    try {
      console.log('Starting Google Sign-In...');
      
      // Kiểm tra Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Google Play Services available');
      
      // Thực hiện đăng nhập
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('Google Sign-In Error Details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Xử lý các lỗi cụ thể
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('User cancelled the sign-in flow');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services not available');
      } else if (error.code === 'DEVELOPER_ERROR') {
        throw new Error('Developer error - check Google Cloud Console configuration');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error - check internet connection');
      } else {
        throw error;
      }
    }
  },

  // Đăng xuất Google
  async signOut() {
    try {
      await GoogleSignin.signOut();
      console.log('Google Sign-Out successful');
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      throw error;
    }
  },

  // Revoke access
  async revokeAccess() {
    try {
      await GoogleSignin.revokeAccess();
      console.log('Google Revoke Access successful');
    } catch (error) {
      console.error('Google Revoke Access Error:', error);
      throw error;
    }
  },

  // Xử lý đăng nhập Google và gửi token đến server
  async handleGoogleLogin() {
    try {
      console.log('Starting Google Login process...');
      const userInfo = await this.signIn();
      
      if (userInfo && userInfo.idToken) {
        console.log('Got Google ID Token, sending to server...');
        // Gửi token đến server để xác thực
        const data = await authService.googleLogin(userInfo.idToken);
        console.log('Server authentication successful');
        return data;
      } else {
        console.error('No ID token received from Google');
        throw new Error('No ID token received from Google');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      throw error;
    }
  },
}; 