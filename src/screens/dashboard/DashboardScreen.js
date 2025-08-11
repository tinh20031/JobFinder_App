import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderCandidate from '../../components/HeaderCandidate';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';
import LinearGradient from 'react-native-linear-gradient';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handlePasswordPress = () => {
    // Handle when pressing Password
    navigation.navigate('ChangePassword');
  };

  const handleLogoutPress = () => {
    // Show logout confirmation modal
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      // Call authService to logout
      await authService.logout();
      // Reset navigation to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An error occurred while logging out. Please try again.');
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleAppliedJobsPress = () => {
    // Navigate to Applied Jobs
    navigation.navigate('ApplyCV');
  };

  const handleMyFavoritePress = () => {
    // Navigate to My Favorite
    navigation.navigate('FavoriteJobDetail');
  };

  const handleCvMatchHistoryPress = () => {
    // Navigate to CV Match History
    navigation.navigate('CvMatchingHistory');
  };

  const handlePackagesPress = () => {
    // Navigate to Packages
    navigation.navigate('Package');
  };

  const menuItems = [
    { key: 'applied', label: 'Applied Jobs!', icon: 'work', colors: ['#34d399', '#10b981'], onPress: handleAppliedJobsPress },
    { key: 'favorite', label: 'My Favorite', icon: 'favorite', colors: ['#fb7185', '#f43f5e'], onPress: handleMyFavoritePress },
    { key: 'history', label: 'CV Matching History', icon: 'history', colors: ['#f59e0b', '#eab308'], onPress: handleCvMatchHistoryPress },
    { key: 'package', label: 'Packages', icon: 'card-giftcard', colors: ['#8b5cf6', '#6366f1'], onPress: handlePackagesPress },
    { key: 'password', label: 'Password', icon: 'lock-outline', colors: ['#60a5fa', '#2563eb'], onPress: handlePasswordPress },
    { key: 'logout', label: 'Logout', icon: 'logout', colors: ['#f87171', '#ef4444'], onPress: handleLogoutPress },
  ];

  return (
    <LinearGradient colors={["#e0f2fe", "#f5f3ff"]} style={styles.root}>
      <HeaderCandidate />
      <ScrollView style={styles.content}>
        <Animatable.View animation="fadeInDown" duration={600}>
          <LinearGradient colors={["#6366f1", "#8b5cf6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Dashboard</Text>
              <Text style={styles.heroSubtitle}>Manage your profile and jobs effortlessly</Text>
            </View>
            <MaterialIcons name="dashboard" size={40} color="#ffffff90" />
          </LinearGradient>
        </Animatable.View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Animatable.View key={item.key} animation="fadeInUp" duration={600} delay={120 + index * 100}>
              <TouchableOpacity activeOpacity={0.85} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <LinearGradient colors={item.colors} style={styles.iconBadge}>
                    <MaterialIcons name={item.icon} size={22} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.menuText}>{item.label}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        animationType="none"
        transparent={true}
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Animatable.View animation={showLogoutModal ? 'slideInUp' : 'slideOutDown'} duration={300} style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>LOG OUT</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLogout} activeOpacity={0.9}>
                  <Text style={styles.confirmButtonText}>YES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelLogout}>
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#ffffffcc',
    fontFamily: 'Poppins-Regular',
  },
  menuContainer: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.5,
    fontFamily: 'Poppins-SemiBold',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: '#2563eb',
    fontSize: 16,
    letterSpacing: 0.5,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default DashboardScreen; 