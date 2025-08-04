import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate loading steps
        setLoadingText('Loading assets...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingText('Checking authentication...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingText('Preparing app...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingText('Ready!');
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };

    // Animation sequence
    const animationSequence = Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Logo animation
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Show loading animation
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();

    // Start app initialization
    initializeApp();
  }, [fadeAnim, scaleAnim, logoAnim, loadingAnim]);

  useEffect(() => {
    // Finish splash screen after loading is complete
    if (loadingText === 'Ready!') {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinish();
        });
      }, 500);
    }
  }, [loadingText, fadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563eb"
        translucent={false}
      />
      
      <Animated.View
        style={[
          styles.background,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={require('../images/jobfinder-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            JobFinder
          </Animated.Text>
          
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Find Your Dream Job
          </Animated.Text>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingAnim,
              transform: [
                {
                  translateY: loadingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: 'white',
                  opacity: loadingAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: 'white',
                  opacity: loadingAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: 'white',
                  opacity: loadingAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
          </View>
          
          <Animated.Text
            style={[
              styles.loadingText,
              {
                opacity: loadingAnim,
              },
            ]}
          >
            {loadingText}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    tintColor: 'white',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});

export default SplashScreen; 