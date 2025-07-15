import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/Auth/LoginScreen';
import JobListScreen from '../screens/Jobs/JobListScreen';
import { View, Text } from 'react-native';

// Placeholder ProfileScreen
function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile Screen</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
function MainTab() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Jobs" component={JobListScreen} options={{ title: 'Việc làm' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



