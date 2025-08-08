import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../constants/api';
import HeaderDetail from '../../HeaderDetail';
import notificationService from '../../../services/notificationService';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const navigation = useNavigation();

  const fetchNotifications = useCallback(
    async ({ isRefresh = false, pageParam = 1, append = false } = {}) => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const skip = (pageParam - 1) * PAGE_SIZE;
        const url = `${BASE_URL}/api/notification?page=${pageParam}&pageSize=${PAGE_SIZE}&take=${PAGE_SIZE}&skip=${skip}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : [];

          if (append) {
            setNotifications((prev) => {
              const merged = [...prev, ...items];
              const dedupedMap = new Map();
              merged.forEach((n) => {
                const key = n.notificationId ?? `${n.createdAt}-${Math.random()}`;
                if (!dedupedMap.has(key)) dedupedMap.set(key, n);
              });
              return Array.from(dedupedMap.values());
            });
          } else {
            setNotifications(items);
          }

          setHasMore(items.length === PAGE_SIZE);
          setPage(pageParam);

          // Debug notification data
          debugNotificationData(items);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    []
  );

  const markAsRead = async (notificationId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${BASE_URL}/api/notification/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationId === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${BASE_URL}/api/notification/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset notification count in global service
      notificationService.resetCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchNotifications({ isRefresh: true, pageParam: 1, append: false });
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    fetchNotifications({ pageParam: nextPage, append: true });
  };

  useEffect(() => {
    fetchNotifications({ pageParam: 1, append: false });
    
    // Auto mark all notifications as read when entering the screen
    const autoMarkAllAsRead = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        await fetch(`${BASE_URL}/api/notification/read-all`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Reset notification count in global service
        notificationService.resetCount();
        
        // Update local state to show all notifications as read
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        
        console.log('Auto marked all notifications as read');
      } catch (error) {
        console.error('Error auto marking all notifications as read:', error);
      }
    };

    // Auto mark as read after a short delay to ensure notifications are loaded
    const timer = setTimeout(() => {
      autoMarkAllAsRead();
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  // Debug function to check notification data
  const debugNotificationData = (notifications) => {
    if (notifications.length > 0) {
      console.log('=== NOTIFICATION DEBUG ===');
      notifications.forEach((notification, index) => {
        console.log(`Notification ${index + 1}:`, {
          id: notification.notificationId,
          title: notification.title,
          createdAt: notification.createdAt,
          createdAtType: typeof notification.createdAt,
          parsedDate: new Date(notification.createdAt).toISOString(),
          isRead: notification.isRead
        });
      });
      console.log('=== END DEBUG ===');
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    
    // Luôn cộng 7 tiếng để chuyển sang giờ Việt Nam
    date.setHours(date.getHours() + 7);
    
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    return date.toLocaleDateString("en-US");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_application':
        return 'briefcase';
      case 'message':
        return 'message-circle';
      case 'interview':
        return 'calendar';
      case 'cv_match':
        return 'user-check';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job_application':
        return '#2563eb';
      case 'message':
        return '#10b981';
      case 'interview':
        return '#f59e0b';
      case 'cv_match':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => markAsRead(item.notificationId)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          {item.companyLogo ? (
            <Image
              source={{ uri: item.companyLogo }}
              style={styles.companyLogo}
              resizeMode="cover"
            />
          ) : (
            <View style={[
              styles.iconBackground,
              { backgroundColor: getNotificationColor(item.type) + '20' }
            ]}>
              <Feather
                name={getNotificationIcon(item.type)}
                size={20}
                color={getNotificationColor(item.type)}
              />
            </View>
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>
            {item.title || 'New notification'}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message || ''}
          </Text>
          <Text style={styles.notificationTime}>
            {timeAgo(item.createdAt)}
          </Text>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>
        You'll see notifications about your job applications, messages, and updates here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <HeaderDetail />
      
      {/* Title and Mark all read button */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item.notificationId?.toString() || index.toString()}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmptyState}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  titleContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: -2,
    fontFamily: 'Poppins-Regular',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 0,
    fontFamily: 'Poppins-Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationScreen; 