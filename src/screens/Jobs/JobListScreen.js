import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { JobService } from '../../services/JobService';
import HeaderCandidates from '../../components/HeaderCandidate';
import NotFoundScreen from '../../components/NotFoundScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const JobListScreen = ({ route }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('default');
  const [searchText, setSearchText] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await JobService.getJobs();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        setError('Failed to load job list.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Handle filters from FilterScreen
  useEffect(() => {
    if (route.params?.filters) {
      setAppliedFilters(route.params.filters);
    }
  }, [route.params?.filters]);

  // Handle search query from HomeScreen
  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchText(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  // Filter function with useCallback
  const applyFilters = useCallback((jobList, filters) => {
    if (!filters || Object.keys(filters).every(key => !filters[key])) {
      return jobList;
    }

    return jobList.filter(job => {
      // Location filter
      if (filters.location && job.provinceName !== filters.location) {
        return false;
      }

      // Salary filter
      if (filters.salary) {
        const jobSalary = formatSalary(job.minSalary, job.maxSalary, job.isSalaryNegotiable);
        if (jobSalary !== filters.salary) {
          return false;
        }
      }

      // Work type filter
      if (filters.workType && job.jobType?.jobTypeName !== filters.workType) {
        return false;
      }

      // Job level filter
      if (filters.jobLevel && job.jobLevel !== filters.jobLevel) {
        return false;
      }

      // Employment type filter
      if (filters.employmentType && job.employmentType !== filters.employmentType) {
        return false;
      }

      // Experience filter
      if (filters.experience && job.experience !== filters.experience) {
        return false;
      }

      // Education filter
      if (filters.education && job.education !== filters.education) {
        return false;
      }

      // Job function filter
      if (filters.jobFunction && job.industry?.industryName !== filters.jobFunction) {
        return false;
      }

      return true;
    });
  }, []);

  // Search function with useCallback
  const performSearch = useCallback((text, jobList) => {
    if (text.trim() === '') {
      return jobList;
    }
    
    const lowercasedSearchText = text.toLowerCase();
    return jobList.filter(job =>
      job.jobTitle?.toLowerCase().includes(lowercasedSearchText) ||
      (job.company && job.company.companyName && job.company.companyName.toLowerCase().includes(lowercasedSearchText))
    );
  }, []);

  // Search and filter effect with loading
  useEffect(() => {
    let timeoutId;

    if (searchText.trim() === '') {
      // Apply only filters when search is empty
      const filtered = applyFilters(jobs, appliedFilters);
      setFilteredJobs(filtered);
      setSearchLoading(false);
    } else {
      // Show loading and debounce search + filter
      setSearchLoading(true);
      
      timeoutId = setTimeout(() => {
        const searchFiltered = performSearch(searchText, jobs);
        const finalFiltered = applyFilters(searchFiltered, appliedFilters);
        setFilteredJobs(finalFiltered);
        setSearchLoading(false);
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchText, jobs, performSearch, appliedFilters, applyFilters]);

  // Helper function to format salary
  const formatSalary = (minSalary, maxSalary, isNegotiable) => {
    if (isNegotiable) {
      return 'Negotiable Salary';
    }
    if (minSalary && maxSalary) {
      return `$${minSalary} - $${maxSalary}`;
    } else if (minSalary) {
      return `$${minSalary}`;
    } else if (maxSalary) {
      return `$${maxSalary}`;
    }
    return 'Negotiable Salary';
  };

  // Helper function to get job tags
  const getJobTags = (job) => {
    const tags = [];
    if (job.jobType?.jobTypeName) {
      tags.push(job.jobType.jobTypeName);
    }
    if (job.industry?.industryName) {
      tags.push(job.industry.industryName);
    }
    return tags;
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

  const handleJobBookmark = (jobId) => {
    // Handle job bookmark logic
    console.log('Job bookmarked:', jobId);
  };

  const renderJobCard = ({ item, index }) => {
    const salaryText = formatSalary(item.minSalary, item.maxSalary, item.isSalaryNegotiable);
    const tags = getJobTags(item);
    const logoColor = getLogoColor(item.company?.companyName || 'Unknown');
    const logoText = getLogoText(item.company?.companyName || 'Unknown');

    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      >
        <Animatable.View animation="fadeInUp" duration={600} delay={index * 100}>
          <View style={styles.newJobCard}>
            <View style={styles.jobCardHeader}>
              <View style={styles.companyInfoSection}>
                {item.logo ? (
                  <Image 
                    source={{ uri: item.logo }}
                    style={[styles.companyLogo, { backgroundColor: '#fff' }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.companyLogo, { backgroundColor: logoColor }]}>
                    <Text style={styles.companyLogoText}>{logoText}</Text>
                  </View>
                )}
                <View style={styles.companyTextSection}>
                  <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.jobTitle || 'Unknown Job'}
                  </Text>
                  <Text style={styles.jobCompany}>
                    {item.company?.companyName || 'Unknown Company'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.bookmarkButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  handleJobBookmark(item.id);
                }}
              >
                <MaterialIcons name="bookmark-border" size={28} color="#0070BA" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.jobLocation}>
              <Text style={styles.locationText}>
                {item.provinceName || item.location || 'Unknown Location'}
              </Text>
            </View>
            <Text style={styles.jobSalary}>{salaryText}</Text>
            <View style={styles.jobTags}>
              {tags.map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.jobTag}>
                  <Text style={styles.jobTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <HeaderCandidates />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading job list...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
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
        <Text style={{
          fontSize: 28,
          color: '#333',
          includeFontPadding: false,
          textAlignVertical: 'center',
          fontFamily: 'Poppins-Bold',
          fontStyle: 'normal',
          letterSpacing: 0,
          textAlign: 'center'
        }}>Find Jobs</Text>
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
            <TouchableOpacity onPress={() => navigation.navigate('Filter')}>
              <MaterialIcons name="tune" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Count and Filter Indicator */}
      {(searchText.trim() !== '' || Object.keys(appliedFilters).some(key => appliedFilters[key])) && (
        <View style={styles.searchResultsHeader}>
          <View style={styles.resultsInfo}>
            <Text style={styles.searchResultsCount}>
              {filteredJobs.length} found
            </Text>
            {Object.keys(appliedFilters).some(key => appliedFilters[key]) && (
              <View style={styles.filterIndicator}>
                <MaterialIcons name="filter-list" size={16} color="#2563eb" />
                <Text style={styles.filterIndicatorText}>Filters applied</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.sortButton}>
            <MaterialIcons name="sort" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Job List or Not Found */}
      <View style={{ flex: 1 }}>
        {searchText.trim() !== '' && filteredJobs.length === 0 ? (
          <NotFoundScreen 
            useImage={true}
            imageResizeMode="contain"
            imageWidth={280}
            imageHeight={200}
          />
        ) : filteredJobs.length === 0 ? (
          <Text style={styles.noJobsText}>No jobs found.</Text>
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
            renderItem={renderJobCard}
            contentContainerStyle={styles.jobListWrap}
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
  sortButton: {
    padding: 4,
  },



  // Job List Styles
  jobListWrap: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Existing Job Card Styles (keeping as is)
  newJobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  bookmarkButton: {
    padding: 4,
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
    marginBottom: 12,
    marginLeft: 68,
  },
  locationText: {
    fontSize: 16, 
    color: '#666',
    marginLeft: 0,
    fontFamily: 'Poppins-Regular',
  },
  jobSalary: {
    fontSize: 17,
    color: '#2563eb',
    marginBottom: 16,
    marginLeft: 68,
    fontFamily: 'Poppins-SemiBold',
  },
  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 68,
    marginTop: 8,
  },
  jobTag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  jobTagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },

  // Utility Styles
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
    fontFamily: 'Poppins-Regular',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginTop: 12,
  },
  noJobsText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default JobListScreen;
