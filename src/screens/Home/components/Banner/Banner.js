import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Banner = ({ onReadMore }) => {
  return (
    <LinearGradient
      colors={['#2563eb', '#1d4ed8', '#1e40af']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>See how you can find a job quickly!</Text>
        <TouchableOpacity style={styles.bannerButton} onPress={onReadMore}>
          <Text style={styles.bannerButtonText}>Read more</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bannerImageContainer}>
        <Image 
          source={require('../../../../images/homepage.png')} 
          style={styles.bannerImage} 
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    minHeight: 120,
    overflow: 'visible',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
    paddingRight: 16,
  },
  bannerTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    lineHeight: 22,
    fontFamily: 'Poppins-Bold',
  },
  bannerButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#2563eb',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  bannerImageContainer: {
    position: 'relative',
    zIndex: 1,
  },
  bannerImage: {
    width: 160,
    height: 176,
    resizeMode: 'cover',
    marginTop: -25,
    marginRight: -10,
    marginBottom: -16,
  },
});

export default Banner; 