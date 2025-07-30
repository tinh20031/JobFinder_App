import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Modal, Pressable, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/api';
import useResumeData from '../services/useResumeData';
import { authService } from '../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startNotificationHub, stopNotificationHub } from '../services/notificationHub';

const HeaderCandidates = ({ onDashboard }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const navigation = useNavigation();
  const { profile } = useResumeData();

  // Lấy notification ban đầu (giả lập, cần thay bằng API thật nếu có)
  useEffect(() => {
    async function fetchNotifications(all = false) {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        // Lấy 5 notification mới nhất hoặc toàn bộ
        const url = all ? `${BASE_URL}/api/notification` : `${BASE_URL}/api/notification?page=1&pageSize=5`;
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (e) {}
    }
    async function fetchUnreadCount() {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/api/notification/unread-count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data?.count || 0);
        }
      } catch (e) {}
    }
    fetchNotifications(showAll);
    fetchUnreadCount();
  }, [showAll]);

  // Kết nối SignalR notification realtime
  useEffect(() => {
    let hubConnection;
    async function connectHub() {
      // Lấy userId đúng key 'UserId' (chữ U hoa)
      hubConnection = await startNotificationHub((notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }
    connectHub();
    return () => {
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

  const handleBellPress = async () => {
    setDropdownVisible((prev) => !prev);
    if (unreadCount > 0) {
      const token = await AsyncStorage.getItem('token');
      try {
        await fetch(`${BASE_URL}/api/notification/read-all`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setUnreadCount(0);
      } catch (e) {}
    }
  };

  const handleMessagePress = () => {
    navigation.navigate('Listchat');
  };

  const renderNotification = ({ item }) => (
    <View style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}>
      <Text style={styles.notificationTitle}>{item.title || 'New notification'}</Text>
      <Text style={styles.notificationMessage}>{item.message || ''}</Text>
      <Text style={styles.notificationTime}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../images/jobfinder-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleBellPress} style={styles.bellWrapper}>
          <MaterialIcons name="notifications" size={36} color="#2563eb" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMessagePress} style={styles.messageWrapper}>
          <MaterialIcons name="message" size={32} color="#2563eb" />
        </TouchableOpacity>
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setDropdownVisible(false)}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownHeader}>Notifications</Text>
              <FlatList
                data={notifications}
                keyExtractor={(item, index) => item.notificationId?.toString() || index.toString()}
                renderItem={renderNotification}
                ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
                style={{ maxHeight: 300 }}
              />
              {!showAll && notifications.length >= 5 && (
                <TouchableOpacity style={styles.viewAllBtn} onPress={() => setShowAll(true)}>
                  <Text style={styles.viewAllText}>View All Notifications</Text>
                </TouchableOpacity>
              )}
              {showAll && notifications.length > 5 && (
                <TouchableOpacity style={styles.viewAllBtn} onPress={() => setShowAll(false)}>
                  <Text style={styles.viewAllText}>Show less</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>
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
  messageWrapper: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 260,
    maxWidth: 320,
    width: '90%',
    zIndex: 100,
  },
  dropdownHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 4,
  },
  notificationItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  unreadNotification: {
    backgroundColor: '#f1f6fd',
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
  viewAllBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewAllText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HeaderCandidates; 