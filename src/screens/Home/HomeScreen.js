import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import Header from '../../components/HeaderCandidate';
import SearchBar from './components/SearchBar';
import Banner from './components/Banner';
import CompanyCard from './components/CompanyCard';
import JobCard from './components/JobCard';
import FilterButtons from './components/FilterButtons';
import ViewMoreButton from './components/ViewMoreButton';

const HomeScreen = () => {
  const [isViewMorePressed, setIsViewMorePressed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Data cho recommendation companies carousel
  const recommendationCompanies = [
    {
      id: '1',
      name: 'Google LLC',
      industry: 'Technology',
      location: 'California, United States',
      jobCount: '2,500+',
      tags: ['Top Rated', 'Remote Friendly'],
      logoColor: '#fff',
      logoText: 'G'
    },
    {
      id: '2',
      name: 'Facebook Inc.',
      industry: 'Social Media',
      location: 'San Francisco, United States',
      jobCount: '1,800+',
      tags: ['Innovative', 'Great Benefits'],
      logoColor: '#1877F2',
      logoText: 'F'
    },
    {
      id: '3',
      name: 'Microsoft',
      industry: 'Software',
      location: 'Seattle, United States',
      jobCount: '3,200+',
      tags: ['Stable', 'Growth'],
      logoColor: '#00A4EF',
      logoText: 'M'
    }
  ];

  // Data cho job cards
  const jobData = [
    {
      id: '1',
      title: 'Sales & Marketing',
      company: 'Paypal',
      location: 'New York, United States',
      salary: '$8,000 - $20,000 /month',
      tags: ['Full Time', 'Remote'],
      logoColor: '#0070BA',
      logoText: 'P'
    },
    {
      id: '2',
      title: 'Writing & Content',
      company: 'Pinterest',
      location: 'Paris, France',
      salary: '$5,000 - $15,000 /month',
      tags: ['Part Time', 'Onsite'],
      logoColor: '#E60023',
      logoText: 'P'
    },
    {
      id: '3',
      title: 'Business Analyst',
      company: 'Apple Inc.',
      location: 'Chicago, United States',
      salary: '$5,000 - $12,000 /month',
      tags: ['Freelance', 'Remote'],
      logoColor: '#000',
      logoText: 'A'
    },
    {
      id: '4',
      title: 'Quality Assurance',
      company: 'Spotify',
      location: 'Canberra, Australia',
      salary: '$12,000 - $25,000 /month',
      tags: ['Full Time', 'Onsite'],
      logoColor: '#1DB954',
      logoText: 'S'
    },
    {
      id: '5',
      title: 'Community Officer',
      company: 'Reddit Company',
      location: 'San Francisco, United States',
      salary: '$8,000 - $18,000 /month',
      tags: ['Full Time', 'Hybrid'],
      logoColor: '#FF4500',
      logoText: 'R'
    }
  ];

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

  const handleCompanyBookmark = (companyId) => {
    // Handle company bookmark logic
    console.log('Company bookmarked:', companyId);
  };

  const handleJobBookmark = (jobId) => {
    // Handle job bookmark logic
    console.log('Job bookmarked:', jobId);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    // Handle filter change logic
    console.log('Filter changed:', filterId);
  };

  const handleViewMore = () => {
    // Handle view more logic
    console.log('View more pressed');
  };

  const renderCompanyCard = ({ item }) => (
    <CompanyCard 
      company={item} 
      onBookmark={handleCompanyBookmark}
    />
  );

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
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} 
              style={styles.profileImage} 
            />
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Good Morning 👋</Text>
              <Text style={styles.userName}>Andrew Ainsley</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} onFilter={handleFilter} />

        {/* Banner */}
        <Banner onReadMore={handleReadMore} />

        {/* Recommendation Companies Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Companies</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Recommendation Companies Carousel */}
        <FlatList
          data={recommendationCompanies}
          renderItem={renderCompanyCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={376}
          decelerationRate="fast"
          pagingEnabled={false}
        />

        {/* Recent Jobs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <FilterButtons 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Job Cards List */}
        <View style={styles.jobCardsContainer}>
          {jobData.map((job) => (
            <JobCard 
              key={job.id}
              job={job} 
              onBookmark={handleJobBookmark}
            />
          ))}

          {/* View More Button */}
          <ViewMoreButton 
            isPressed={isViewMorePressed}
            onPressIn={() => setIsViewMorePressed(true)}
            onPressOut={() => setIsViewMorePressed(false)}
            onPress={handleViewMore}
          />
        </View>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
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
  carouselContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingRight: 36,
  },
  jobCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default HomeScreen;
