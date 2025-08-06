import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@microsoft/signalr';
import { BASE_URL, SIGNALR_CHAT_HUB_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${BASE_URL}/api/Message`;

async function getToken() {
  return await AsyncStorage.getItem('token');
}

const chatService = {
  connection: null,
  hubUrl: SIGNALR_CHAT_HUB_URL, // Sử dụng SIGNALR_CHAT_HUB_URL
  listeners: new Map(), // Để track multiple listeners
  connectionPromise: null, // Để tránh multiple connection attempts

  async startConnection() {
    // Nếu đang có connection đang được thiết lập, đợi nó hoàn thành
    if (this.connectionPromise) {
      console.log('[SignalR-Chat] Connection already in progress, waiting...');
      return await this.connectionPromise;
    }

    // Nếu connection đã tồn tại và đang connected, return
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      console.log('[SignalR-Chat] Connection already exists and connected');
      return;
    }

    // Nếu connection đang ở trạng thái khác, stop nó trước
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      console.log('[SignalR-Chat] Stopping existing connection before reconnecting...');
      try {
        await this.connection.stop();
      } catch (error) {
        console.log('[SignalR-Chat] Error stopping connection:', error);
      }
      this.connection = null;
    }
    
    const token = await getToken();
    if (!token) {
      console.error('[SignalR-Chat] No token available');
      throw new Error('No authentication token available');
    }
    
    console.log('[SignalR-Chat] Connecting to:', this.hubUrl);
    console.log('[SignalR-Chat] Token available:', !!token);
    console.log('[SignalR-Chat] Using SIGNALR_CHAT_HUB_URL:', SIGNALR_CHAT_HUB_URL);
    
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();
      
    this.connection.onclose((error) => {
      console.log('[SignalR-Chat] Disconnected', error ? error.message : '');
      this.connectionPromise = null;
    });
    this.connection.onreconnecting((error) => {
      console.log('[SignalR-Chat] Reconnecting...', error ? error.message : '');
    });
    this.connection.onreconnected((connectionId) => {
      console.log('[SignalR-Chat] Reconnected. ConnectionId:', connectionId);
      // Re-join user group after reconnection
      this.rejoinUserGroups();
    });
    
    // Thêm retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    this.connectionPromise = (async () => {
      while (retryCount < maxRetries) {
        try {
          console.log(`[SignalR-Chat] Attempt ${retryCount + 1}/${maxRetries} to connect...`);
          await this.connection.start();
          console.log('[SignalR-Chat] Connected successfully!');
          console.log('[SignalR-Chat] Connection state:', this.connection.state);
          console.log('[SignalR-Chat] Connection ID:', this.connection.connectionId);
          
          // Không validate connection ID nữa vì có thể server không trả về
          // Chỉ cần connection state là Connected là đủ
          if (this.connection.state === HubConnectionState.Connected) {
            console.log('[SignalR-Chat] Connection established successfully');
            return;
          } else {
            throw new Error(`Connection state is ${this.connection.state}, expected Connected`);
          }
          
        } catch (err) {
          retryCount++;
          console.error(`[SignalR-Chat] Connection error (attempt ${retryCount}/${maxRetries}):`, err.message);
          console.error('[SignalR-Chat] Full error:', err);
          
          if (retryCount >= maxRetries) {
            console.error('[SignalR-Chat] Max retries reached, giving up');
            this.connectionPromise = null;
            throw err;
          }
          
          // Wait before retry with exponential backoff
          const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`[SignalR-Chat] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    })();
    
    return await this.connectionPromise;
  },

  async rejoinUserGroups() {
    // Re-join all active user groups after reconnection
    const userId = await AsyncStorage.getItem('UserId');
    if (userId && this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.joinUserGroup(userId);
        console.log('[SignalR-Chat] Re-joined user group after reconnection');
      } catch (error) {
        console.error('[SignalR-Chat] Error re-joining user group:', error);
      }
    }
  },

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.connectionPromise = null;
    }
  },

  on(event, callback) {
    if (!this.connection) {
      console.warn('[SignalR-Chat] Cannot add listener - no connection');
      return;
    }
    
    // Track listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    this.connection.on(event, callback);
    console.log(`[SignalR-Chat] Added listener for event: ${event}`);
    
    // Add debug listener for all events when adding ReceiveMessage
    if (event === 'ReceiveMessage') {
      console.log('[SignalR-Chat] Adding debug listener for all server methods');
      
      // Listen for all server methods
      this.connection.on('*', (methodName, ...args) => {
        console.log(`[SignalR-Chat] Received server method: ${methodName}`, args);
        
        // If it's a message-related method, log more details
        if (methodName.toLowerCase().includes('message') || methodName.toLowerCase().includes('receive')) {
          console.log('[SignalR-Chat] Message-related method received:', methodName);
          console.log('[SignalR-Chat] Method arguments:', args);
        }
      });
    }
  },

  off(event, callback) {
    if (!this.connection) return;
    
    // Remove from tracking
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    
    this.connection.off(event, callback);
    console.log(`[SignalR-Chat] Removed listener for event: ${event}`);
  },

  async joinUserGroup(userId) {
    if (!this.connection) {
      console.warn('[SignalR-Chat] Connection not available for joining group');
      return;
    }
    
    if (this.connection.state !== HubConnectionState.Connected) {
      console.warn('[SignalR-Chat] Connection not connected, cannot join group');
      return;
    }
    
    try {
      await this.connection.invoke('JoinUserGroup', userId);
      console.log('[SignalR-Chat] Joined user group:', userId);
    } catch (error) {
      console.error('[SignalR-Chat] Error joining user group:', error);
      throw error;
    }
  },

  async leaveUserGroup(userId) {
    if (!this.connection) return;
    
    try {
      // Kiểm tra xem method có tồn tại không trước khi gọi
      console.log('[SignalR-Chat] Attempting to leave user group:', userId);
      await this.connection.invoke('LeaveUserGroup', userId);
      console.log('[SignalR-Chat] Left user group:', userId);
    } catch (error) {
      console.error('[SignalR-Chat] Error leaving user group:', error);
      // Không throw error vì có thể method không tồn tại
      console.log('[SignalR-Chat] LeaveUserGroup method may not exist on server');
    }
  },

  async joinRoom(roomId) {
    if (!this.connection) return;
    
    try {
      await this.connection.invoke('JoinRoom', roomId);
      console.log('[SignalR-Chat] Joined room:', roomId);
    } catch (error) {
      console.error('[SignalR-Chat] Error joining room:', error);
    }
  },

  // API: Lấy lịch sử chat giữa 2 user (toàn bộ)
  async getMessageHistory(userId1, userId2, returnRawResponse = false) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/history/${userId1}/${userId2}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (returnRawResponse) return res;
    return res.json();
  },

  // API: Lấy lịch sử chat với pagination
  async getMessageHistoryWithPagination(userId1, userId2, page = 1, pageSize = 20) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/history/${userId1}/${userId2}?page=${page}&pageSize=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  // API: Lấy danh sách candidate mà company đã nhắn
  async getMessagedCandidates(companyId) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/candidates-messaged/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  // API: Lấy danh sách company mà candidate đã nhắn
  async getMessagedCompanies(candidateId) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/companies-messaged/${candidateId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  // API: Gửi tin nhắn (text/file)
  async sendMessage({ senderId, receiverId, messageText, file, relatedJobId, isSticker }) {
    const token = await getToken();
    const formData = new FormData();
    formData.append('SenderId', senderId);
    formData.append('ReceiverId', receiverId);
    if (messageText) formData.append('MessageText', messageText);
    if (file) formData.append('File', file);
    if (relatedJobId) formData.append('RelatedJobId', relatedJobId);
    if (isSticker) formData.append('IsSticker', isSticker);
    const res = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    return res.json();
  },

  // API: Join SignalR group
  async joinGroup() {
    const token = await getToken();
    const res = await fetch(`${API_URL}/join-group`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  // API: Lấy số lượng candidate đã nhắn tin với company
  async getUniqueMessageUsersByCompany(companyId) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/candidates-messaged/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  },
};

export default chatService; 