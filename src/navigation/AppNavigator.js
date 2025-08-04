import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HeaderDetail from '../components/HeaderDetail';
import LoginScreen from '../screens/Auth/LoginScreen';
import JobListScreen from '../screens/Jobs/JobListScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import EmailVerificationScreen from '../screens/Auth/EmailVerificationScreen';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CompanyListScreen from '../screens/Company/CompanyListScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import CompanyDetailScreen from '../screens/Company/CompanyDetailScreen';
import JobDetailScreen from '../screens/Jobs/JobDetailScreen';
import Listchat from '../screens/Chat/Listchat';
import ChatDetail from '../screens/Chat/ChatDetail';
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
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CvMatchingHistory from '../screens/dashboard/CvMatchingHistory';
import TryMatchDetail from '../screens/dashboard/TryMatchDetail';
import ChangePasswordScreen from '../screens/dashboard/ChangePasswordScreen';
import ApplyCVScreen from '../screens/dashboard/ApplyCVScreen';
import ApplyCVDetailScreen from '../screens/dashboard/ApplyCVDetailScreen';
import FavoriteJobDetailScreen from '../screens/dashboard/FavoriteJobDetailScreen';
import NotificationScreen from '../components/header/notification/NotificationScreen';
import { PackageScreen, BuyPackageScreen, PaymentSuccessScreen } from '../screens/dashboard/package';
import PaymentWebView from '../screens/dashboard/package/PaymentWebView';
import PaymentSuccessSimple from '../screens/dashboard/package/PaymentSuccessSimple';
import FilterScreen from '../screens/Jobs/FilterScreen';

// Custom tab bar button cho nút giữa (Profile)
function CustomTabBarButton({ children, onPress, profileCompletion = 0 }) {
  
  
  // Tính toán góc cho progress ring
  const progressAngle = (profileCompletion / 100) * 360;
  
  
  // Xác định màu sắc dựa trên phần trăm hoàn thành (đồng bộ với Profile Completion Card)
  let progressColor;
  if (profileCompletion < 30) {
    progressColor = '#dc2626'; // Red
  } else if (profileCompletion < 70) {
    progressColor = '#eab308'; // Yellow
  } else {
    progressColor = '#16a34a'; // Green
  }
  
  
  // Tạo progress ring full vòng với màu sắc thay đổi theo phần trăm
  const progressRing = useMemo(() => {
    if (profileCompletion <= 0) return null;
    
    return (
      <View
        style={{
          position: 'absolute',
          width: 56,
          height: 56,
          borderRadius: 28,
          borderWidth: 3,
          borderColor: progressColor,
        }}
      />
    );
  }, [profileCompletion, progressColor]);
  
  return (
    <TouchableOpacity
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        ...Platform.select({
          android: { elevation: 8 },
          ios: { shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
        })
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#2563eb',
          justifyContent: 'center',
          alignItems: 'center',
          ...Platform.select({
            android: { elevation: 6 },
            ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }
          })
        }}
      >
        {children}
        
        {/* Progress Ring */}
        <View
          style={{
            position: 'absolute',
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Background circle */}
          <View
            style={{
              position: 'absolute',
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 3,
              borderColor: '#fff',
            }}
          />
          
                                                     {/* Progress ring - sử dụng segments để hiển thị chính xác */}
           {progressRing}
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: -8,
          width: 20,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#2563eb',
          opacity: 0.6,
        }}
      />
    </TouchableOpacity>
  );
}

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  const { profileCompletion } = useProfileCompletion();
  

  

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        height: 90,
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
        paddingBottom: 12,
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        ...Platform.select({
          android: { elevation: 12 },
          ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } }
        })
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;
        const isProfile = route.name === 'Profile';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Job') iconName = 'work';
        else if (route.name === 'Company') iconName = 'business';
        else if (route.name === 'Profile') iconName = 'person';
        else if (route.name === 'Dashboard') iconName = 'dashboard';

        if (isProfile) {
          return (
            <CustomTabBarButton 
              key={`profile-${profileCompletion}-${Date.now()}`} 
              onPress={onPress} 
              profileCompletion={profileCompletion}
            >
              <MaterialIcons
                name={iconName}
                size={28}
                color="#fff"
              />
            </CustomTabBarButton>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 8,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={iconName}
              size={24}
              color={isFocused ? '#2563eb' : '#888'}
            />
            <Text
              style={{
                fontSize: 10,
                marginTop: 2,
                color: isFocused ? '#2563eb' : '#888',
                fontWeight: isFocused ? '600' : '400',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const Tab = createBottomTabNavigator();
function MainTab() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Job" 
        component={JobListScreen}
        options={{
          tabBarLabel: 'Jobs',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen 
        name="Company" 
        component={CompanyListScreen}
        options={{
          tabBarLabel: 'Company',
        }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
    </Tab.Navigator>
  );
}

// Context và Provider cho Profile Completion
const ProfileCompletionContext = createContext(0);

export const useProfileCompletion = () => {
  const context = useContext(ProfileCompletionContext);
  if (context === undefined) {
    throw new Error('useProfileCompletion must be used within a ProfileCompletionProvider');
  }
  return context;
};

export function ProfileCompletionProvider({ children }) {
  const [profileCompletion, setProfileCompletion] = useState(0);
  return (
    <ProfileCompletionContext.Provider value={{ profileCompletion, setProfileCompletion }}>
      {children}
    </ProfileCompletionContext.Provider>
  );
}

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return (
	<ProfileCompletionProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyList" component={CompanyListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="JobList" component={JobListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Listchat" component={Listchat} options={{ headerShown: false }} />
          <Stack.Screen name="ChatDetail" component={ChatDetail} options={{ headerShown: false }} />
		    <Stack.Screen name="AboutMeEdit" component={AboutMeEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="EducationEdit" component={EducationEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="WorkExperienceEdit" component={WorkExperienceEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="AddSkillScreen" component={AddSkillScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="EditSkillScreen" component={EditSkillScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="SearchLanguageScreen" component={SearchLanguageScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="AddLanguageScreen" component={AddLanguageScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="ForeignLanguageListScreen" component={ForeignLanguageListScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="PersonalInfoEdit" component={PersonalInfoEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="AwardEdit" component={AwardEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="CertificateEdit" component={CertificateEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
        <Stack.Screen name="HighlightProjectEdit" component={HighlightProjectEditScreen} options={{ headerShown: true, header: () => <HeaderDetail /> }} />
                  <Stack.Screen name="CvMatchingHistory" component={CvMatchingHistory} options={{ headerShown: false }} />
          <Stack.Screen name="TryMatchDetail" component={TryMatchDetail} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ApplyCV" component={ApplyCVScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ApplyCVDetail" component={ApplyCVDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FavoriteJobDetail" component={FavoriteJobDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Filter" component={FilterScreen} options={{ headerShown: false }} />
          
          {/* Package System Screens */}
          <Stack.Screen name="Package" component={PackageScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BuyPackage" component={BuyPackageScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentWebView" component={PaymentWebView} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentSuccessSimple" component={PaymentSuccessSimple} options={{ headerShown: false }} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileCompletionProvider>
  );
}
