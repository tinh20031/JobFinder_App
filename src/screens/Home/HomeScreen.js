import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/HeaderCandidate';
import SearchBar from './components/SearchBar';
import Banner from './components/Banner';
import CompanyCard from './components/CompanyCard';
import JobCard from './components/JobCard';
import { ProfileSkeleton } from '../../components/SkeletonLoading';

import profileService from '../../services/profileService';

const HomeScreen = () => {
  const navigation = useNavigation();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Show fallback data immediately for better UX
      setUserProfile({
        fullName: 'Andrew Ainsley',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      });
      setLoading(false);
      
      // Then try to fetch real data in background
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const profilePromise = profileService.getCandidateProfile();
        const profile = await Promise.race([profilePromise, timeoutPromise]);
        
        // Update with real data if successful
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Keep fallback data, no need to update loading state
      }
    };

    fetchUserProfile();
  }, []);



  const handleSearch = (text) => {
    // Handle search logic
    console.log('Search:', text);
  };

  const handleFilter = () => {
    // Handle filter logic
    console.log('Filter pressed');
  };

  const handleReadMore = () => {
    // Handle read more logic
    console.log('Read more pressed');
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
          ) : (
            <View style={styles.profileSection}>
              <Image 
                source={{ 
                  uri: userProfile?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' 
                }} 
                style={styles.profileImage} 
              />
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>Welcome back 👋</Text>
                <Text style={styles.userName}>
                  {userProfile?.fullName || 'Andrew Ainsley'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} onFilter={handleFilter} />

        {/* Banner */}
        <Banner onReadMore={handleReadMore} />

        {/* Recommendation Companies Section */}
        <CompanyCard 
          title="List Companies"
          showSeeAll={true}
          horizontal={true}
          limit={5}
        />

        {/* Recent Jobs Section */}
        <JobCard 
          title="Recent Jobs"
          showSeeAll={true}
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
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
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
