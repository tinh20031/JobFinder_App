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

        const showToast = (msg) => {
          if (!isMounted || !msg) return;
          const fromOther = String(msg.senderId) !== String(userIdRef.current || '');
          if (!fromOther) return;

          const currentRoute = navigationRef?.current?.getCurrentRoute?.();
          const isInChat = currentRoute && ['Listchat', 'ChatDetail'].includes(currentRoute.name);
          // Nếu muốn ẩn khi đang ở Chat, bỏ comment dòng dưới
          // if (isInChat) return;

          // Chống trùng: theo messageId hoặc debounce 1s
          const msgId = msg.messageId || msg.id || `${msg.senderId}-${msg.receiverId}-${msg.sentAt || Date.now()}`;
          const now = Date.now();
          if (lastMessageIdRef.current === msgId && now - lastToastAtRef.current < 1500) return;
          lastMessageIdRef.current = msgId;
          lastToastAtRef.current = now;

          // Chuẩn bị dữ liệu contact để mở ChatDetail
          const contactId = msg.senderId ?? msg.companyId ?? msg.userId;
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

        const handleReceiveMessage = (msg) => showToast(msg);

        chatService.on('ReceiveMessage', handleReceiveMessage);
        chatService.on('ReceiveMessageAsync', handleReceiveMessage);
        chatService.on('ReceiveMessageToUser', handleReceiveMessage);
        chatService.on('NewMessage', handleReceiveMessage);
        chatService.on('MessageReceived', handleReceiveMessage);
        chatService.on('SendMessage', handleReceiveMessage);
        chatService.on('MessageSent', handleReceiveMessage);

        // Fallback: listen all server methods and filter by name contains 'message'
        if (chatService.connection?.on) {
          chatService.connection.on('*', (methodName, ...args) => {
            try {
              if (typeof methodName === 'string' && methodName.toLowerCase().includes('message')) {
                if (args && args.length > 0) showToast(args[0]);
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
          chatService.off('SendMessage', handleReceiveMessage);
          chatService.off('MessageSent', handleReceiveMessage);
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
              latestServerTimestamp = ts;
              const now = Date.now();
              if (now - lastToastAtRef.current > 1500) {
                lastToastAtRef.current = now;
                toast.show('', {
                  type: 'custom_notification',
                  data: {
                    title: `New message from ${newest.companyName || newest.senderFullName || 'Someone'}`,
                    message: newest.messageText || 'You have recive new message @Chat/',
                    onPress: () => {
                      const contactId = newest.companyId || newest.senderId || newest.userId;
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


