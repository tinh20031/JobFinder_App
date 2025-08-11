import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderDetail from '../../components/HeaderDetail';
import chatService from '../../services/chatService';
import profileService from '../../services/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { Image as RNImage } from 'react-native';

const ChatDetail = (props) => {
  const route = useRoute();
  const { contact, partnerOnline: propPartnerOnline } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();
  const [userId, setUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [partnerOnline, setPartnerOnline] = useState(propPartnerOnline || false);
  const [candidateAvatar, setCandidateAvatar] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  // Lấy avatar của candidate
  useEffect(() => {
    const fetchCandidateAvatar = async () => {
      try {
        setAvatarLoading(true);
        const candidateId = await AsyncStorage.getItem('UserId');
        if (candidateId) {
          // Sử dụng profileService để lấy profile như HomeScreen
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          
          const profilePromise = profileService.getCandidateProfile();
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          
          if (profile && profile.image) {
            setCandidateAvatar(profile.image);
          } else {
            // Fallback to default avatar
            setCandidateAvatar('https://randomuser.me/api/portraits/men/1.jpg');
          }
        }
      } catch (error) {
        console.error('Error fetching candidate avatar:', error);
        setCandidateAvatar('https://randomuser.me/api/portraits/men/1.jpg');
      } finally {
        setAvatarLoading(false);
      }
    };
    
    fetchCandidateAvatar();
  }, []);

  // Lấy lịch sử chat thực tế
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const candidateId = await AsyncStorage.getItem('UserId');
      setUserId(candidateId);
      if (!contact?.id || !candidateId) {
        setMessages([]);
        setLoading(false);
        return;
      }
      try {
        const token = await AsyncStorage.getItem('token');
        const url = `${chatService.hubUrl.replace('/chatHub','')}/api/Message/history/${candidateId}/${contact.id}`;
    
        const res = await chatService.getMessageHistory(candidateId, contact.id, true);
        const status = res.status;
        const text = await res.text();
        let data = [];
        if (status === 200) {
          if (!text || text.trim() === '') {
            data = [];
          } else {
            try {
              data = JSON.parse(text);
            } catch (jsonErr) {
              data = [];
            }
          }
        } else {
          data = [];
        }
        
        // Map dữ liệu về đúng format cho UI và loại bỏ duplicates
        const mapped = Array.isArray(data)
          ? data.map(msg => ({
              id: msg.messageId || msg.id,
              text: msg.messageText || '',
              time: msg.sentAt ? formatTime(msg.sentAt) : '',
              sender: String(msg.senderId) === String(candidateId) ? 'me' : 'other',
              status: msg.isSeen ? 'seen' : 'sent',
              file: msg.fileUrl
                ? {
                    name: msg.fileName || msg.fileUrl.split('/').pop(),
                    size: msg.fileSize || '',
                    type: msg.fileType || '',
                    url: msg.fileUrl,
                  }
                : undefined,
              avatar: String(msg.senderId) === String(candidateId) ? candidateAvatar : contact.avatar,
              senderName: msg.senderFullName || '',
              // Add message data like web
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              sentAt: msg.sentAt,
              senderIsOnline: msg.senderIsOnline,
              receiverIsOnline: msg.receiverIsOnline,
            }))
          : [];
        
        // Loại bỏ duplicates dựa trên messageId và sort theo thời gian
        const uniqueMessages = mapped
          .filter((msg, index, self) =>
            index === self.findIndex(m => m.id === msg.id)
          )
          .sort((a, b) => {
            const timeA = new Date(a.sentAt || a.time).getTime();
            const timeB = new Date(b.sentAt || b.time).getTime();
            return timeA - timeB;
          });
        
        setMessages(uniqueMessages);
      } catch (e) {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [contact, candidateAvatar]);

  // Khởi tạo SignalR connection và join user group
  useEffect(() => {
    const initializeChatConnection = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Khởi tạo connection nếu chưa có
        await chatService.startConnection();
        
        // Kiểm tra connection status
        if (chatService.connection) {
          if (chatService.connection.state === 'Connected') {
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('failed');
          }
        }
        
        // Join user group để nhận tin nhắn realtime
        if (userId && chatService.connection?.state === 'Connected') {
          await chatService.joinUserGroup(userId);
        }
      } catch (error) {
        setConnectionStatus('failed');
      }
    };

    if (userId) {
      initializeChatConnection();
    }

    // Cleanup khi component unmount
    return () => {
      // Không stop connection ở đây vì có thể có component khác đang dùng
    };
  }, [userId]);

  // Debug connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (chatService.connection) {
        const state = chatService.connection.state;
        
        // Chỉ log khi có thay đổi trạng thái
        if (state !== connectionStatus) {
          if (state === 'Connected') {
            setConnectionStatus('connected');
          } else if (state === 'Disconnected') {
            setConnectionStatus('disconnected');
          } else if (state === 'Connecting') {
            setConnectionStatus('connecting');
          }
        }
      } else {
        if (connectionStatus !== 'disconnected') {
          setConnectionStatus('disconnected');
        }
      }
    };

    // Check status every 30 seconds instead of 10 seconds to reduce spam
    const interval = setInterval(checkConnectionStatus, 30000);
    
    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Force rejoin user group function
  const forceRejoinUserGroup = async () => {
    try {
      if (chatService.connection && chatService.connection.state === 'Connected') {
        // Try to join user group directly without leaving first
        try {
          await chatService.joinUserGroup(userId);
        } catch (error) {
          console.error('Error rejoining group:', error);
          
          // If join fails, try to restart connection
          try {
            await chatService.stopConnection();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await chatService.startConnection();
            await chatService.joinUserGroup(userId);
          } catch (restartError) {
            console.error('Error restarting connection:', restartError);
          }
        }
      } else {
        // Try to start connection
        try {
          await chatService.startConnection();
          await chatService.joinUserGroup(userId);
        } catch (error) {
          console.error('Error starting connection:', error);
        }
      }
    } catch (error) {
      console.error('Force rejoin error:', error);
    }
  };

  useEffect(() => {
    if (!userId || !contact?.id) return;
    
    const handleReceiveMessage = (msg) => {
      // Chỉ thêm tin nhắn nếu thuộc cuộc trò chuyện hiện tại
      if (
        (String(msg.senderId) === String(userId) && String(msg.receiverId) === String(contact.id)) ||
        (String(msg.senderId) === String(contact.id) && String(msg.receiverId) === String(userId))
      ) {
        // Chỉ xử lý tin nhắn từ người khác (không phải của mình)
        if (String(msg.senderId) !== String(userId)) {
          // Kiểm tra xem tin nhắn đã tồn tại chưa để tránh duplicate
          setMessages(prev => {
            // Loại bỏ temporary messages
            const messagesWithoutTemp = prev.filter(msg => !msg.id.startsWith('temp-'));
            
            const messageExists = messagesWithoutTemp.some(existingMsg => 
              existingMsg.id === (msg.messageId || msg.id)
            );
            
            if (messageExists) {
              return prev; // Giữ nguyên state nếu tin nhắn đã tồn tại
            }
            
            const newMessage = {
              id: msg.messageId || msg.id,
              text: msg.messageText || '',
              time: msg.sentAt ? formatTime(msg.sentAt) : '',
              sender: 'other',
              status: msg.isSeen ? 'seen' : 'sent',
              file: msg.fileUrl
                ? {
                    name: msg.fileName || msg.fileUrl.split('/').pop(),
                    size: msg.fileSize || '',
                    type: msg.fileType || '',
                    url: msg.fileUrl,
                  }
                : undefined,
              avatar: contact.avatar,
              senderName: msg.senderFullName || '',
              // Add message data like web
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              sentAt: msg.sentAt,
              senderIsOnline: msg.senderIsOnline,
              receiverIsOnline: msg.receiverIsOnline,
            };
            
            // Sort messages by time to maintain order
            const updatedMessages = [...messagesWithoutTemp, newMessage].sort((a, b) => {
              const timeA = new Date(a.sentAt || a.time).getTime();
              const timeB = new Date(b.sentAt || b.time).getTime();
              return timeA - timeB;
            });
            
            return updatedMessages;
          });
        }
      }
    };

    // Handle online status updates
    const handleOnlineStatusUpdate = (data) => {
      if (data.userId === contact.id) {
        setPartnerOnline(data.isOnline);
      }
    };

    // Handle user online status changed
    const handleUserOnlineStatusChanged = (data) => {
      if (data.userId === contact.id) {
        setPartnerOnline(data.isOnline);
      }
    };

    // Đăng ký listener cho tin nhắn realtime
    chatService.on('ReceiveMessage', handleReceiveMessage);
    
    // Thêm listener cho các method khác có thể được server gửi
    chatService.on('ReceiveMessageAsync', handleReceiveMessage);
    chatService.on('ReceiveMessageToUser', handleReceiveMessage);
    chatService.on('MessageReceived', handleReceiveMessage);
    chatService.on('NewMessage', handleReceiveMessage);
    chatService.on('SendMessage', handleReceiveMessage);
    chatService.on('MessageSent', handleReceiveMessage);
    
    // Register online status listeners
    chatService.on('UserOnlineStatusChanged', handleUserOnlineStatusChanged);
    chatService.on('OnlineStatusUpdate', handleOnlineStatusUpdate);
    chatService.on('useronlinestatuschanged', handleUserOnlineStatusChanged);
    
    // Thêm listener cho tất cả các method từ server
    if (chatService.connection) {
      chatService.connection.on('*', (methodName, ...args) => {
        
        // Nếu là tin nhắn, xử lý
        if (methodName.toLowerCase().includes('message') || methodName.toLowerCase().includes('receive')) {
          if (args && args.length > 0) {
            handleReceiveMessage(args[0]);
          }
        }
        
        // Nếu là online status, xử lý
        if (methodName.toLowerCase().includes('online') || methodName.toLowerCase().includes('status')) {
          if (args && args.length > 0) {
            handleUserOnlineStatusChanged(args[0]);
          }
        }
      });
    }
    
    return () => {
      chatService.off('ReceiveMessage', handleReceiveMessage);
      chatService.off('ReceiveMessageAsync', handleReceiveMessage);
      chatService.off('ReceiveMessageToUser', handleReceiveMessage);
      chatService.off('MessageReceived', handleReceiveMessage);
      chatService.off('NewMessage', handleReceiveMessage);
      chatService.off('SendMessage', handleReceiveMessage);
      chatService.off('MessageSent', handleReceiveMessage);
      
      // Remove online status listeners
      chatService.off('UserOnlineStatusChanged', handleUserOnlineStatusChanged);
      chatService.off('OnlineStatusUpdate', handleOnlineStatusUpdate);
      chatService.off('useronlinestatuschanged', handleUserOnlineStatusChanged);
    };
  }, [userId, contact]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [messages]);

  // Thêm effect để scroll khi input thay đổi (khi user đang gõ)
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: false });
        }
      }, 50);
    }
  }, [input]);

  // Hàm chọn file
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setSelectedFile(res);
      if (res.type && res.type.startsWith('image/')) {
        setImagePreviewUrl(res.uri);
      } else {
        setImagePreviewUrl(null);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.log('File pick error:', err);
      }
    }
  };

  // Hàm gửi tin nhắn (có thể gửi file)
  const handleSend = useCallback(async () => {
    if (isSending || (!input.trim() && !selectedFile)) {
      return;
    }
    
    setIsSending(true);
    
    // Tạo temporary message để hiển thị ngay lập tức
    const tempMessage = {
      id: 'temp-' + Date.now(),
      text: input,
      time: formatTime(new Date().toISOString()),
      sender: 'me',
      status: 'sending',
      file: selectedFile
        ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            url: imagePreviewUrl || selectedFile.uri,
          }
        : undefined,
      avatar: candidateAvatar,
      senderName: '',
      senderId: userId,
      receiverId: contact.id,
      sentAt: new Date().toISOString(),
    };
    
    setSendingMessage(tempMessage);
    
    // Thêm timeout để đảm bảo state được reset nếu có lỗi
    const timeoutId = setTimeout(() => {
      setIsSending(false);
      setSendingMessage(null);
    }, 10000); // 10 giây timeout
    
    try {
      let res;
      if (selectedFile) {
        const fileToSend = {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type || 'application/octet-stream',
        };
        res = await chatService.sendMessage({
          senderId: userId,
          receiverId: contact.id,
          messageText: input,
          file: fileToSend,
        });
      } else {
        res = await chatService.sendMessage({
          senderId: userId,
          receiverId: contact.id,
          messageText: input,
        });
      }
      
      // Xóa temporary message và thêm tin nhắn thật từ server
      setSendingMessage(null);
      
      if (res && (res.messageId || res.id)) {
        const newMessage = {
          id: res.messageId || res.id,
          text: input,
          time: formatTime(new Date().toISOString()),
          sender: 'me',
          status: 'sent',
          file: selectedFile
            ? {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type,
                url: imagePreviewUrl || selectedFile.uri,
              }
            : undefined,
          avatar: candidateAvatar,
          senderName: '',
          senderId: userId,
          receiverId: contact.id,
          sentAt: new Date().toISOString(),
        };
        
        setMessages(prev => {
          // Loại bỏ temporary message nếu có
          const messagesWithoutTemp = prev.filter(msg => msg.id !== tempMessage.id);
          
          // Kiểm tra xem tin nhắn đã tồn tại chưa
          const messageExists = messagesWithoutTemp.some(existingMsg => 
            existingMsg.id === newMessage.id
          );
          
          if (messageExists) {
            return messagesWithoutTemp;
          }
          
          // Sort messages by time
          const updatedMessages = [...messagesWithoutTemp, newMessage].sort((a, b) => {
            const timeA = new Date(a.sentAt || a.time).getTime();
            const timeB = new Date(b.sentAt || b.time).getTime();
            return timeA - timeB;
          });
          
          return updatedMessages;
        });
      }
      
      setInput('');
      setSelectedFile(null);
      setImagePreviewUrl(null);
      
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        userId,
        contactId: contact?.id
      });
      // Xóa temporary message nếu có lỗi
      setSendingMessage(null);
    } finally {
      // Clear timeout và reset state
      clearTimeout(timeoutId);
      setIsSending(false);
      setSendingMessage(null);
      
      // Force re-render để đảm bảo button update
      setTimeout(() => {
        if (isSending) {
          setIsSending(false);
        }
      }, 100);
    }
  }, [isSending, input, selectedFile, userId, contact, imagePreviewUrl, candidateAvatar]);

  // Thêm effect để đảm bảo state được reset khi component unmount
  useEffect(() => {
    return () => {
      setIsSending(false);
      setSendingMessage(null);
    };
  }, []);

  // Thêm effect để reset state khi input thay đổi (nếu đang stuck)
  useEffect(() => {
    if (input.trim() && isSending) {
      setIsSending(false);
    }
  }, [input]);

  // Thêm effect để force reset sau 5 giây nếu button vẫn stuck
  useEffect(() => {
    if (isSending) {
      const resetTimer = setTimeout(() => {
        setIsSending(false);
      }, 5000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [isSending]);

  // Thêm effect để kiểm tra button state mỗi giây
  useEffect(() => {
    const checkButtonState = () => {
      // Nếu button đang stuck quá lâu, force reset
      if (isSending) {
        // Button state check
      }
    };

    const interval = setInterval(checkButtonState, 1000);
    return () => clearInterval(interval);
  }, [isSending]);

  // Thêm effect để auto reset nếu button stuck quá 3 giây
  useEffect(() => {
    if (isSending) {
      const autoResetTimer = setTimeout(() => {
        setIsSending(false);
      }, 3000);
      
      return () => clearTimeout(autoResetTimer);
    }
  }, [isSending]);

  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const renderMessage = ({ item }) => {
    if (item.file) {
      return (
        <View style={[styles.messageRow, item.sender === 'me' ? styles.right : styles.left]}>
          <View style={[styles.fileBubble, item.sender === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
            <View style={styles.fileRow}>
              <MaterialIcons name="picture-as-pdf" size={32} color="#e74c3c" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.fileName}>{item.file.name}</Text>
                <Text style={styles.fileSize}>{item.file.size}</Text>
              </View>
            </View>
            <Text style={styles.timeInBubble}>{item.time}</Text>
          </View>
        </View>
      );
    }
    
    // Xác định avatar URL dựa trên sender
    let avatarUrl;
    if (item.sender === 'me') {
      // Tin nhắn của candidate
      avatarUrl = candidateAvatar || 'https://randomuser.me/api/portraits/men/1.jpg';
    } else {
      // Tin nhắn của contact
      avatarUrl = contact?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg';
    }
    
    return (
      <View style={[styles.messageRow, item.sender === 'me' ? styles.right : styles.left]}>
        {item.sender === 'other' && (
          <View style={{ position: 'relative', marginRight: 8 }}>
            <Image 
              source={{ uri: avatarUrl }} 
              style={styles.messageAvatar}
              defaultSource={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
              onError={() => {
                // Fallback to default avatar on error
                console.log('Avatar load error, using default');
              }}
            />
          </View>
        )}
        <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={item.sender === 'me' ? styles.messageText : styles.messageTextLeft}>{item.text}</Text>
          <View style={styles.bubbleFooter}>
            <Text style={styles.timeInBubble}>{item.time}</Text>
            {item.sender === 'me' && (
              <MaterialIcons 
                name={item.status === 'sending' ? 'schedule' : 'done-all'} 
                size={18} 
                color={item.status === 'sending' ? '#ff9800' : item.status === 'seen' ? '#4fc3f7' : '#bbb'} 
                style={{ marginLeft: 4 }} 
              />
            )}
          </View>
        </View>
        {item.sender === 'me' && (
          <View style={{ position: 'relative', marginLeft: 8 }}>
            {avatarLoading ? (
              <View style={[styles.messageAvatar, { backgroundColor: '#e5e7eb' }]} />
            ) : (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.messageAvatar}
                defaultSource={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                onError={() => {
                  // Fallback to default avatar on error
                  console.log('Avatar load error, using default');
                }}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  // Xác định trạng thái online/offline - match với web logic
  // Ưu tiên trạng thái online realtime từ state partnerOnline
  let partnerIsOnline = partnerOnline;
  // Nếu state chưa có, fallback về trạng thái từ message cuối
  if (partnerIsOnline === undefined && messages && messages.length > 0 && contact) {
    const lastMessage = messages[messages.length - 1];
    if (contact.id === lastMessage.senderId && 'senderIsOnline' in lastMessage) {
      partnerIsOnline = lastMessage.senderIsOnline;
    } else if (contact.id === lastMessage.receiverId && 'receiverIsOnline' in lastMessage) {
      partnerIsOnline = lastMessage.receiverIsOnline;
    }
  }

  // Update online status based on recent activity - match web logic
  useEffect(() => {
    if (messages.length > 0 && contact) {
      const lastMessage = messages[messages.length - 1];
      
      // Chỉ cập nhật online status nếu chưa có thông tin online từ SignalR
      if (partnerOnline === undefined || partnerOnline === null) {
        // Nếu tin nhắn cuối cùng là từ contact và có thông tin online
        if (contact.id === lastMessage.senderId && 'senderIsOnline' in lastMessage) {
          setPartnerOnline(lastMessage.senderIsOnline);
        } else if (contact.id === lastMessage.receiverId && 'receiverIsOnline' in lastMessage) {
          setPartnerOnline(lastMessage.receiverIsOnline);
        }
      }
    }
  }, [messages, contact, partnerOnline]);

  // Force refresh messages from server
  const forceRefreshMessages = async () => {
    // Không refresh nếu đang gửi tin nhắn
    if (isSending || sendingMessage) {
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      const candidateId = await AsyncStorage.getItem('UserId');
      if (!contact?.id || !candidateId) {
        return;
      }
      
      const res = await chatService.getMessageHistory(candidateId, contact.id, true);
      const status = res.status;
      const text = await res.text();
      
      let data = [];
      if (status === 200) {
        if (!text || text.trim() === '') {
          data = [];
        } else {
          try {
            data = JSON.parse(text);
          } catch (jsonErr) {
            data = [];
          }
        }
      } else {
        data = [];
      }
      
      // Map dữ liệu về đúng format cho UI
      const mapped = Array.isArray(data)
        ? data.map(msg => ({
            id: msg.messageId || msg.id,
            text: msg.messageText || '',
            time: msg.sentAt ? formatTime(msg.sentAt) : '',
            sender: String(msg.senderId) === String(candidateId) ? 'me' : 'other',
            status: msg.isSeen ? 'seen' : 'sent',
            file: msg.fileUrl
              ? {
                  name: msg.fileName || msg.fileUrl.split('/').pop(),
                  size: msg.fileSize || '',
                  type: msg.fileType || '',
                  url: msg.fileUrl,
                }
              : undefined,
            avatar: String(msg.senderId) === String(candidateId) ? candidateAvatar : contact.avatar,
            senderName: msg.senderFullName || '',
            // Add message data like web
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            sentAt: msg.sentAt,
            senderIsOnline: msg.senderIsOnline,
            receiverIsOnline: msg.receiverIsOnline,
          }))
        : [];
      
      setMessages(prev => {
        // Loại bỏ temporary messages trước khi merge
        const messagesWithoutTemp = prev.filter(msg => !msg.id.startsWith('temp-'));
        
        // Chỉ lấy tin nhắn từ người khác (không phải của current user)
        const messagesFromOthers = mapped.filter(msg => msg.sender === 'other');
        
        // Giữ lại tin nhắn của current user từ state hiện tại
        const myMessages = messagesWithoutTemp.filter(msg => msg.sender === 'me');
        
        // Merge messages từ người khác với tin nhắn của mình
        const allMessages = [...myMessages, ...messagesFromOthers];
        
        // Remove duplicates based on messageId
        const uniqueMessages = allMessages.filter((msg, index, self) =>
          index === self.findIndex(m => m.id === msg.id)
        );
        
        // Sort by time to maintain chronological order
        return uniqueMessages.sort((a, b) => {
          const timeA = new Date(a.sentAt || a.time).getTime();
          const timeB = new Date(b.sentAt || b.time).getTime();
          return timeA - timeB;
        });
      });
      
    } catch (error) {
      console.error('Error refreshing messages:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto refresh messages every 10 seconds (increased to reduce interference)
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      // Chỉ refresh nếu không đang gửi tin nhắn
      // Auto-refresh chỉ lấy tin nhắn từ người khác để tránh duplicate với tin nhắn của mình
      if (!isSending && !sendingMessage && !isRefreshing) {
        forceRefreshMessages();
      }
    }, 10000); // 10 seconds
    
    return () => clearInterval(autoRefreshInterval);
  }, [contact, isSending, sendingMessage, isRefreshing]);

  // Auto refresh online status every 30 seconds (longer interval to avoid interference)
  useEffect(() => {
    const onlineStatusInterval = setInterval(() => {
      fetchOnlineStatus();
    }, 30000); // 30 seconds
    
    return () => clearInterval(onlineStatusInterval);
  }, [contact]);

  // Fetch online status when component mounts
  useEffect(() => {
    if (contact?.id) {
      fetchOnlineStatus();
    }
  }, [contact]);

  // Fetch online status from server
  const fetchOnlineStatus = async () => {
    try {
      // Gọi API để lấy online status - thử nhiều endpoint khác nhau
      const token = await AsyncStorage.getItem('token');
      const baseUrl = chatService.hubUrl.replace('/chatHub','');
      
      // Thử các endpoint khác nhau
      const endpoints = [
        `/api/User/online-status/${contact.id}`,
        `/api/User/${contact.id}/online-status`,
        `/api/User/status/${contact.id}`,
        `/api/Message/user-status/${contact.id}`,
        `/api/Message/online-status/${contact.id}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.isOnline !== undefined) {
              // Chỉ cập nhật nếu status thay đổi đáng kể
              if (partnerOnline !== data.isOnline) {
                setPartnerOnline(data.isOnline);
              }
              return; // Success, exit loop
            } else if (data.online !== undefined) {
              if (partnerOnline !== data.online) {
                setPartnerOnline(data.online);
              }
              return; // Success, exit loop
            } else if (data.status !== undefined) {
              const newStatus = data.status === 'online';
              if (partnerOnline !== newStatus) {
                setPartnerOnline(newStatus);
              }
              return; // Success, exit loop
            }
          }
        } catch (endpointError) {
          console.log('Endpoint failed:', endpoint, endpointError.message);
        }
      }
      
      // Nếu không tìm thấy endpoint, thử dựa vào connection status
      if (connectionStatus === 'connected' && partnerOnline !== true) {
        setPartnerOnline(true);
      }
      
    } catch (error) {
      console.error('Error fetching online status:', error);
      
      // Fallback: sử dụng connection status
      if (connectionStatus === 'connected' && partnerOnline !== true) {
        setPartnerOnline(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <HeaderDetail />
        <View style={styles.headerBelow}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: contact?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.name}>{contact?.name || ''}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={[
                  styles.onlineIndicator, 
                  { backgroundColor: partnerIsOnline ? '#4caf50' : '#aaa' }
                ]} />
                <Text style={[styles.online, { color: partnerIsOnline ? '#4caf50' : '#aaa' }]}>
                  {partnerIsOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={[...messages, ...(sendingMessage ? [sendingMessage] : [])]}
            renderItem={renderMessage}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={!loading && (
              <Text style={styles.emptyText}>No messages yet.</Text>
            )}
          />
        </View>

        <View style={styles.inputBarWrapper}>
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile}>
              <MaterialIcons name="attach-file" size={26} color="#2d357a" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Write your message"
              value={input}
              onChangeText={setInput}
              placeholderTextColor="#bbb"
              multiline={true}
              maxLength={1000}
            />
            <TouchableOpacity
              key={`send-btn-${isSending}`}
              style={[
                styles.sendBtn, 
                isSending && styles.sendBtnDisabled
              ]}
              onPress={() => {
                if (!isSending) {
                  handleSend();
                }
              }}
              disabled={isSending}
            >
              {isSending
                ? <ActivityIndicator size={22} color="#fff" />
                : <MaterialIcons name="send" size={26} color="#fff" />
              }
            </TouchableOpacity>
          </View>
          {/* Hiển thị file đã chọn */}
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              {imagePreviewUrl ? (
                <RNImage source={{ uri: imagePreviewUrl }} style={styles.filePreviewImage} />
              ) : (
                <MaterialIcons name="insert-drive-file" size={32} color="#888" style={styles.fileIcon} />
              )}
              <Text numberOfLines={1} style={styles.fileName}>{selectedFile.name}</Text>
              <TouchableOpacity onPress={() => { setSelectedFile(null); setImagePreviewUrl(null); }} style={styles.removeFileBtn}>
                <MaterialIcons name="close" size={22} color="#f00" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3eafc',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Poppins-Bold',
  },
  online: {
    fontSize: 13,
    color: '#4caf50',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  bubbleLeft: {
    backgroundColor: '#f8f5f2', // màu be Figma
    borderTopLeftRadius: 0,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e3eafc',
  },
  bubbleRight: {
    backgroundColor: '#2558F8',
    borderTopRightRadius: 0,
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  // Thêm style cho text đối phương
  messageTextLeft: {
    color: '#6d4c41', // nâu nhạt Figma
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeInBubble: {
    fontSize: 12,
    color: '#bbb',
    fontFamily: 'Poppins-Regular',
  },
  fileBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    backgroundColor: '#2d357a',
    alignSelf: 'flex-end',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fileName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  fileSize: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  inputBarWrapper: {
    backgroundColor: '#fafbfc',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    borderTopWidth: 1,
    borderTopColor: '#e3eafc',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e3eafc',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  attachBtn: {
    padding: 6,
    marginRight: 4,
    borderRadius: 20,
  },
  headerBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3eafc',
    minHeight: 60, // Ensure enough height for buttons
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Take available space
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow buttons to wrap to next line if needed
    justifyContent: 'flex-end',
  },
  connectionStatus: {
    fontSize: 14,
    marginRight: 4,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 80, // Add padding for the input bar
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontFamily: 'Poppins-Regular',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  filePreviewImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 8,
  },
  fileIcon: {
    marginRight: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
  },
  removeFileBtn: {
    padding: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 2,
  },
});

export default ChatDetail; 