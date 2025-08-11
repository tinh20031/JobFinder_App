import React, { useEffect, useRef } from 'react';
import { useToast } from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chatService from '../services/chatService';
import { BASE_URL } from '../constants/api';

export default function ChatToastListener({ navigationRef }) {
  const toast = useToast();
  const userIdRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const lastToastAtRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let pollingTimer;

    const setup = async () => {
      try {
        const userId = await AsyncStorage.getItem('UserId');
        userIdRef.current = userId;
        await chatService.startConnection();
        if (userId) await chatService.joinUserGroup(userId);

        const showToast = (msg, sourceMethodName) => {
          if (!isMounted || !msg) return;
          const myId = String(userIdRef.current || '');
          const senderAny = msg.senderId ?? msg.fromUserId ?? msg.userFromId ?? msg.senderID ?? msg.userId;
          const receiverAny = msg.receiverId ?? msg.toUserId ?? msg.userToId ?? msg.receiverID;

          // Nếu có đủ cả sender và receiver, chỉ chấp nhận khi sender != myId và receiver == myId
          if (senderAny != null && receiverAny != null) {
            const fromOtherStrict = String(senderAny) !== myId && String(receiverAny) === myId;
            if (!fromOtherStrict) return;
          } else if (senderAny != null) {
            // Nếu chỉ có senderId, chỉ hiển thị khi sender khác myId
            if (String(senderAny) === myId) return;
          } else {
            // Không xác định được hướng, tránh hiển thị để không báo khi chính mình gửi
            return;
          }

          const currentRoute = navigationRef?.current?.getCurrentRoute?.();
          const isInChat = currentRoute && ['Listchat', 'ChatDetail'].includes(currentRoute.name);
          // Ẩn toast khi đang ở màn hình ChatDetail hoặc Listchat
          if (isInChat) return;

          // Chống trùng: theo messageId hoặc debounce 1s
          const msgId = msg.messageId || msg.id || `${msg.senderId}-${msg.receiverId}-${msg.sentAt || Date.now()}`;
          const now = Date.now();
          if (lastMessageIdRef.current === msgId && now - lastToastAtRef.current < 1500) return;
          lastMessageIdRef.current = msgId;
          lastToastAtRef.current = now;

          // Chuẩn bị dữ liệu contact để mở ChatDetail
          const contactId = (String(senderAny) !== myId ? senderAny : (msg.companyId ?? msg.userId));
          const contactName = msg.senderFullName || msg.senderName || msg.companyName || 'User';
          const contactAvatar = msg.senderAvatar || msg.senderImage || msg.urlCompanyLogo || undefined;

          toast.show('', {
            type: 'custom_notification',
            data: {
              title: `New message${contactName ? ` from ${contactName}` : ''}`,
              message: msg.messageText || msg.content || msg.text || 'You have recive new message @Chat/',
              onPress: () => {
                if (contactId) {
                  navigationRef?.current?.navigate('ChatDetail', {
                    contact: {
                      id: contactId,
                      name: contactName,
                      avatar: contactAvatar,
                    },
                  });
                } else {
                  navigationRef?.current?.navigate('Listchat');
                }
              },
            },
          });
        };

        const handleReceiveMessage = (msg, methodName) => showToast(msg, methodName);

        chatService.on('ReceiveMessage', (m) => handleReceiveMessage(m, 'ReceiveMessage'));
        chatService.on('ReceiveMessageAsync', (m) => handleReceiveMessage(m, 'ReceiveMessageAsync'));
        chatService.on('ReceiveMessageToUser', (m) => handleReceiveMessage(m, 'ReceiveMessageToUser'));
        chatService.on('NewMessage', (m) => handleReceiveMessage(m, 'NewMessage'));
        chatService.on('MessageReceived', (m) => handleReceiveMessage(m, 'MessageReceived'));

        // Fallback: listen all server methods and filter by name contains 'message'
        if (chatService.connection?.on) {
          chatService.connection.on('*', (methodName, ...args) => {
            try {
              if (typeof methodName === 'string') {
                const lower = methodName.toLowerCase();
                if (lower.includes('message') && !lower.includes('send')) {
                  if (args && args.length > 0) showToast(args[0], methodName);
                }
              }
            } catch {}
          });
        }

        return () => {
          chatService.off('ReceiveMessage', handleReceiveMessage);
          chatService.off('ReceiveMessageAsync', handleReceiveMessage);
          chatService.off('ReceiveMessageToUser', handleReceiveMessage);
          chatService.off('NewMessage', handleReceiveMessage);
          chatService.off('MessageReceived', handleReceiveMessage);
          // Không cần off send-related vì không đăng ký
        };
      } catch (e) {
        console.log('[ChatToastListener] setup error:', e?.message || e);
      }
    };

    const cleanup = setup();

    // Fallback polling: check latest conversations every 10s
    const startPolling = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const candidateId = await AsyncStorage.getItem('UserId');
        if (!token || !candidateId) return;

        let latestServerTimestamp = 0;
        const poll = async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/message/companies-messaged/${candidateId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return;
            const newest = data
              .filter(x => !!x?.sentAt)
              .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
            if (!newest) return;
            const ts = new Date(newest.sentAt).getTime();
            if (ts > latestServerTimestamp) {
              // Xác thực tin mới là từ người khác bằng cách lấy message cuối cùng với contact này
              const contactId = newest.companyId || newest.senderId || newest.userId;
              if (!contactId) return;
              try {
                const hist = await chatService.getMessageHistoryWithPagination(candidateId, contactId, 1, 1);
                const items = Array.isArray(hist) ? hist : (Array.isArray(hist?.items) ? hist.items : []);
                const lastMsg = items && items.length > 0 ? items[items.length - 1] : null;
                if (!lastMsg) return;
                const isFromMe = String(lastMsg.senderId) === String(candidateId);
                if (isFromMe) {
                  // Không cập nhật mốc nếu là tin mình vừa gửi
                  return;
                }

                latestServerTimestamp = ts;
                const now = Date.now();
                if (now - lastToastAtRef.current > 1500) {
                  // Ẩn toast nếu đang ở màn hình ChatDetail/Listchat
                  const currentRoute = navigationRef?.current?.getCurrentRoute?.();
                  const isInChat = currentRoute && ['Listchat', 'ChatDetail'].includes(currentRoute.name);
                  if (isInChat) return;
                  lastToastAtRef.current = now;
                  toast.show('', {
                    type: 'custom_notification',
                    data: {
                      title: `New message from ${newest.companyName || newest.senderFullName || 'Someone'}`,
                      message: newest.messageText || 'You have recive new message @Chat/',
                      onPress: () => {
                        if (contactId) {
                          navigationRef?.current?.navigate('ChatDetail', {
                            contact: {
                              id: contactId,
                              name: newest.companyName || newest.senderFullName || 'User',
                              avatar: newest.urlCompanyLogo || newest.senderImage,
                            },
                          });
                        } else {
                          navigationRef?.current?.navigate('Listchat');
                        }
                      },
                    },
                  });
                }
              } catch {}
            }
          } catch {}
        };

        // Seed timestamp, then start
        await poll();
        pollingTimer = setInterval(poll, 3000);
      } catch {}
    };
    startPolling();

    return () => {
      isMounted = false;
      if (typeof cleanup === 'function') cleanup();
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, []);

  return null;
}


