import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import companyService from '../../services/companyService';
import HeaderCandidates from '../../components/HeaderCandidate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../constants/api';
import * as Animatable from 'react-native-animatable';
import NotFoundScreen from '../../components/NotFoundScreen';

const CompanyListScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [savedFilters, setSavedFilters] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const companies = await companyService.filterCompanies();
        setCompanies(Array.isArray(companies) ? companies : []);
        setFilteredCompanies(Array.isArray(companies) ? companies : []);
        setIsInitialLoad(false);
      } catch (err) {
        setError(err?.message || 'Unable to load company list.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Handle filters from CompanyFilterScreen
  useEffect(() => {
    if (route.params?.filters) {
      setFilterLoading(true);
      setAppliedFilters(route.params.filters);
      setTimeout(() => {
        setFilterLoading(false);
      }, 500);
    }
    if (route.params?.savedFilters) {
      setSavedFilters(route.params.savedFilters);
    }
  }, [route.params?.filters, route.params?.savedFilters]);

  // Filter function with useCallback
  const applyFilters = useCallback((companyList, filters) => {
    if (!filters || Object.keys(filters).every(key => !filters[key])) {
      return companyList;
    }

    return companyList.filter(company => {
      // Location filter
      if (filters.location && company.location !== filters.location) {
        return false;
      }

      // Industry filter
      if (filters.industry && company.industryName !== filters.industry) {
        return false;
      }

      // Company size filter
      if (filters.companySize) {
        const selectedRange = filters.companySize;
        const companySize = company.teamSize;
        
        // Parse the selected range (e.g., "50 - 100")
        const rangeMatch = selectedRange.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) {
          const minSize = parseInt(rangeMatch[1]);
          const maxSize = parseInt(rangeMatch[2]);
          
          // Parse company size (e.g., "500 - 1000 employees")
          const companySizeMatch = companySize?.match(/(\d+)\s*-\s*(\d+)/);
          if (companySizeMatch) {
            const companyMin = parseInt(companySizeMatch[1]);
            const companyMax = parseInt(companySizeMatch[2]);
            
            // Check if ranges overlap
            if (!(companyMin <= maxSize && companyMax >= minSize)) {
              return false;
            }
          } else {
            // If company size doesn't match the range format, exclude it
            return false;
          }
        } else {
          // If filter doesn't match range format, do exact match
          if (company.teamSize !== filters.companySize) {
            return false;
          }
        }
      }

      return true;
    });
  }, []);

  // Search function with useCallback
  const performSearch = useCallback((text, companyList) => {
    if (text.trim() === '') {
      return companyList;
    }
    
    const lowercasedSearchText = text.toLowerCase();
    return companyList.filter(company =>
      company.companyName?.toLowerCase().includes(lowercasedSearchText) ||
      company.name?.toLowerCase().includes(lowercasedSearchText)
    );
  }, []);

  // Search and filter effect
  useEffect(() => {
    let timeoutId;

    if (searchText.trim() === '') {
      const filtered = applyFilters(companies, appliedFilters);
      setFilteredCompanies(filtered);
      setSearchLoading(false);
    } else {
      setSearchLoading(true);
      
      timeoutId = setTimeout(() => {
        const searchFiltered = performSearch(searchText, companies);
        const finalFiltered = applyFilters(searchFiltered, appliedFilters);
        setFilteredCompanies(finalFiltered);
        setSearchLoading(false);
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchText, companies, appliedFilters, applyFilters, performSearch]);

  const clearFilters = () => {
    setFilterLoading(true);
    setAppliedFilters({});
    setSavedFilters({});
    setSearchText('');
    setTimeout(() => {
      setFilterLoading(false);
    }, 300);
  };

  const hasActiveFilters = () => {
    return searchText.trim() !== '' || Object.keys(appliedFilters).some(key => appliedFilters[key]);
  };

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



  const renderCompanyCard = ({ item, index }) => {
    const logoUrl = item.urlCompanyLogo
      ? (item.urlCompanyLogo.startsWith('http') ? item.urlCompanyLogo : `${BASE_URL}${item.urlCompanyLogo}`)
      : null;
    const tags = getCompanyTags(item);
    const logoColor = getLogoColor(item.companyName || item.name || 'Unknown');
    const logoText = getLogoText(item.companyName || item.name || 'Unknown');

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CompanyDetail', { companyId: item.userId })}
      >
        <Animatable.View animation="fadeInUp" duration={600} delay={index * 100}>
          <View style={styles.newCompanyCard}>
            <View style={styles.mainContentContainer}>
              <View style={styles.companyCardHeader}>
                <View style={styles.companyInfoSection}>
                  {logoUrl ? (
                    <Image 
                      source={{ uri: logoUrl }}
                      style={[styles.companyLogo, { backgroundColor: '#fff' }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.companyLogo, { backgroundColor: logoColor }]}>
                      <Text style={styles.companyLogoText}>{logoText}</Text>
                    </View>
                  )}
                  <View style={styles.companyTextSection}>
                    <Text style={styles.companyTitle} numberOfLines={1} ellipsizeMode="tail">
                      {item.companyName || item.name || 'Unknown Company'}
                    </Text>
                    <Text style={styles.companyIndustry}>
                      {item.industryName || 'Unknown Industry'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.companyTags}>
                {tags.map((tag, tagIndex) => (
                  <View 
                    key={tagIndex} 
                    style={[
                      styles.companyTag, 
                      { 
                        backgroundColor: '#f0fff4',
                        borderColor: '#9ae6b4'
                      }
                    ]}
                  >
                    <Text style={[styles.companyTagText, { color: '#059669' }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.companyFooter}>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={14} color="#666" />
                <Text style={styles.locationText}>{item.location || 'Unknown Location'}</Text>
              </View>
            </View>
          </View>
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <HeaderCandidates />
        
        {/* Header Title */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Find Companies</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity onPress={() => navigation.navigate('CompanyFilter', { savedFilters })}>
              <MaterialIcons name="tune" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Company List */}
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading company list...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
        <HeaderCandidates />
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderCandidates />
      
      {/* Header Title */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Find Companies</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchLoading ? (
            <ActivityIndicator size="small" color="#666" style={styles.searchLoading} />
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('CompanyFilter', { savedFilters })}>
              <MaterialIcons name="tune" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Count and Filter Indicator */}
      {hasActiveFilters() && !isInitialLoad && (
        <View style={styles.searchResultsHeader}>
          <View style={styles.resultsInfo}>
            <Text style={styles.searchResultsCount}>
              {filteredCompanies.length} found
            </Text>
            {Object.keys(appliedFilters).some(key => appliedFilters[key]) && (
              <View style={styles.filterIndicator}>
                <MaterialIcons name="filter-list" size={16} color="#2563eb" />
                <Text style={styles.filterIndicatorText}>Filters applied</Text>
              </View>
            )}
          </View>
          <View style={styles.filterActions}>
            {hasActiveFilters() && (
              <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
                <MaterialIcons name="clear" size={16} color="#666" />
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Company List or Loading */}
      <View style={{ flex: 1 }}>
        {filterLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Applying filters...</Text>
          </View>
        ) : filteredCompanies.length === 0 ? (
          <NotFoundScreen 
            title="No Companies Found"
            message="Sorry, no companies match your current search and filter criteria. Please try adjusting your filters or search terms."
            variant="work"
          />
        ) : (
          <FlatList
            data={filteredCompanies}
            keyExtractor={(item, idx) => item.userId?.toString() || idx.toString()}
            renderItem={renderCompanyCard}
            contentContainerStyle={styles.companyListWrap}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Title Styles
  headerTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    color: '#333',
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontFamily: 'Poppins-Bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center'
  },

  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  searchLoading: {
    marginLeft: 8,
  },

  // Search Results Header
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsInfo: {
    flex: 1,
  },
  searchResultsCount: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Bold',
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  filterIndicatorText: {
    fontSize: 12,
    color: '#2563eb',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },

  // Company List Styles
  companyListWrap: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginTop: 12,
  },
  banner: {
    backgroundColor: '#f3f7fd',
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fe',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  filterBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  totalCompanyText: {
    color: '#444',
    fontSize: 15,
  },
  sortRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7fd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // Company Card Styles (synchronized with JobCard)
  newCompanyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    width: '100%',
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
  companyCardHeader: {
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

  companyTitle: {
    fontSize: 14,
    color: '#1a202c',
    marginBottom: -2,
    fontFamily: 'Poppins-Bold',
  },
  companyIndustry: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },

  companyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -4,
  },
  companyTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 0,
    borderWidth: 1,
  },
  companyTagText: {
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 1,
    marginBottom: 1,
  },
  companyFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 3,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
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
  // Old Company Card Styles (keeping for reference)
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24, // tăng khoảng cách giữa các card
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 2, // thêm viền
    borderColor: '#e6edfa', // màu xanh nhạt
    position: 'relative',
  },
  // Old company logo and title styles (removed to avoid conflicts)
  // companyLogo: {
  //   width: 44,
  //   height: 44,
  //   borderRadius: 22,
  //   backgroundColor: '#fff',
  //   borderWidth: 1,
  //   borderColor: '#eee',
  //   marginRight: 12,
  // },
  // companyTitle: {
  //   fontSize: 17,
  //   fontWeight: 'bold',
  //   color: '#222',
  // },
  industryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ec',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 6,
    marginRight: 30, // tăng khoảng cách giữa các tag
    minHeight: 18,
    maxWidth: '70%',
  },
  industryTagText: {
    color: '#1ca97c',
    fontSize: 11, // nhỏ hơn
    fontWeight: '600',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 0,
    minHeight: undefined,
    maxWidth: '100%',
  },
  locationTagText: {
    color: '#222',
    fontSize: 13,
    fontWeight: '600',
  },
  sizeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7fd',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 6,
    marginRight: 8, // tăng khoảng cách nếu có nhiều tag
    minHeight: 18,
    maxWidth: '70%',
  },
  sizeTagText: {
    color: '#888',
    fontSize: 11, // nhỏ hơn
    fontWeight: '600',
  },
  badgeNew: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    zIndex: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeNewText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  // Thêm style mới cho tag lớn
  industryTagLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ec',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 18,
    minHeight: undefined,
    maxWidth: '80%',
  },
  industryTagTextLarge: {
    color: '#1ca97c',
    fontSize: 13,
    fontWeight: '600',
  },
  sizeTagLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7fd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 0,
    minHeight: undefined,
    maxWidth: '80%',
  },
  sizeTagTextLarge: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CompanyListScreen; 