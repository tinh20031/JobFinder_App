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
      // Thêm cấu hình để lấy serverAuthCode
      serverClientId: getGoogleWebClientId(),
    };

    GoogleSignin.configure(config);
  },

  // Kiểm tra xem user đã đăng nhập Google chưa
  async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('❌ Error checking sign-in status:', error);
      return false;
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },

  // Đăng nhập với Google
  async signIn() {
    try {
      // Kiểm tra Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Thực hiện đăng nhập
      const userInfo = await GoogleSignin.signIn();
      
      // Kiểm tra cấu trúc response
      let actualUserInfo = userInfo;
      if (userInfo && userInfo.data) {
        actualUserInfo = userInfo.data;
      }
      
      return actualUserInfo;
    } catch (error) {
      // Xử lý các lỗi cụ thể
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('User cancelled the sign-in flow');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services not available');
      } else if (error.code === 'DEVELOPER_ERROR') {
        throw new Error('Developer error - check Google Cloud Console configuration (SHA-1, Package name, Web Client ID)');
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
    } catch (error) {
      console.error('❌ Google Sign-Out Error:', error);
      throw error;
    }
  },

  // Revoke access
  async revokeAccess() {
    try {
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error('❌ Google Revoke Access Error:', error);
      throw error;
    }
  },

  // Xử lý đăng nhập Google và gửi token đến server
  async handleGoogleLogin() {
    try {
      const userInfo = await this.signIn();
      
      // Kiểm tra cả idToken và serverAuthCode
      if (userInfo && (userInfo.idToken || userInfo.serverAuthCode)) {
        // Gửi cả idToken và serverAuthCode
        const tokensToSend = {
          idToken: userInfo.idToken,
          serverAuthCode: userInfo.serverAuthCode
        };
        
        // Gửi tokens đến server để xác thực
        const data = await authService.googleLogin(tokensToSend);
        return data;
      } else {
        throw new Error('No ID token or server auth code received from Google');
      }
    } catch (error) {
      throw error;
    }
  },
}; 