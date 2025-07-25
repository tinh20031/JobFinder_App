import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@microsoft/signalr';
import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${BASE_URL}/Message`;

async function getToken() {
  return await AsyncStorage.getItem('token');
}

const chatService = {
  connection: null,
  hubUrl: `${BASE_URL.replace('/api', '')}/chatHub`,

  async startConnection() {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;
    const token = await getToken();
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();
    await this.connection.start();
  },

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  },

  on(event, callback) {
    if (this.connection) this.connection.on(event, callback);
  },

  off(event, callback) {
    if (this.connection) this.connection.off(event, callback);
  },

  async joinUserGroup(userId) {
    if (this.connection) {
      await this.connection.invoke('JoinUserGroup', userId);
    }
  },

  async leaveUserGroup(userId) {
    if (this.connection) {
      await this.connection.invoke('LeaveUserGroup', userId);
    }
  },

  async joinRoom(roomId) {
    if (this.connection) {
      await this.connection.invoke('JoinRoom', roomId);
    }
  },

  // API: Lấy lịch sử chat giữa 2 user (toàn bộ)
  async getMessageHistory(userId1, userId2) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/history/${userId1}/${userId2}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
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