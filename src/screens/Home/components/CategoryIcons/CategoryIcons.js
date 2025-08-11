import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { JobService } from '../../../../services/JobService';

const { width: screenWidth } = Dimensions.get('window');

const CategoryIcons = ({ onIndustryPress, selectedFilters = {}, limit = null }) => {
  const flatListRef = useRef(null);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map industry names to icons
  const getIndustryIcon = (industryName) => {
    const name = industryName.toLowerCase();
    if (name.includes('computer') || name.includes('software') || name.includes('tech')) {
      return 'computer';
    } else if (name.includes('art') || name.includes('design') || name.includes('creative')) {
      return 'palette';
    } else if (name.includes('finance') || name.includes('banking') || name.includes('accounting')) {
      return 'account-balance';
    } else if (name.includes('health') || name.includes('medical') || name.includes('care')) {
      return 'local-hospital';
    } else if (name.includes('education') || name.includes('school') || name.includes('teaching')) {
      return 'school';
    } else if (name.includes('marketing') || name.includes('advertising') || name.includes('sales')) {
      return 'trending-up';
    } else if (name.includes('manufacturing') || name.includes('production') || name.includes('industrial')) {
      return 'build';
    } else if (name.includes('retail') || name.includes('commerce') || name.includes('ecommerce')) {
      return 'shopping-cart';
    } else {
      return 'business'; // default icon
    }
  };

  // Generate random color for each industry
  const getIndustryColor = (industryName) => {
    const colors = [
      { bg: '#fef3c7', icon: '#f59e0b', text: '#92400e' }, // Amber
      { bg: '#dbeafe', icon: '#3b82f6', text: '#1e40af' }, // Blue
      { bg: '#dcfce7', icon: '#22c55e', text: '#15803d' }, // Green
      { bg: '#fce7f3', icon: '#ec4899', text: '#be185d' }, // Pink
      { bg: '#f3e8ff', icon: '#a855f7', text: '#7c3aed' }, // Purple
      { bg: '#fef2f2', icon: '#ef4444', text: '#dc2626' }, // Red
      { bg: '#ecfdf5', icon: '#10b981', text: '#047857' }, // Emerald
      { bg: '#fff7ed', icon: '#f97316', text: '#ea580c' }, // Orange
      { bg: '#f0f9ff', icon: '#0ea5e9', text: '#0369a1' }, // Sky
      { bg: '#fdf4ff', icon: '#d946ef', text: '#a21caf' }, // Fuchsia
    ];
    
    // Use industry name to generate consistent color
    const index = industryName.length % colors.length;
    return colors[index];
  };

  // Load industries from API and count jobs
  useEffect(() => {
    const loadIndustriesWithJobCount = async () => {
      try {
        setLoading(true);
        
        // Load both industries and jobs
        const [industriesData, jobsData] = await Promise.all([
          JobService.getIndustries(),
          JobService.getJobs()
        ]);
        
        // Count jobs per industry
        const jobCountByIndustry = {};
        jobsData.forEach(job => {
          const industryName = job.industry?.industryName || job.company?.industryName;
          if (industryName) {
            jobCountByIndustry[industryName] = (jobCountByIndustry[industryName] || 0) + 1;
          }
        });
        
        // Transform API data to component format with job count
        const limitedIndustries = limit ? industriesData.slice(0, limit) : industriesData;
        const transformedIndustries = limitedIndustries.map(industry => {
          const industryName = industry.industryName || industry.name;
          const jobCount = jobCountByIndustry[industryName] || 0;
          const colors = getIndustryColor(industryName);
          
          return {
            id: industry.id || industry.industryId,
            icon: getIndustryIcon(industryName),
            label: industryName,
            jobCount: `${jobCount} job${jobCount > 1 ? 's' : ''}`,
            colors: colors,
            originalData: industry
          };
        });
        
        setIndustries(transformedIndustries);
        
        // Restore selected industries from filters if available
        if (selectedFilters.industry) {
          const matchingIndustry = transformedIndustries.find(ind => 
            ind.label === selectedFilters.industry || ind.id === selectedFilters.industryId
          );
          if (matchingIndustry) {
            setSelectedIndustries([matchingIndustry.id]);
          }
        }
      } catch (error) {
        console.error('Error loading industries with job count:', error);
        // Don't set fallback data, let the UI handle empty state
        setIndustries([]);
      } finally {
        setLoading(false);
      }
    };

    loadIndustriesWithJobCount();
  }, [selectedFilters, limit]);

  // Auto-scroll carousel effect
  useEffect(() => {
    if (industries.length > 4) { // Only auto-scroll if more than 4 items
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % industries.length;
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, 4000); // Auto-scroll every 4 seconds

      return () => clearInterval(interval);
    }
  }, [industries]);

  // Handle scroll events
  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const itemWidth = 150; // Width of each category item
    const index = Math.round(contentOffset / itemWidth);
    setCurrentIndex(index);
  };

  const handleIndustryPress = (industryId) => {
    setSelectedIndustries(prev => {
      // Toggle selection
      if (prev.includes(industryId)) {
        return prev.filter(id => id !== industryId);
      } else {
        return [...prev, industryId];
      }
    });
    
    if (onIndustryPress) {
      // Tìm industry name từ ID để gửi filter
      const selectedIndustry = industries.find(ind => ind.id === industryId);
      if (selectedIndustry) {
        onIndustryPress({
          id: industryId,
          name: selectedIndustry.label, // Sử dụng label đã được transform
          filterType: 'industry'
        });
      }
    }
  };

  if (loading) {
    return null;
  }

  // Don't render anything if no industries data
  if (!industries || industries.length === 0) {
    return null;
  }

  const renderCategoryItem = ({ item, index }) => (
    <TouchableOpacity
      key={item.id || `industry-${index}`}
      style={styles.categoryItem}
      onPress={() => handleIndustryPress(item.id)}
      activeOpacity={0.7}
      android_ripple={null}
    >
      <View style={[
        styles.categoryBox,
        { backgroundColor: item.colors.bg }
      ]}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: item.colors.bg, shadowColor: item.colors.icon }
        ]}>
          <Icon name={item.icon} size={24} color={item.colors.icon} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.categoryLabel,
            { color: item.colors.text }
          ]} numberOfLines={2} ellipsizeMode="tail">
            {item.label}
          </Text>
          <Text style={[
            styles.jobCountText,
            { color: item.colors.text }
          ]}>{item.jobCount || '0 job'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Job Industry</Text>
      <FlatList
        ref={flatListRef}
        data={industries}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={120} // Width of each category item
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />
      
      {/* Pagination Dots - Only show if more than 4 items */}
      {industries.length > 4 && (
        <View style={styles.paginationContainer}>
          {industries.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 12,
    marginLeft: 20,
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingBottom: 16, // Add bottom padding to prevent cutoff
  },
  categoryItem: {
    alignItems: 'center',
    width: 120,
    marginRight: 16,
    marginBottom: 6,
  },
  categoryBox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    height: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 6,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 50,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 28,
  },
  jobCountText: {
    fontSize: 9,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 3,
    minHeight: 12,
  },
  iconContainerPressed: {
    backgroundColor: '#e0f2fe',
    transform: [{ scale: 0.95 }],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2563eb',
    width: 24,
  },
});

export default CategoryIcons; 