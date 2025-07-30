import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let connection = null;

export async function startNotificationHub(onReceiveNotification) {
  if (connection) return connection;

  // Lấy token và userId từ AsyncStorage
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('UserId');
  console.log('[SignalR] token:', token);
  console.log('[SignalR] userId:', userId);

  if (!token || !userId) {
    if (!token) console.log('[SignalR] token is missing');
    if (!userId) console.log('[SignalR] userId is missing');
    console.log('[SignalR] Missing token or userId');
    throw new Error('Missing token or userId');
  }

  console.log('[SignalR] Connecting to:', SIGNALR_HUB_URL);

  connection = new HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: () => token,
      skipNegotiation: true,
      transport: 1, // WebSockets
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveNotification', (notification) => {
    if (onReceiveNotification) onReceiveNotification(notification);
  });

  connection.onclose((error) => {
    console.log('[SignalR] Disconnected', error ? error.message : '');
  });

  connection.onreconnecting((error) => {
    console.log('[SignalR] Reconnecting...', error ? error.message : '');
  });

  connection.onreconnected((connectionId) => {
    console.log('[SignalR] Reconnected. ConnectionId:', connectionId);
  });

  try {
    await connection.start();
    console.log('[SignalR] Connected!');
    await connection.invoke('JoinUserGroup', String(userId));
    console.log('[SignalR] Joined user group:', userId);
  } catch (err) {
    console.log('[SignalR] Connection error:', err.message);
  }

  return connection;
}

export function stopNotificationHub() {
  if (connection) {
    connection.stop();
    connection = null;
    console.log('[SignalR] Connection stopped');
  }
} 