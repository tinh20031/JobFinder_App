import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const Banner = () => {
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const HORIZONTAL_MARGIN = 10;
  const CAROUSEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_MARGIN * 2;
  // Tính chiều cao theo tỉ lệ ảnh gốc (we-are-hiring-digital-collage.jpg ~ 2:1)
  const BASE_IMAGE = require('../../../../images/banner/we-are-hiring-digital-collage.jpg');
  const baseMeta = Image.resolveAssetSource(BASE_IMAGE);
  const BASE_RATIO = baseMeta?.width && baseMeta?.height ? baseMeta.height / baseMeta.width : 0.5; // fallback 2:1
  const CAROUSEL_HEIGHT = Math.round(CAROUSEL_WIDTH * BASE_RATIO);
  const BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.1);

  const bannerImages = [
    require('../../../../images/banner/9984338.jpg'),
    require('../../../../images/banner/7509227.jpg'),
    BASE_IMAGE,
  ];

  const indexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const appearAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // no-op: giữ chiều cao cố định

  useEffect(() => {
    let isCancelled = false;

    const TRANSITION_MS = 700;
    const HOLD_MS = 2300;

    const runCycle = () => {
      if (isCancelled) return;

      const direction = indexRef.current % 2 === 0 ? 1 : -1; // xen kẽ trái/phải
      const startOffset = Math.round(CAROUSEL_WIDTH * 0.04);

      fadeInAnim.setValue(0);
      translateXAnim.setValue(direction * startOffset);

      Animated.parallel([
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: TRANSITION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: TRANSITION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished || isCancelled) return;
        const nextIndex = (indexRef.current + 1) % bannerImages.length;
        setPreviousIndex(indexRef.current);
        setCurrentIndex(nextIndex);
        indexRef.current = nextIndex;
        timerRef.current = setTimeout(runCycle, HOLD_MS);
      });
    };

    runCycle();

    return () => {
      isCancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [CAROUSEL_WIDTH, bannerImages.length, fadeInAnim, translateXAnim]);

  useEffect(() => {
    Animated.timing(appearAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appearAnim]);

  return (
    <View style={{ marginHorizontal: HORIZONTAL_MARGIN }}>
      <Animated.View
        style={[
          styles.container,
          {
            width: CAROUSEL_WIDTH,
            height: CAROUSEL_HEIGHT,
            borderRadius: Math.round(SCREEN_WIDTH * 0.03),
            opacity: appearAnim,
            transform: [
              {
                translateY: appearAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
              },
              { scale: appearAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
            ],
          },
        ]}
      >
        <Animated.View style={{ width: '100%', height: '100%' }}>
          <Image
            source={bannerImages[previousIndex]}
            style={[styles.bannerImage]}
          />
          <Animated.Image
            source={bannerImages[currentIndex]}
            style={[
              styles.bannerImage,
              { opacity: fadeInAnim, transform: [{ translateX: translateXAnim }] },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // dots styles removed in Ken Burns variant
});

export default Banner; 