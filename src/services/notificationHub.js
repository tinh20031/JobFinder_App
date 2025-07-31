import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let connection = null;

export async function startNotificationHub(onReceiveNotification) {
  if (connection) return connection;

  // Lấy token và userId từ AsyncStorage
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('UserId');
  
  

  if (!token || !userId) {

    
    
    throw new Error('Missing token or userId');
  }

  

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
    
  });

  connection.onreconnecting((error) => {
    
  });

  connection.onreconnected((connectionId) => {
    
  });

  try {
    await connection.start();
    
    await connection.invoke('JoinUserGroup', String(userId));
    
  } catch (err) {
    
  }

  return connection;
}

export function stopNotificationHub() {
  if (connection) {
    connection.stop();
    connection = null;

  }
} 