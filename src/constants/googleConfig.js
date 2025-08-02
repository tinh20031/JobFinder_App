// Google Sign-In Configuration
export const GOOGLE_CONFIG = {
  // Thay thế bằng Web Client ID thực tế từ Google Cloud Console
  WEB_CLIENT_ID: '731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com',
  
  // Các cấu hình khác cho Google Sign-In
  OFFLINE_ACCESS: true,
  FORCE_CODE_FOR_REFRESH_TOKEN: true,
  
  // Thêm cấu hình cho Android
  ANDROID_CLIENT_ID: '731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com',
  
  // Cấu hình cho iOS
  IOS_CLIENT_ID: '731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com',
  
  // Cấu hình khác
  SCOPE: ['email', 'profile'],
  HOSTED_DOMAIN: '',
  LOGIN_HINT: '',
  SERVER_CLIENT_ID: '731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com',
};

// Hàm helper để lấy Web Client ID
export const getGoogleWebClientId = () => {
  return GOOGLE_CONFIG.WEB_CLIENT_ID;
};

// Hàm helper để lấy Android Client ID
export const getGoogleAndroidClientId = () => {
  return GOOGLE_CONFIG.ANDROID_CLIENT_ID;
};

// Hàm helper để lấy iOS Client ID
export const getGoogleIosClientId = () => {
  return GOOGLE_CONFIG.IOS_CLIENT_ID;
}; 