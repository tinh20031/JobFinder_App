import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonLoading = ({ width, height, borderRadius = 4, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 500, // Reduced to 500ms for faster animation
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 500, // Reduced to 500ms for faster animation
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E0E0E0',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Company Card Skeleton
export const CompanyCardSkeleton = () => (
  <View style={styles.companyCardSkeleton}>
    <View style={styles.companyCardHeader}>
      <View style={styles.companyInfoSection}>
        <SkeletonLoading width={56} height={56} borderRadius={12} />
        <View style={styles.companyTextSection}>
          <SkeletonLoading width={120} height={20} style={styles.skeletonTitle} />
          <SkeletonLoading width={100} height={15} style={styles.skeletonSubtitle} />
        </View>
      </View>
      <SkeletonLoading width={28} height={28} borderRadius={4} />
    </View>
    
    <View style={styles.divider} />
    
    <SkeletonLoading width={150} height={16} style={styles.skeletonLocation} />
    <SkeletonLoading width={100} height={12} borderRadius={6} style={styles.skeletonTagCompany} />
  </View>
);

// Job Card Skeleton
export const JobCardSkeleton = () => (
  <View style={styles.jobCardSkeleton}>
    <View style={styles.jobCardHeader}>
      <View style={styles.companyInfoSection}>
        <SkeletonLoading width={56} height={56} borderRadius={12} />
        <View style={styles.companyTextSection}>
          <SkeletonLoading width={140} height={20} style={styles.skeletonTitle} />
          <SkeletonLoading width={100} height={15} style={styles.skeletonSubtitle} />
        </View>
      </View>
      <SkeletonLoading width={28} height={28} borderRadius={4} />
    </View>
    
    <View style={styles.divider} />
    
    <SkeletonLoading width={120} height={16} style={styles.skeletonLocation} />
    <SkeletonLoading width={130} height={17} style={styles.skeletonSalary} />
    <View style={styles.skeletonTags}>
      <SkeletonLoading width={80} height={24} borderRadius={6} style={styles.skeletonTag} />
      <SkeletonLoading width={100} height={24} borderRadius={6} style={styles.skeletonTag} />
    </View>
  </View>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <View style={styles.profileSkeleton}>
    <SkeletonLoading width={60} height={60} borderRadius={30} style={styles.skeletonAvatar} />
    <View style={styles.profileTextSection}>
      <SkeletonLoading width={120} height={16} style={styles.skeletonGreeting} />
      <SkeletonLoading width={140} height={20} style={styles.skeletonName} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  companyCardSkeleton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 16,
    width: 360,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  companyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  companyInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyTextSection: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTitle: {
    marginBottom: 2,
  },
  skeletonSubtitle: {
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 6,
    marginBottom: 8,
  },
  skeletonLocation: {
    marginLeft: 68,
    marginBottom: 12,
  },
  skeletonTagCompany: {
    marginLeft: 68,
    marginTop: 8,
  },
  jobCardSkeleton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  skeletonSalary: {
    marginLeft: 68,
    marginBottom: 16,
  },
  skeletonTags: {
    flexDirection: 'row',
    marginLeft: 68,
    marginTop: 8,
  },
  skeletonTag: {
    marginRight: 8,
  },
  profileSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    marginRight: 12,
  },
  profileTextSection: {
    flex: 1,
  },
  skeletonGreeting: {
    marginBottom: 2,
  },
  skeletonName: {
    marginBottom: 0,
  },
});

export default SkeletonLoading; 