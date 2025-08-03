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
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    minHeight: 180,
    overflow: 'visible',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
    paddingRight: 20,
  },
  bannerTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 24,
    fontFamily: 'Poppins-Bold',
  },
  bannerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  bannerImageContainer: {
    position: 'relative',
    zIndex: 1,
  },
  bannerImage: {
    width: 200,
    height: 220,
    resizeMode: 'cover',
    marginTop: -35,
    marginRight: -25,
    marginBottom: -25,
  },
});

export default Banner; 