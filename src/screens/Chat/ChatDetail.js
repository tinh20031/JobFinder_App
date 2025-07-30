import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderDetail from '../../components/HeaderDetail';
import chatService from '../../services/chatService';
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
  const isSendingRef = useRef(false);

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
        console.log('candidateId:', candidateId, 'contact.id:', contact.id, 'token:', token, 'url:', url);
        const res = await chatService.getMessageHistory(candidateId, contact.id, true); // true: trả về response thô
        const status = res.status;
        const text = await res.text();
        console.log('Response status:', status);
        console.log('API raw text:', text);
        let data = [];
        if (status === 200) {
          if (!text || text.trim() === '') {
            data = [];
            console.log('API returned empty body, treat as no messages.');
          } else {
            try {
              data = JSON.parse(text);
            } catch (jsonErr) {
              console.log('JSON parse error:', jsonErr, 'text:', text);
              data = [];
            }
          }
        } else {
          console.log('API error response:', text);
          data = [];
        }
        console.log('Raw message data:', data);
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
              avatar: msg.senderId == candidateId ? undefined : contact.avatar,
              senderName: msg.senderFullName || '',
            }))
          : [];
        console.log('Mapped messages:', mapped);
        setMessages(mapped);
      } catch (e) {
        console.log('Error fetching messages:', e);
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [contact]);

  useEffect(() => {
    if (!userId || !contact?.id) return;
    const handleReceiveMessage = (msg) => {
      // Chỉ thêm tin nhắn nếu thuộc cuộc trò chuyện hiện tại
      if (
        (String(msg.senderId) === String(userId) && String(msg.receiverId) === String(contact.id)) ||
        (String(msg.senderId) === String(contact.id) && String(msg.receiverId) === String(userId))
      ) {
        setMessages(prev => [
          ...prev,
          {
            id: msg.messageId || msg.id,
            text: msg.messageText || '',
            time: msg.sentAt ? formatTime(msg.sentAt) : '',
            sender: String(msg.senderId) === String(userId) ? 'me' : 'other',
            status: msg.isSeen ? 'seen' : 'sent',
            file: msg.fileUrl
              ? {
                  name: msg.fileName || msg.fileUrl.split('/').pop(),
                  size: msg.fileSize || '',
                  type: msg.fileType || '',
                  url: msg.fileUrl,
                }
              : undefined,
            avatar: msg.senderId == userId ? undefined : contact.avatar,
            senderName: msg.senderFullName || '',
          },
        ]);
      }
    };
    chatService.on('ReceiveMessage', handleReceiveMessage);
    return () => {
      chatService.off('ReceiveMessage', handleReceiveMessage);
    };
  }, [userId, contact]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
  const handleSend = async () => {
    if (isSendingRef.current || isSending || (!input.trim() && !selectedFile)) return;
    setIsSending(true);
    isSendingRef.current = true;
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
      setMessages(prev => [
        ...prev,
        {
          id: res?.messageId || res?.id || Math.random().toString(),
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
          avatar: undefined,
          senderName: '',
        },
      ]);
      setInput('');
      setSelectedFile(null);
      setImagePreviewUrl(null);
    } catch (e) {}
    setIsSending(false);
    isSendingRef.current = false;
  };

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
    return (
      <View style={[styles.messageRow, item.sender === 'me' ? styles.right : styles.left]}>
        <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={item.sender === 'me' ? styles.messageText : styles.messageTextLeft}>{item.text}</Text>
          <View style={styles.bubbleFooter}>
            <Text style={styles.timeInBubble}>{item.time}</Text>
            {item.sender === 'me' && (
              <MaterialIcons name="done-all" size={18} color={item.status === 'seen' ? '#4fc3f7' : '#bbb'} style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  // Xác định trạng thái online/offline
  let partnerOnline = propPartnerOnline;
  if (typeof partnerOnline === 'undefined' || partnerOnline === null) {
    // Lấy từ tin nhắn cuối cùng nếu có
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    if (lastMsg) {
      // Nếu tin nhắn cuối cùng là của đối tác
      const isPartnerMsg = lastMsg.sender === 'other';
      if (isPartnerMsg) {
        if (typeof lastMsg.senderIsOnline !== 'undefined') partnerOnline = lastMsg.senderIsOnline;
        else if (typeof lastMsg.receiverIsOnline !== 'undefined') partnerOnline = lastMsg.receiverIsOnline;
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderDetail />
      <View style={styles.headerBelow}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: contact?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.name}>{contact?.name || ''}</Text>
            <Text style={[styles.online, { color: partnerOnline ? '#4caf50' : '#bbb' }]}>● {partnerOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
       
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={!loading && <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No messages yet.</Text>}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={16} style={styles.inputBarWrapper}>
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
          />
          <TouchableOpacity
            style={[styles.sendBtn, (isSending || isSendingRef.current) && { opacity: 0.5 }]}
            onPress={isSending || isSendingRef.current ? null : handleSend}
            disabled={isSending || isSendingRef.current}
          >
            {(isSending || isSendingRef.current)
              ? <ActivityIndicator size={22} color="#fff" />
              : <MaterialIcons name="send" size={26} color="#fff" />
            }
          </TouchableOpacity>
        </View>
        {/* Hiển thị file đã chọn */}
        {selectedFile && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24, marginBottom: 4 }}>
            {imagePreviewUrl ? (
              <RNImage source={{ uri: imagePreviewUrl }} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 8 }} />
            ) : (
              <MaterialIcons name="insert-drive-file" size={32} color="#888" style={{ marginRight: 8 }} />
            )}
            <Text numberOfLines={1} style={{ maxWidth: 120 }}>{selectedFile.name}</Text>
            <TouchableOpacity onPress={() => { setSelectedFile(null); setImagePreviewUrl(null); }} style={{ marginLeft: 8 }}>
              <MaterialIcons name="close" size={22} color="#f00" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
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
  },
  online: {
    fontSize: 13,
    color: '#4caf50',
    marginTop: 2,
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
    backgroundColor: '#2d357a',
    borderTopRightRadius: 0,
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
  },
  // Thêm style cho text đối phương
  messageTextLeft: {
    color: '#6d4c41', // nâu nhạt Figma
    fontSize: 15,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeInBubble: {
    fontSize: 12,
    color: '#bbb',
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
  },
  fileSize: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  inputBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fafbfc',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
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
  },
  sendBtn: {
    backgroundColor: '#2d357a',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
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
  },
});

export default ChatDetail; 