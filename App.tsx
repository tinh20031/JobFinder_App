/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from 'react-native-toast-notifications';
import { GenericModalProvider } from './src/components/JobApplyModal';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GenericModalProvider>
      <ToastProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </ToastProvider>
    </GenericModalProvider>
  );
}
