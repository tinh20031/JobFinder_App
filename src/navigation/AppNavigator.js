import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/Auth/LoginScreen';
import JobListScreen from '../screens/Jobs/JobListScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import EmailVerificationScreen from '../screens/Auth/EmailVerificationScreen';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CompanyListScreen from '../screens/Company/CompanyListScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AboutMeEditScreen from '../screens/Profile/AboutMeEditScreen';
import EducationEditScreen from '../screens/Profile/EducationEditScreen';
import WorkExperienceEditScreen from '../screens/Profile/WorkExperienceEditScreen';
import AddSkillScreen from '../screens/Profile/AddSkillScreen';
import ForeignLanguageSection from '../screens/Profile/ForeignLanguageSection';
import AddLanguageScreen from '../screens/Profile/AddLanguageScreen';
import SearchLanguageScreen from '../screens/Profile/SearchLanguageScreen';
import ForeignLanguageListScreen from '../screens/Profile/ForeignLanguageListScreen';
import EditSkillScreen from '../screens/Profile/EditSkillScreen';
import PersonalInfoEditScreen from '../screens/Profile/PersonalInfoEditScreen';
import AwardEditScreen from '../screens/Profile/AwardEditScreen';
import CertificateEditScreen from '../screens/Profile/CertificateEditScreen';
import HighlightProjectEditScreen from '../screens/Profile/HighlightProjectEditScreen';

// Thêm màn hình AddScreen (dấu cộng)
function AddScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Add Screen</Text>
    </View>
  );
}

// Custom tab bar button cho nút giữa
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
          android: { elevation: 5 },
          ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }
        })
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#2563eb',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

const Tab = createBottomTabNavigator();
function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Job') iconName = 'work';
          else if (route.name === 'Company') iconName = 'business';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Add') iconName = 'add';
          return (
            <MaterialIcons
              name={iconName}
              size={route.name === 'Add' ? 32 : 26}
              color={route.name === 'Add' ? '#fff' : color}
            />
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          height: 70,
          borderWidth: 2,
          borderColor: '#2563eb',
          ...Platform.select({
            android: { elevation: 10 },
            ios: { shadowColor: '#2563eb', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
          })
        },
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Job" component={JobListScreen} />
      <Tab.Screen name="Add" component={AddScreen}
        options={{
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen name="Company" component={CompanyListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
        <Stack.Screen name="AboutMeEdit" component={AboutMeEditScreen} options={{ headerShown: true }} />
        <Stack.Screen name="EducationEdit" component={EducationEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WorkExperienceEdit" component={WorkExperienceEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddSkillScreen" component={AddSkillScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditSkillScreen" component={EditSkillScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SearchLanguageScreen" component={SearchLanguageScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddLanguageScreen" component={AddLanguageScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForeignLanguageListScreen" component={ForeignLanguageListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalInfoEdit" component={PersonalInfoEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AwardEdit" component={AwardEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CertificateEdit" component={CertificateEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HighlightProjectEdit" component={HighlightProjectEditScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



