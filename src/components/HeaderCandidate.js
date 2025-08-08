import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/api';
import useResumeData from '../services/useResumeData';
import { authService } from '../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startNotificationHub, stopNotificationHub } from '../services/notificationHub';
import notificationService from '../services/notificationService';

// Debug: Check if notificationService is properly imported
console.log('NotificationService imported:', !!notificationService);
console.log('NotificationService methods:', Object.keys(notificationService || {}));

const HeaderCandidates = ({ onDashboard }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();
  const { profile } = useResumeData();

  // Subscribe to notification service
  useEffect(() => {
    // Initialize notification service
    if (notificationService && typeof notificationService.initialize === 'function') {
      notificationService.initialize();
      
      // Subscribe to notification count changes
      const unsubscribe = notificationService.subscribe((count) => {
        setUnreadCount(count);
      });
      
      // Refresh unread count every 30 seconds to ensure sync
      const interval = setInterval(() => {
        if (notificationService && typeof notificationService.fetchUnreadCount === 'function') {
          notificationService.fetchUnreadCount();
        } else {
          // Fallback to direct fetch
          fetchUnreadCountDirectly();
        }
      }, 30000);
      
      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    } else {
      console.error('NotificationService not properly initialized');
    }
  }, []);

  // Connect SignalR notification realtime
  useEffect(() => {
    let hubConnection;
    async function connectHub() {
      try {
        hubConnection = await startNotificationHub((notification) => {
          console.log('Received real-time notification:', notification);
          // Update notification count through service
          try {
            if (notificationService && typeof notificationService.handleNewNotification === 'function') {
              notificationService.handleNewNotification();
              console.log('Notification count updated via service');
            } else {
              // Fallback: fetch from server directly
              fetchUnreadCountDirectly();
              console.log('Notification count updated via direct fetch');
            }
          } catch (serviceError) {
            console.error('Error updating notification count:', serviceError);
            // Fallback: fetch from server
            fetchUnreadCountDirectly();
          }
        });
        console.log('SignalR connected successfully');
      } catch (error) {
        console.error('SignalR connection failed:', error);
        // Fallback: continue with polling instead of real-time
        console.log('Falling back to polling for notifications');
      }
    }
    
    // Delay connection to ensure app is fully loaded
    const timer = setTimeout(() => {
      connectHub();
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      stopNotificationHub();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Fallback function to fetch unread count directly
  const fetchUnreadCountDirectly = async () => {
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
        setUnreadCount(data?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count directly:', error);
    }
  };

  const handleBellPress = () => {
    // Refresh unread count before navigating
    if (notificationService && typeof notificationService.fetchUnreadCount === 'function') {
      notificationService.fetchUnreadCount();
    } else {
      // Fallback to direct fetch
      fetchUnreadCountDirectly();
    }
    navigation.navigate('NotificationScreen');
  };





  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../images/jobfinder-logohead.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleBellPress} style={styles.bellWrapper}>
          <Feather name="bell" size={30} color="#2563eb" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    width: '100%',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 160,
    height: 40,
    tintColor: '#2563eb',
  },
  bellWrapper: {
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

});

export default HeaderCandidates; 