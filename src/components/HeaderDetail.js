import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const HeaderDetail = ({ title, avatar, isOnline, showAvatar = false }) => {
  const navigation = useNavigation();
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#150b3d" />
        </TouchableOpacity>
        
        {showAvatar && avatar && (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        )}
        
        <View style={[styles.titleContainer, showAvatar && styles.titleContainerWithAvatar]}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {showAvatar && (
            <View style={styles.statusContainer}>
              <View style={[
                styles.onlineIndicator, 
                { backgroundColor: isOnline ? '#4caf50' : '#aaa' }
              ]} />
              <Text style={[styles.statusText, { color: isOnline ? '#4caf50' : '#aaa' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  titleContainerWithAvatar: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#150b3d',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
});

export default HeaderDetail; 