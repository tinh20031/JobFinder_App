import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderDetail from '../../components/HeaderCandidate';
import chatService from '../../services/chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Listchat = () => {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);
  const navigation = useNavigation();

  // Đưa fetchContacts ra ngoài useEffect để có thể gọi lại
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      const candidateId = await AsyncStorage.getItem('UserId');
      let url = `${BASE_URL}/api/message/companies-messaged/${candidateId}`;
      if (!url.includes('/api/')) {
        console.warn('API URL missing /api:', url);
      } else {
    
      }
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const status = res.status;
      let data = [];
      if (status === 200) {
        try {
          const rawData = await res.json();
          data = Array.isArray(rawData)
            ? rawData.map(item => ({
                id: item.companyId,
                name: item.companyName || item.senderFullName || '',
                avatar: item.urlCompanyLogo || item.senderImage || '',
                lastMessageText: item.messageText,
                timestamp: item.sentAt,
                unreadCount: 0,
              }))
            : [];
        } catch (jsonErr) {
          console.log('JSON parse error:', jsonErr);
          data = [];
        }
      } else {
        const text = await res.text();
        console.log('API error response:', text);
        data = [];
      }
      console.log('Response status:', status);
      console.log('API data:', data);
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Error loading conversations:', e);
      setError('Failed to load conversations');
    }
    setLoading(false);
  };

  // Gọi fetchContacts khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );

  // Lắng nghe sự kiện realtime từ SignalR
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setContacts(prevContacts => {
        // Kiểm tra contact liên quan (sender hoặc receiver)
        const idx = prevContacts.findIndex(contact =>
          contact.id === message.senderId || contact.id === message.receiverId
        );
        let updatedContact = null;
        if (idx !== -1) {
          // Cập nhật contact cũ
          updatedContact = {
            ...prevContacts[idx],
            lastMessageText: message.messageText,
            timestamp: message.sentAt || message.timestamp,
            unreadCount: (prevContacts[idx].unreadCount || 0) + 1,
          };
          // Đưa contact này lên đầu danh sách
          const newList = [
            updatedContact,
            ...prevContacts.slice(0, idx),
            ...prevContacts.slice(idx + 1),
          ];
          return newList;
        } else {
          // Nếu là tin nhắn từ người mới, thêm mới vào đầu danh sách
          return [
            {
              id: message.senderId,
              name: message.senderName || 'New User',
              avatar: message.senderAvatar || '',
              lastMessageText: message.messageText,
              timestamp: message.sentAt || message.timestamp,
              unreadCount: 1,
            },
            ...prevContacts,
          ];
        }
      });
    };
    chatService.on('ReceiveMessage', handleReceiveMessage);
    return () => {
      chatService.off('ReceiveMessage', handleReceiveMessage);
    };
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(search.toLowerCase())
  );

  function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return date.toLocaleDateString();
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatDetail', { contact: item })}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadgeOnAvatar}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameTimeRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.timestamp ? formatTimeAgo(item.timestamp) : ''}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>{item.lastMessageText || ''}</Text>
      </View>
      {item.unreadCount > 0 && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderDetail />
      <View style={styles.headerBelow}>
        {/* <Text style={styles.headerTitle}>Messages</Text> */}
   
      </View>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#bbb" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search message"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#bbb"
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredContacts.length === 0 ? (
        <Text style={styles.emptyText}>No conversations found.</Text>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id?.toString() || item._id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  headerBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 8,
    backgroundColor: '#fafbfc',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Poppins-Bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3f7',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#222',
    fontFamily: 'Poppins-Regular',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  unreadBadgeOnAvatar: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Poppins-Bold',
    // maxWidth: 140, // bỏ giới hạn chiều rộng để không bị cắt tên
  },
  message: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  time: {
    fontSize: 12,
    color: '#bbb',
    marginLeft: 8,
    minWidth: 60,
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff9800',
    alignSelf: 'flex-end',
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins-Regular',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins-Regular',
  },
});

export default Listchat; 