/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from 'react-native-toast-notifications';
import { GenericModalProvider } from './src/components/JobApplyModal';
import SplashScreen from './src/components/SplashScreen';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function ProvidersWithSafeArea() {
  const insets = useSafeAreaInsets();
  const topOffset = (insets?.top || 0) + 8;

  // Yêu cầu quyền thông báo trên Android 13+
  useEffect(() => {
    async function requestNotificationPermission() {
      try {
        if (Platform.OS !== 'android') return;
        // Android 13+ (API 33)
        // @ts-ignore - RN exposes this permission constant at runtime
        const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any;
        if (!perm) return; // Older Android versions không có hằng này
        const has = await PermissionsAndroid.check(perm);
        if (!has) {
          await PermissionsAndroid.request(perm);
        }
      } catch {}
    }
    requestNotificationPermission();
  }, []);

  return (
    <GenericModalProvider>
      <ToastProvider
        duration={3500}
        animationDuration={200}
        placement="top"
        offsetTop={topOffset}
        renderType={{
          custom_notification: (toast) => {
            const title = toast?.data?.title ?? 'New notification';
            const message = toast?.data?.message ?? '';
            const onPress = toast?.data?.onPress;
            return (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={onPress}
                style={{
                  marginHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: '#ffffff',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 5,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2563eb',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#eff6ff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Feather name="bell" size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#111827',
                      fontSize: 15,
                      fontWeight: '700',
                      marginBottom: 2,
                      fontFamily: 'Poppins-SemiBold',
                    }}
                  >
                    {title}
                  </Text>
                  {!!message && (
                    <Text
                      numberOfLines={2}
                      style={{ color: '#6b7280', fontSize: 13, fontFamily: 'Poppins-Regular' }}
                    >
                      {message}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    color: '#2563eb',
                    fontSize: 13,
                    fontWeight: '600',
                    marginLeft: 12,
                    fontFamily: 'Poppins-SemiBold',
                  }}
                >
                  View
                </Text>
              </TouchableOpacity>
            );
          },
        }}
      >
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </ToastProvider>
    </GenericModalProvider>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <ProvidersWithSafeArea />
    </SafeAreaProvider>
  );
}
