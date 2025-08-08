import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/HeaderCandidate';
import SearchBar from './components/SearchBar';
import Banner from './components/Banner';
import CategoryIcons from './components/CategoryIcons';
import CompanyCard from './components/CompanyCard';
import JobCard from './components/JobCard';
import { ProfileSkeleton } from '../../components/SkeletonLoading';

import profileService from '../../services/profileService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const profilePromise = profileService.getCandidateProfile();
        const profile = await Promise.race([profilePromise, timeoutPromise]);
        
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Don't set fallback data, let the UI handle empty state
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSearch = (text) => {
    // Navigate to ExploreScreen with search query via MainTab
    if (text && text.trim()) {
      navigation.navigate('MainTab', { 
        screen: 'Explore',
        params: {
          searchQuery: text.trim(),
          fromHome: true 
        }
      });
    }
  };

  const handleFilter = () => {
    // Navigate to FilterScreen
    navigation.navigate('Filter');
  };

  const handleReadMore = () => {
    // Handle read more logic
    console.log('Read more pressed');
  };

  const handleIndustryPress = (filterData) => {
    console.log('HomeScreen: Navigating to JobList with industry filter:', filterData);
    // Navigate to ExploreScreen with industry filter via MainTab
    // Industry filter can be applied to both jobs and companies, so we'll default to jobs tab
    navigation.navigate('MainTab', { 
      screen: 'Explore',
      params: {
        filters: {
          industry: filterData.name, // Sử dụng tên industry như trong FilterScreen
          industryId: filterData.id
        },
        filterType: 'job', // Default to jobs tab for industry filter
        fromHome: true 
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <Header />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Header with Profile */}
        <View style={styles.header}>
          {loading ? (
            <ProfileSkeleton />
          ) : userProfile ? (
            <View style={styles.profileSection}>
              <Image 
                source={{ uri: userProfile.image }} 
                style={styles.profileImage} 
              />
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>Welcome back 👋</Text>
                <Text style={styles.userName}>
                  {userProfile.fullName}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.profileSection}>
              <View style={[styles.profileImage, styles.placeholderImage]} />
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>Welcome back 👋</Text>
                <Text style={styles.userName}>Guest User</Text>
              </View>
            </View>
          )}
        </View>

        {/* Banner */}
        <Banner onReadMore={handleReadMore} />

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} onFilter={handleFilter} />

        {/* Industry Categories */}
        <CategoryIcons 
          onIndustryPress={handleIndustryPress}
          selectedFilters={route.params?.filters || {}}
          limit={6} // Hiển thị 6 industry thay vì 4
        />

        {/* Trending Jobs Section */}
        <JobCard 
          title="Trending Jobs"
          showSeeAll={false}
          limit={5}
          horizontal={false} // Hiển thị dọc thay vì carousel
        />

        {/* Recommendation Companies Section */}
        <CompanyCard 
          title="List Companies"
          showSeeAll={true}
          horizontal={true}
          limit={5}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#e5e7eb',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: -4,
    fontFamily: 'Poppins-SemiBold',
  },
  userName: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  seeAllText: {
    fontSize: 16,
    color: '#2563eb',
    fontFamily: 'Poppins-Bold',
  },
  jobCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default HomeScreen;
