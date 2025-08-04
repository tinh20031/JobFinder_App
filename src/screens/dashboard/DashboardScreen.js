import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderCandidate from '../../components/HeaderCandidate';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handlePasswordPress = () => {
    // Xử lý khi nhấn vào Password
    navigation.navigate('ChangePassword');
  };

  const handleLogoutPress = () => {
    // Hiển thị modal xác nhận logout
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      // Gọi authService để logout
      await authService.logout();
      // Chuyển về màn hình login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleAppliedJobsPress = () => {
    // Xử lý khi nhấn vào Applied Jobs
    navigation.navigate('ApplyCV');
  };

  const handleMyFavoritePress = () => {
    // Xử lý khi nhấn vào My Favorite
    navigation.navigate('FavoriteJobDetail');
  };

  const handleCvMatchHistoryPress = () => {
    // Xử lý khi nhấn vào CV Match History
    navigation.navigate('CvMatchingHistory');
  };

  const handlePackagesPress = () => {
    // Xử lý khi nhấn vào Packages
    navigation.navigate('Package');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f7fd' }}>
      <HeaderCandidate />
      <ScrollView style={styles.content}>
        <View style={styles.menuContainer}>
          <Animatable.View animation="fadeInUp" duration={600} delay={100}>
            <TouchableOpacity style={styles.menuItem} onPress={handleAppliedJobsPress}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="work" size={24} color="#333" />
                <Text style={styles.menuText}>Applied Jobs!</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={200}>
            <TouchableOpacity style={styles.menuItem} onPress={handleMyFavoritePress}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="favorite" size={24} color="#333" />
                <Text style={styles.menuText}>My Favorite</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={300}>
            <TouchableOpacity style={styles.menuItem} onPress={handleCvMatchHistoryPress}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="history" size={24} color="#333" />
                <Text style={styles.menuText}>CV Matching History</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={400}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePackagesPress}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="card-giftcard" size={24} color="#333" />
                <Text style={styles.menuText}>Packages</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={500}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePasswordPress}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="lock-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={600}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="logout" size={24} color="#333" />
                <Text style={styles.menuText}>Logout</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>
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
             <Animatable.View 
               animation={showLogoutModal ? "slideInUp" : "slideOutDown"}
               duration={300}
               style={styles.modalContent}
             >
               <View style={styles.modalHandle} />
               <Text style={styles.modalTitle}>Log out</Text>
               <Text style={styles.modalMessage}>Are you sure you want to leave?</Text>
               <View style={styles.modalButtons}>
                 <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLogout}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    fontWeight: '500',
    color: '#333',
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
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default DashboardScreen; 