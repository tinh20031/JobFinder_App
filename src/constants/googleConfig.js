// Google Sign-In Configuration
export const GOOGLE_CONFIG = {
  WEB_CLIENT_ID: '731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com',
  OFFLINE_ACCESS: true,
  FORCE_CODE_FOR_REFRESH_TOKEN: true,
  SCOPE: ['email', 'profile'],
  HOSTED_DOMAIN: '',
  LOGIN_HINT: '',
};

// Hàm helper để lấy Web Client ID
export const getGoogleWebClientId = () => {
  return GOOGLE_CONFIG.WEB_CLIENT_ID;
};
