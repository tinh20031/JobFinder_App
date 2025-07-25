import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/api';
import useResumeData from '../services/useResumeData';
import { authService } from '../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';

const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (url === 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return null;
};

const HeaderCandidates = ({ onDashboard }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { profile } = useResumeData();
  const navigation = useNavigation();
  const avatar = getValidImageUrl(profile?.image);
  const fullName = profile?.fullName || 'My Account';

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed', error);
      // Có thể hiện thông báo lỗi cho người dùng
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Giả sử API backend có endpoint /CandidateProfile/me
        const res = await fetch(`${BASE_URL}/api/CandidateProfile/me`, {
          headers: {
            'Content-Type': 'application/json',
            // Nếu cần token:
            // 'Authorization': `Bearer ${token}`
          },
        });
        if (res.ok) {
          const profile = await res.json();
          // setFullName(profile.fullName || 'My Account'); // This line was removed from original, so it's removed here.
          // setAvatar(getValidImageUrl(profile.image) || null); // This line was removed from original, so it's removed here.
        } else {
          // setFullName('My Account'); // This line was removed from original, so it's removed here.
          // setAvatar(null); // This line was removed from original, so it's removed here.
        }
      } catch {
        // setFullName('My Account'); // This line was removed from original, so it's removed here.
        // setAvatar(null); // This line was removed from original, so it's removed here.
      }
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../images/jobfinder-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => setDropdownVisible(true)} style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <MaterialIcons name="person" size={40} color="#2563eb" style={styles.avatar} />
          )}
        </TouchableOpacity>
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setDropdownVisible(false)}>
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownVisible(false); onDashboard && onDashboard(); }}>
                <MaterialIcons name="dashboard" size={20} color="#222" style={{ marginRight: 8 }} />
                <Text style={styles.dropdownText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color="#222" style={{ marginRight: 8 }} />
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    width: '100%',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 160,
    height: 40,
    tintColor: '#2563eb',
  },
  avatarWrapper: {
    marginLeft: 'auto',
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',     // Màu viền avatar
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    // Bỏ justifyContent/alignItems để dropdown luôn ở vị trí tuyệt đối
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
});

export default HeaderCandidates; 