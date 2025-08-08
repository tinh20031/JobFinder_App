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
    <View style={styles.mainContentContainer}>
      <View style={styles.jobCardHeader}>
        <View style={styles.companyInfoSection}>
          <SkeletonLoading width={36} height={36} borderRadius={8} />
          <View style={styles.companyTextSection}>
            <SkeletonLoading width={140} height={14} style={styles.skeletonTitle} />
            <SkeletonLoading width={100} height={11} style={styles.skeletonSubtitle} />
          </View>
        </View>
      </View>
      
      <View style={styles.skeletonTags}>
        <SkeletonLoading width={80} height={24} borderRadius={6} style={styles.skeletonTag} />
        <SkeletonLoading width={100} height={24} borderRadius={6} style={styles.skeletonTag} />
        <SkeletonLoading width={60} height={24} borderRadius={6} style={styles.skeletonTag} />
      </View>
    </View>
    
    <View style={styles.divider} />
    
    <View style={styles.jobFooter}>
      <SkeletonLoading width={120} height={12} />
      <SkeletonLoading width={60} height={24} borderRadius={6} />
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
    marginBottom: 1,
  },
  skeletonSubtitle: {
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 1,
    marginBottom: 1,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  skeletonSalary: {
    marginLeft: 68,
    marginBottom: 16,
  },
  skeletonTags: {
    flexDirection: 'row',
    marginTop: 2,
  },
  skeletonTag: {
    marginRight: 5,
  },
  mainContentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
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