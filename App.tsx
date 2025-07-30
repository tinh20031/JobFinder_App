/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from 'react-native-toast-notifications';
import { GenericModalProvider } from './src/components/JobApplyModal';

export default function App() {
  return (
    <GenericModalProvider>
      <ToastProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </ToastProvider>
    </GenericModalProvider>
  );
}
