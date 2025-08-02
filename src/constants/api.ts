export const BASE_URL = "https://job-finder-kjt2.onrender.com";

// export const BASE_URL = "http://10.0.2.2:5194";

// SignalR Hub URL
export const SIGNALR_HUB_URL = `${BASE_URL}/notificationHub`;

// Google Login URL
export const getGoogleLoginUrl = () => {
  return `${BASE_URL}/api/auth/login-google`;
};

