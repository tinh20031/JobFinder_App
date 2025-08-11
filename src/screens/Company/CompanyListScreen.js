import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import companyService from '../../services/companyService';
import HeaderCandidates from '../../components/HeaderCandidate';
import CompanyCard from './CompanyCard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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





  const [favoriteCompanies, setFavoriteCompanies] = useState(new Set());

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favList = await companyService.getFavoriteCompanies();
        const getId = (item) => item?.companyProfileId ?? item?.companyId ?? item?.id ?? item?.idCompany ?? item?.userId;
        const ids = new Set((Array.isArray(favList) ? favList : []).map((x) => getId(x)).filter((v) => v != null).map((v) => String(v)));
        setFavoriteCompanies(ids);
      } catch (e) {
        // ignore if not logged in or error
      }
    };
    loadFavorites();
  }, []);

  const handleBookmark = async (companyId) => {
    const idStr = String(companyId);
    const isFavorite = favoriteCompanies.has(idStr);
    setFavoriteCompanies((prev) => {
      const next = new Set(prev);
      if (isFavorite) next.delete(idStr); else next.add(idStr);
      return next;
    });
    try {
      if (isFavorite) await companyService.unfavoriteCompany(companyId);
      else await companyService.favoriteCompany(companyId);
    } catch (e) {
      // revert on error
      setFavoriteCompanies((prev) => {
        const next = new Set(prev);
        const currently = next.has(idStr);
        if (currently) next.delete(idStr); else next.add(idStr);
        return next;
      });
    }
  };

  const renderCompanyCard = ({ item, index }) => {
    return (
      <CompanyCard
        item={item}
        index={index}
        favoriteCompanies={favoriteCompanies}
        onBookmarkPress={handleBookmark}
        showAnimation={true}
        animationDelay={100}
      />
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

});

export default CompanyListScreen; 