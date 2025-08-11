import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/HeaderCandidate';
import SearchBar from './components/SearchBar';
import Banner from './components/Banner';
import CategoryIcons from './components/CategoryIcons';
import CompanyCard from './components/CompanyCard';
import JobCard from './components/JobCard';
// Removed SkeletonLoading effect

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
        <Animatable.View
          style={styles.header}
          animation="fadeInDown"
          duration={600}
          delay={0}
          useNativeDriver
        >
          {loading ? (
            <Animatable.View style={styles.profileSection} animation="fadeInUp" duration={400} delay={50} useNativeDriver>
              <Animatable.View
                style={[styles.profileImage, styles.placeholderImage]}
                animation="pulse"
                iterationCount="infinite"
                duration={1000}
                useNativeDriver
              />
              <View style={styles.greetingSection}>
                <Animatable.View
                  style={[styles.placeholderLine, styles.placeholderLineLong]}
                  animation="pulse"
                  iterationCount="infinite"
                  duration={1000}
                  delay={100}
                  useNativeDriver
                />
                <Animatable.View
                  style={[styles.placeholderLine, styles.placeholderLineShort]}
                  animation="pulse"
                  iterationCount="infinite"
                  duration={1000}
                  delay={200}
                  useNativeDriver
                />
              </View>
            </Animatable.View>
          ) : userProfile ? (
            <Animatable.View style={styles.profileSection} animation="fadeInUp" duration={600} delay={50} useNativeDriver>
              <Animatable.Image 
                source={{ uri: userProfile.image }} 
                style={styles.profileImage}
                animation="zoomIn"
                duration={500}
                delay={100}
                useNativeDriver
              />
              <View style={styles.greetingSection}>
                <Animatable.Text style={styles.greeting} animation="fadeInRight" duration={500} delay={150} useNativeDriver>
                  Welcome 👋
                </Animatable.Text>
                <Animatable.Text style={styles.userName} animation="fadeInRight" duration={600} delay={200} useNativeDriver>
                  {userProfile.fullName}
                </Animatable.Text>
              </View>
            </Animatable.View>
          ) : null}
        </Animatable.View>

        {/* Banner */}
        <Animatable.View animation="fadeInUp" duration={600} delay={100} useNativeDriver>
          <Banner onReadMore={handleReadMore} />
        </Animatable.View>

        {/* Search Bar */}
        <Animatable.View animation="fadeInUp" duration={600} delay={150} useNativeDriver style={{ marginTop: 12 }}>
          <SearchBar onSearch={handleSearch} onFilter={handleFilter} />
        </Animatable.View>

        {/* Industry Categories */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} useNativeDriver>
          <CategoryIcons 
            onIndustryPress={handleIndustryPress}
            selectedFilters={route.params?.filters || {}}
            limit={6} // Hiển thị 6 industry thay vì 4
          />
        </Animatable.View>

        {/* Trending Jobs Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={250} useNativeDriver>
          <JobCard 
            title="Trending Jobs"
            showSeeAll={false}
            limit={5}
            horizontal={false} // Hiển thị dọc thay vì carousel
          />
        </Animatable.View>

        {/* Recommendation Companies Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} useNativeDriver>
          <CompanyCard 
            title="List Companies"
            showSeeAll={true}
            horizontal={true}
            limit={5}
          />
        </Animatable.View>
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
  placeholderLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    marginTop: 6,
  },
  placeholderLineLong: {
    width: '60%',
  },
  placeholderLineShort: {
    width: '40%',
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
