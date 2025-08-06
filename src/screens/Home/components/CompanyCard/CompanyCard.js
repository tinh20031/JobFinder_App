import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../../../constants/api';
import companyService from '../../../../services/companyService';
import { CompanyCardSkeleton } from '../../../../components/SkeletonLoading';

const CompanyCard = ({ 
  title = "List Companies", 
  showSeeAll = true, 
  horizontal = true, 
  limit = null,
  showHeader = true 
}) => {
  const navigation = useNavigation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Fetch companies data from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000) // Increased to 5 seconds
        );
        
        const companiesPromise = companyService.filterCompanies();
        const companiesData = await Promise.race([companiesPromise, timeoutPromise]);
        
        // Map API data to match component structure
        const mappedCompanies = companiesData.map((company, index) => ({
          id: company.userId?.toString() || index.toString(),
          name: company.companyName || company.name || 'Unknown Company',
          industry: company.industryName || 'Unknown Industry',
          location: company.location || 'Unknown Location',
          teamSize: company.teamSize,
          logoColor: getLogoColor(company.companyName || company.name),
          logoText: getLogoText(company.companyName || company.name),
          logoUrl: company.urlCompanyLogo || null
        }));
        
        // Apply limit if specified
        const limitedCompanies = limit ? mappedCompanies.slice(0, limit) : mappedCompanies;
        setCompanies(limitedCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        // Set empty array if API fails - no hardcode data
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [limit]);

  // Helper function to generate logo color based on company name
  const getLogoColor = (companyName) => {
    const colors = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#be185d', '#65a30d'];
    const index = companyName.length % colors.length;
    return colors[index];
  };

  // Helper function to generate logo text (first letter of company name)
  const getLogoText = (companyName) => {
    return companyName.charAt(0).toUpperCase();
  };

  // Helper function to get company tags
  const getCompanyTags = (company) => {
    const tags = [];
    if (company.teamSize) {
      tags.push(`${company.teamSize} employees`);
    }
    return tags;
  };

  // Handle logo display - use image if available, otherwise use text
  const renderLogo = (company) => {
    if (company.logoUrl) {
      const logoUrl = company.logoUrl.startsWith('http') 
        ? company.logoUrl 
        : `${BASE_URL}${company.logoUrl}`;
      
      return (
        <Image
          source={{ uri: logoUrl }}
          style={[styles.companyLogo, { backgroundColor: '#fff' }]}
          resizeMode="cover"
          onError={() => {
            // Fallback to text logo if image fails to load
            console.log('Failed to load company logo:', logoUrl);
          }}
        />
      );
    }
    
    return (
      <View style={[styles.companyLogo, { backgroundColor: company.logoColor }]}>
        <Text style={styles.companyLogoText}>{company.logoText}</Text>
      </View>
    );
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const cardWidth = 376; // width + marginRight
    const index = Math.round(contentOffset / cardWidth);
    setCurrentIndex(Math.max(0, Math.min(index, companies.length - 1)));
  };



  const renderCompanyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.carouselJobCard} 
      onPress={() => navigation.navigate('CompanyDetail', { companyId: item.id })}
      activeOpacity={0.8}
    >
      {/* Header với logo, tên công ty, ngành nghề và bookmark */}
      <View style={styles.jobCardHeader}>
        <View style={styles.companyInfoSection}>
          {renderLogo(item)}
          <View style={styles.companyTextSection}>
            <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
            <Text style={styles.jobCompany}>{item.industry}</Text>
          </View>
        </View>
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Địa điểm */}
      <View style={styles.jobLocation}>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      

      
      {/* Tags */}
      <View style={styles.jobTags}>
        {getCompanyTags(item).map((tag, index) => (
          <View key={index} style={styles.jobTag}>
            <Text style={styles.jobTagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Section Header - Always show */}
      {showHeader && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {showSeeAll && (
            <Text 
              style={styles.seeAllText}
              onPress={() => navigation.navigate('CompanyList')}
            >
              See All
            </Text>
          )}
        </View>
      )}

      {/* Content based on state */}
      {loading ? (
        <View style={styles.skeletonContainer}>
          <CompanyCardSkeleton />
          <CompanyCardSkeleton />
          <CompanyCardSkeleton />
        </View>
      ) : companies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No companies available</Text>
        </View>
      ) : (
        <View>
          <FlatList
            ref={flatListRef}
            data={companies}
            renderItem={renderCompanyItem}
            keyExtractor={(item) => item.id}
            horizontal={horizontal}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={horizontal ? styles.carouselContainer : styles.listContainer}
            snapToInterval={horizontal ? 376 : undefined}
            decelerationRate={horizontal ? "fast" : undefined}
            pagingEnabled={horizontal ? false : undefined}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          
          {/* Simple Scroll Indicator Dots */}
          {horizontal && companies.length > 1 && (
            <View style={styles.scrollIndicatorContainer}>
              {companies.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollIndicatorDot,
                    index === currentIndex && styles.scrollIndicatorDotActive
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  scrollIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  scrollIndicatorDotActive: {
    backgroundColor: '#2563eb',
    width: 24,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  carouselJobCard: {
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
  jobCardHeader: {
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
    paddingLeft: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 6,
    marginBottom: 8,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoText: {
    color: '#2563eb',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },

  jobTitle: {
    fontSize: 20,
    color: '#000',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  jobCompany: {
    fontSize: 15,
    color: '#666',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },
  jobLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 68,
  },
  locationText: {
    fontSize: 16, 
    color: '#666',
    marginLeft: 0,
    fontFamily: 'Poppins-Regular',
  },
  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 68,
    marginTop: 2,
  },
  jobTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  jobTagText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
});

export default CompanyCard; 