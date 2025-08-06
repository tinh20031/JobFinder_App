import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal, Alert } from 'react-native';
import { JobService } from '../../services/JobService';
import HeaderCandidates from '../../components/HeaderCandidate';
import NotFoundScreen from '../../components/NotFoundScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';
import * as favoriteJobService from '../../services/favoriteJobService';

const JobListScreen = ({ route }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('default');
  const [searchText, setSearchText] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [savedFilters, setSavedFilters] = useState({});
  const [showSortModal, setShowSortModal] = useState(false);
  const [favoriteJobs, setFavoriteJobs] = useState(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await JobService.getJobs();
        setJobs(data);
        setFilteredJobs(data);
        setIsInitialLoad(false); // Mark initial load as complete
      } catch (err) {
        setError('Failed to load job list.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Check favorite status for all jobs when jobs are loaded
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (jobs.length === 0) return;
      
      try {
        const userId = await authService.getUserId();
        if (!userId) {
          console.log('No user ID found, skipping favorite check');
          return;
        }
        
        // Only check for first 10 jobs to avoid too many API calls
        const jobsToCheck = jobs.slice(0, 10);
        const newFavoriteJobs = new Set();
        
        // Check favorite status for each job
        for (const job of jobsToCheck) {
          try {
            const response = await favoriteJobService.isJobFavorite(userId, job.id);
            if (response) {
              newFavoriteJobs.add(job.id);
            }
          } catch (error) {
            console.log(`Error checking favorite status for job ${job.id}:`, error);
          }
        }
        
        setFavoriteJobs(newFavoriteJobs);
      } catch (error) {
        console.log('Error checking favorite status:', error);
      }
    };

    if (jobs.length > 0) {
      checkFavoriteStatus();
    }
  }, [jobs]);

  // Handle filters from FilterScreen
  useEffect(() => {
    if (route.params?.filters) {
      setFilterLoading(true);
      setAppliedFilters(route.params.filters);
      // Simulate a small delay for better UX
      setTimeout(() => {
        setFilterLoading(false);
      }, 500);
    }
    // Save savedFilters for next time
    if (route.params?.savedFilters) {
      setSavedFilters(route.params.savedFilters);
    }
  }, [route.params?.filters, route.params?.savedFilters]);

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
      // Location filter - compare with provinceName
      if (filters.location && job.provinceName !== filters.location) {
        return false;
      }

      // Salary filter - handle negotiable and specific ranges
      if (filters.salary && Array.isArray(filters.salary) && filters.salary.length > 0) {
        // Check if job matches any of the selected salary types
        const matchesNegotiable = filters.salary.includes('negotiable') && job.isSalaryNegotiable;
        
        // Check if job matches any selected salary range
        const matchesRange = filters.salary.some(salaryOption => {
          if (salaryOption === 'negotiable') return false;
          
          // Parse range option (e.g., "0-2000")
          const [minStr, maxStr] = salaryOption.split('-');
          const rangeMin = parseInt(minStr);
          const rangeMax = parseInt(maxStr);
          
          // Job must have specific salary (not negotiable)
          if (job.isSalaryNegotiable) return false;
          
          const jobMinSalary = job.minSalary || 0;
          const jobMaxSalary = job.maxSalary || 0;
          
          // Check if job salary overlaps with this range
          return jobMaxSalary >= rangeMin && jobMinSalary <= rangeMax;
        });
        
        // Job must match at least one selected salary type
        if (!matchesNegotiable && !matchesRange) {
          return false;
        }
      }

      // Work type filter - compare with jobType.jobTypeName
      if (filters.workType && job.jobType?.jobTypeName !== filters.workType) {
        return false;
      }

      // Job level filter - compare with level.levelName
      if (filters.jobLevel && job.level?.levelName !== filters.jobLevel) {
        return false;
      }

      // Employment type filter - compare with jobType.jobTypeName (for employment types)
      if (filters.employmentType && job.jobType?.jobTypeName !== filters.employmentType) {
        return false;
      }

      // Experience filter - compare with experienceLevel.name
      if (filters.experience && job.experienceLevel?.name !== filters.experience) {
        return false;
      }

      // Education filter - compare with education field
      if (filters.education && job.education !== filters.education) {
        return false;
      }

      // Job function filter - compare with industry.industryName
      if (filters.jobFunction && job.industry?.industryName !== filters.jobFunction) {
        return false;
      }

      // Date posted filter
      if (filters.employmentType && filters.employmentType !== 'all') {
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        const diffInHours = (now - jobDate) / (1000 * 60 * 60);
        
        switch (filters.employmentType) {
          case 'last-hour':
            if (diffInHours > 1) return false;
            break;
          case 'last-24-hour':
            if (diffInHours > 24) return false;
            break;
          case 'last-7-days':
            if (diffInHours > 24 * 7) return false;
            break;
          case 'last-14-days':
            if (diffInHours > 24 * 14) return false;
            break;
          case 'last-30-days':
            if (diffInHours > 24 * 30) return false;
            break;
          default:
            break;
        }
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
      const sorted = sortJobs(filtered);
      setFilteredJobs(sorted);
      setSearchLoading(false);
    } else {
      // Show loading and debounce search + filter
      setSearchLoading(true);
      
      timeoutId = setTimeout(() => {
        const searchFiltered = performSearch(searchText, jobs);
        const finalFiltered = applyFilters(searchFiltered, appliedFilters);
        const sorted = sortJobs(finalFiltered);
        setFilteredJobs(sorted);
        setSearchLoading(false);
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchText, jobs, appliedFilters, sort, applyFilters, performSearch, sortJobs]); // Added back necessary dependencies

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

    const handleJobBookmark = async (jobId) => {
    try {
      const userId = await authService.getUserId();
      if (!userId) {
        Alert.alert('Error', 'Please log in to bookmark jobs.');
        return;
      }

      // Update UI immediately for better UX
      const isCurrentlyFavorite = favoriteJobs.has(jobId);
      
      if (isCurrentlyFavorite) {
        // Optimistically remove from favorites
        setFavoriteJobs(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(jobId);
          return newFavorites;
        });
        
        // Call API in background
        try {
          await favoriteJobService.removeFavoriteJob(userId, jobId);
        } catch (error) {
          // Revert UI if API fails
          setFavoriteJobs(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(jobId);
            return newFavorites;
          });
          console.error('Error removing favorite job:', error);
          Alert.alert('Error', 'Failed to remove from favorites. Please try again.');
        }
      } else {
        // Optimistically add to favorites
        setFavoriteJobs(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(jobId);
          return newFavorites;
        });
        
        // Call API in background
        try {
          await favoriteJobService.addFavoriteJob(userId, jobId);
        } catch (error) {
          // Revert UI if API fails
          setFavoriteJobs(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(jobId);
            return newFavorites;
          });
          console.error('Error adding favorite job:', error);
          Alert.alert('Error', 'Failed to add to favorites. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilterLoading(true);
    setAppliedFilters({});
    setSavedFilters({});
    setSearchText('');
    // Simulate a small delay for better UX
    setTimeout(() => {
      setFilterLoading(false);
    }, 300);
  };

  const hasActiveFilters = () => {
    return searchText.trim() !== '' || Object.keys(appliedFilters).some(key => appliedFilters[key]);
  };

  const sortJobs = useCallback((jobList) => {
    if (sort === 'default') return jobList;
    
    const sortedJobs = [...jobList];
    
    switch (sort) {
      case 'newest':
        return sortedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sortedJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'salary-high':
        return sortedJobs.sort((a, b) => {
          const aSalary = a.isSalaryNegotiable ? 0 : (a.maxSalary || a.minSalary || 0);
          const bSalary = b.isSalaryNegotiable ? 0 : (b.maxSalary || b.minSalary || 0);
          return bSalary - aSalary;
        });
      case 'salary-low':
        return sortedJobs.sort((a, b) => {
          const aSalary = a.isSalaryNegotiable ? 0 : (a.minSalary || a.maxSalary || 0);
          const bSalary = b.isSalaryNegotiable ? 0 : (b.minSalary || b.maxSalary || 0);
          return aSalary - bSalary;
        });
      case 'title-az':
        return sortedJobs.sort((a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''));
      case 'title-za':
        return sortedJobs.sort((a, b) => (b.jobTitle || '').localeCompare(a.jobTitle || ''));
      default:
        return sortedJobs;
    }
  }, [sort]);

  const handleSortSelect = (sortOption) => {
    setSort(sortOption);
    setShowSortModal(false);
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
                <MaterialIcons 
                  name={favoriteJobs.has(item.id) ? "bookmark" : "bookmark-border"} 
                  size={28} 
                  color={favoriteJobs.has(item.id) ? "#2563eb" : "#0070BA"} 
                />
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
                <View key={`${tag}-${tagIndex}`} style={styles.jobTag}>
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
            <TouchableOpacity onPress={() => navigation.navigate('Filter', { savedFilters })}>
              <MaterialIcons name="tune" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Job List */}
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
            <TouchableOpacity onPress={() => navigation.navigate('Filter', { savedFilters })}>
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
              {filteredJobs.length} found
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
            <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
            <MaterialIcons name="sort" size={20} color="#666" />
          </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Job List or Not Found */}
      <View style={{ flex: 1 }}>
        {filterLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Applying filters...</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <NotFoundScreen 
            useImage={true}
            imageResizeMode="contain"
            imageWidth={280}
            imageHeight={200}
          />
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort by</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.closeIcon}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sortOptions}>
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'default' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('default')}
              >
                <Text style={[styles.sortOptionText, sort === 'default' && styles.selectedSortOptionText]}>
                  Default
                </Text>
                {sort === 'default' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'newest' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('newest')}
              >
                <Text style={[styles.sortOptionText, sort === 'newest' && styles.selectedSortOptionText]}>
                  Newest First
                </Text>
                {sort === 'newest' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'oldest' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('oldest')}
              >
                <Text style={[styles.sortOptionText, sort === 'oldest' && styles.selectedSortOptionText]}>
                  Oldest First
                </Text>
                {sort === 'oldest' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'salary-high' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('salary-high')}
              >
                <Text style={[styles.sortOptionText, sort === 'salary-high' && styles.selectedSortOptionText]}>
                  Salary: High to Low
                </Text>
                {sort === 'salary-high' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'salary-low' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('salary-low')}
              >
                <Text style={[styles.sortOptionText, sort === 'salary-low' && styles.selectedSortOptionText]}>
                  Salary: Low to High
                </Text>
                {sort === 'salary-low' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'title-az' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('title-az')}
              >
                <Text style={[styles.sortOptionText, sort === 'title-az' && styles.selectedSortOptionText]}>
                  Job Title: A-Z
                </Text>
                {sort === 'title-az' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sort === 'title-za' && styles.selectedSortOption]}
                onPress={() => handleSortSelect('title-za')}
              >
                <Text style={[styles.sortOptionText, sort === 'title-za' && styles.selectedSortOptionText]}>
                  Job Title: Z-A
                </Text>
                {sort === 'title-za' && <MaterialIcons name="check" size={20} color="#2563eb" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 2,
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
    marginBottom: 2,
    marginLeft: 68,
    fontFamily: 'Poppins-SemiBold',
  },
  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 68,
    marginTop: 2,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  closeIcon: {
    padding: 5,
  },
  sortOptions: {
    width: '100%',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedSortOption: {
    backgroundColor: '#e0f7fa',
    borderColor: '#2563eb',
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  selectedSortOptionText: {
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default JobListScreen;
