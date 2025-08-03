import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/api';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.unreadCount = 0;
    this.isInitialized = false;
  }

  // Subscribe to notification count changes
  subscribe(callback) {
    this.listeners.push(callback);
    // Immediately call with current count
    callback(this.unreadCount);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of count change
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.unreadCount);
    });
  }

  // Update unread count and notify listeners
  updateUnreadCount(count) {
    this.unreadCount = count;
    this.notifyListeners();
  }

  // Fetch unread count from server
  async fetchUnreadCount() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/notification/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const count = data?.count || 0;
        this.updateUnreadCount(count);
        return count;
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
    return 0;
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;
    
    await this.fetchUnreadCount();
    this.isInitialized = true;
  }

  // Handle real-time notification
  handleNewNotification() {
    this.unreadCount += 1;
    this.notifyListeners();
  }

  // Reset count (when user marks all as read)
  resetCount() {
    this.updateUnreadCount(0);
  }

  // Get current count
  getCurrentCount() {
    return this.unreadCount;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 