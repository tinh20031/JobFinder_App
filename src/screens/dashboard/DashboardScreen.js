import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderCandidate from '../../components/HeaderCandidate';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';


const DashboardScreen = () => {
  const navigation = useNavigation();

  const handlePasswordPress = () => {
    // Xử lý khi nhấn vào Password
    console.log('Password pressed');
  };

  const handleLogoutPress = () => {
    // Xử lý khi nhấn vào Logout
    console.log('Logout pressed');
  };

  const handleAppliedJobsPress = () => {
    // Xử lý khi nhấn vào Applied Jobs
    console.log('Applied Jobs pressed');
  };

  const handleMyFavoritePress = () => {
    // Xử lý khi nhấn vào My Favorite
    console.log('My Favorite pressed');
  };

  const handleCvMatchHistoryPress = () => {
    // Xử lý khi nhấn vào CV Match History
    navigation.navigate('CvMatchingHistory');
  };

  const handlePackagesPress = () => {
    // Xử lý khi nhấn vào Packages
    console.log('Packages pressed');
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
});

export default DashboardScreen; 