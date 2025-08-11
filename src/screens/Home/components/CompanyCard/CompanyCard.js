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
    const [favoriteCompanies, setFavoriteCompanies] = useState(new Set());
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const autoScrollInterval = useRef(null);

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

        // Load favorite companies
        try {
          const favList = await companyService.getFavoriteCompanies();
          const getId = (item) => item?.companyProfileId ?? item?.companyId ?? item?.id ?? item?.idCompany ?? item?.userId;
          const ids = new Set((Array.isArray(favList) ? favList : []).map((x) => getId(x)).filter((v) => v != null).map((v) => String(v)));
          setFavoriteCompanies(ids);
        } catch (e) {
          // ignore not logged in / errors
        }
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
  const handleBookmarkPress = async (companyId) => {
    const idStr = String(companyId);
    const isSaved = favoriteCompanies.has(idStr);
    // optimistic toggle
    setFavoriteCompanies((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(idStr); else next.add(idStr);
      return next;
    });
    try {
      if (isSaved) await companyService.unfavoriteCompany(companyId);
      else await companyService.favoriteCompany(companyId);
    } catch (e) {
      // revert on error
      setFavoriteCompanies((prev) => {
        const next = new Set(prev);
        const nowSaved = next.has(idStr);
        if (nowSaved) next.delete(idStr); else next.add(idStr);
        return next;
      });
    }
  };


  // Auto-scroll functionality
  useEffect(() => {
    if (horizontal && companies.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % companies.length;
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, 3000); // Scroll every 3 seconds
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [horizontal, companies.length]);

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
    const newIndex = Math.max(0, Math.min(index, companies.length - 1));
    setCurrentIndex(newIndex);
    
    // Reset auto-scroll timer when user manually scrolls
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % companies.length;
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, 3000);
    }
  };



  const renderCompanyItem = ({ item }) => {
    const idStr = String(item.id);
    const isSaved = favoriteCompanies.has(idStr);
    return (
    <TouchableOpacity 
      style={styles.carouselJobCard} 
      onPress={() => navigation.navigate('CompanyDetail', { companyId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.mainContentContainer}>
        <View style={styles.jobCardHeader}>
          <View style={styles.companyInfoSection}>
            {renderLogo(item)}
            <View style={styles.companyTextSection}>
              <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
              <Text style={styles.jobCompany}>{item.industry}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.jobTags}>
          {getCompanyTags(item).map((tag, index) => (
            <View 
              key={index} 
              style={[
                styles.jobTag, 
                { 
                  backgroundColor: '#f0fff4',
                  borderColor: '#9ae6b4'
                }
              ]}
            >
              <Text style={[styles.jobTagText, { color: '#059669' }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.companyFooter}>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={(e) => {
            e.stopPropagation();
            handleBookmarkPress(item.id);
          }}
        >
          <Icon 
            name={isSaved ? 'bookmark' : 'bookmark-border'} 
            size={20} 
            color={isSaved ? '#2563eb' : '#666'}
          />
          <Text style={styles.footerText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ); };

  return (
    <View style={styles.container}>
      {/* Section Header - Always show */}
      {showHeader && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {showSeeAll && (
            <Text 
              style={styles.seeAllText}
               onPress={() =>
                 navigation.navigate('MainTab', {
                   screen: 'Explore',
                   params: { initialTab: 'companies' },
                 })
               }
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
            getItemLayout={(data, index) => ({
              length: 376,
              offset: 376 * index,
              index,
            })}
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
    marginBottom: 12,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    width: 360,
    marginRight: 16,
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
    marginTop: 1,
    marginBottom: 1,
  },
  companyLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  companyLogoText: {
    color: '#3182ce',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },

  jobTitle: {
    fontSize: 14,
    color: '#1a202c',
    marginBottom: -2,
    fontFamily: 'Poppins-Bold',
  },
  jobCompany: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },

  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -4,
  },
  jobTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 0,
    borderWidth: 1,
  },
  jobTagText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
  },
  mainContentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 8,
  },
  companyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationText: {
    fontSize: 11,
    color: '#495057',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    paddingHorizontal: 8,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CompanyCard; 