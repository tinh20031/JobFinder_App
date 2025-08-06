export const BASE_URL = "https://job-finder-kjt2.onrender.com";

// export const BASE_URL = "http://10.0.2.2:5194";

// SignalR Hub URL
export const SIGNALR_HUB_URL = `${BASE_URL}/notificationHub`;

// SignalR Chat Hub URL - try different endpoints
export const SIGNALR_CHAT_HUB_URL = `${BASE_URL}/chatHub`;
// Alternative endpoints to try if the above doesn't work:
// export const SIGNALR_CHAT_HUB_URL = `${BASE_URL}/chathub`;
// export const SIGNALR_CHAT_HUB_URL = `${BASE_URL}/ChatHub`;
// export const SIGNALR_CHAT_HUB_URL = `${BASE_URL}/messageHub`;

// Google Login URL
export const getGoogleLoginUrl = () => {
  return `${BASE_URL}/api/auth/mobile-google-login`;
};

