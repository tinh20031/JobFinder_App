import React, { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderCandidates from '../../components/HeaderCandidate';
import JobCard from '../Jobs/JobCard';
import CompanyCard from '../Company/CompanyCard';
import NotFoundScreen from '../../components/NotFoundScreen';
import { JobService } from '../../services/JobService';
import companyService from '../../services/companyService';
import { authService } from '../../services/authService';
import * as favoriteJobService from '../../services/favoriteJobService';

const ExploreScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'companies'
  
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState([]); // jobs displayed with pagination
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  // Trending jobs integration
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [errorTrending, setErrorTrending] = useState('');
  const [mergedJobs, setMergedJobs] = useState([]);
  const [favoriteJobs, setFavoriteJobs] = useState(new Set());
  // Pagination state for jobs
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Companies state
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [visibleCompanies, setVisibleCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState('');
  const [companyPage, setCompanyPage] = useState(1);
  const [companyPageSize] = useState(10);
  const [isLoadingMoreCompanies, setIsLoadingMoreCompanies] = useState(false);
  
  // Search and filter state
  const [jobSearchText, setJobSearchText] = useState('');
  const [companySearchText, setCompanySearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [jobFilters, setJobFilters] = useState({});
  const [companyFilters, setCompanyFilters] = useState({});
  const [savedFilters, setSavedFilters] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use refs to track filter state to prevent conflicts
  const jobFiltersRef = useRef({});
  const companyFiltersRef = useRef({});
  
  // Load saved filters from AsyncStorage on mount
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const savedJobFilters = await AsyncStorage.getItem('explore_job_filters');
        const savedCompanyFilters = await AsyncStorage.getItem('explore_company_filters');
        
        if (savedJobFilters) {
          const parsed = JSON.parse(savedJobFilters);
          jobFiltersRef.current = parsed;
          setJobFilters(parsed);
        }
        
        if (savedCompanyFilters) {
          const parsed = JSON.parse(savedCompanyFilters);
          companyFiltersRef.current = parsed;
          setCompanyFilters(parsed);
        }
      } catch (error) {
        console.log('ExploreScreen: Error loading saved filters:', error);
      }
    };
    
    loadSavedFilters();
  }, []);

  // Load initial data
  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  // Fetch trending jobs for Explore (jobs tab)
  const fetchTrendingJobs = React.useCallback(async () => {
    try {
      setLoadingTrending(true);
      setErrorTrending('');
      const result = await JobService.getTrendingJobs({ role: 'candidate', page: 1, pageSize: 10 });
      const trendingArray = Array.isArray(result?.jobs) ? result.jobs : Array.isArray(result) ? result : (result?.data || []);
      const normalized = (trendingArray || []).map((job, index) => ({
        id: job.jobId || job.id,
        jobTitle: job.title || job.jobTitle,
        description: job.description,
        companyId: job.companyId,
        company: job.company
          ? {
              id: job.company.userId || job.company.id,
              fullName: job.company.fullName,
              email: job.company.email,
              companyName: job.company.companyName,
              location: job.company.location,
              urlCompanyLogo: job.company.urlCompanyLogo,
            }
          : null,
        provinceName: job.provinceName,
        isSalaryNegotiable: job.isSalaryNegotiable,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        logo: (job.company && job.company.urlCompanyLogo) || '',
        industryId: job.industryId,
        industry: job.industry
          ? { industryId: job.industry.industryId, industryName: job.industry.industryName }
          : null,
        jobTypeId: job.jobTypeId,
        jobType: job.jobType
          ? { id: job.jobType.jobTypeId || job.jobType.id, jobTypeName: job.jobType.jobTypeName }
          : null,
        levelId: job.levelId,
        level: job.level
          ? { id: job.level.levelId || job.level.id, levelName: job.level.levelName }
          : null,
        quantity: job.quantity ?? 1,
        expiryDate: job.expiryDate,
        timeStart: job.timeStart,
        timeEnd: job.timeEnd,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        status: job.status,
        addressDetail: job.addressDetail,
        skills: job.skills || [],
        isTrending: true,
        trendingRank: (job.trendingRank || index + 1),
      }));
      setTrendingJobs(normalized);
    } catch (e) {
      console.log('ExploreScreen: Failed to fetch trending jobs', e);
      setTrendingJobs([]);
      setErrorTrending('Failed to load trending jobs');
    } finally {
      setLoadingTrending(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingJobs();
  }, [fetchTrendingJobs]);

  // Merge trending + jobs (active first) for Jobs tab
  useEffect(() => {
    const onlyActive = (list) => list.filter(j => (j.status === undefined) || j.status === 2);
    const trending = onlyActive(trendingJobs);
    const all = onlyActive(jobs);
    const trendingIds = new Set(trending.map(j => j.id));
    const nonTrending = all.filter(j => !trendingIds.has(j.id));
    const merged = [...trending, ...nonTrending];
    setMergedJobs(merged);
    setPage(1); // reset pagination whenever source changes
  }, [jobs, trendingJobs]);

  // Handle filters from FilterScreen
  useEffect(() => {
    if (route.params?.filters) {
      setFilterLoading(true);
      
      // Set filters based on filter type, preserving other tab's filters
      if (route.params?.filterType === 'company') {
        const newCompanyFilters = route.params.filters;
        companyFiltersRef.current = newCompanyFilters;
        setCompanyFilters(newCompanyFilters);
        setCompanyPage(1);
        
        // Save to AsyncStorage
        AsyncStorage.setItem('explore_company_filters', JSON.stringify(newCompanyFilters));
        
        setActiveTab('companies');
      } else {
        const newJobFilters = route.params.filters;
        jobFiltersRef.current = newJobFilters;
        setJobFilters(newJobFilters);
        setPage(1);
        // Re-apply filters immediately without user needing to refresh
        const filteredNow = applyJobFilters(mergedJobs, newJobFilters);
        setFilteredJobs(filteredNow);
        
        // Save to AsyncStorage
        AsyncStorage.setItem('explore_job_filters', JSON.stringify(newJobFilters));
        
        setActiveTab('jobs');
      }
      
      // Clear route params to prevent re-processing
      navigation.setParams({
        filters: undefined,
        savedFilters: undefined,
        filterType: undefined
      });
      
      setTimeout(() => {
        setFilterLoading(false);
      }, 200);
    }
    if (route.params?.savedFilters) {
      setSavedFilters(route.params.savedFilters);
    }
  }, [route.params?.filters, route.params?.savedFilters, route.params?.filterType, navigation]);





  // Handle search query from HomeScreen
  useEffect(() => {
    if (route.params?.searchQuery) {
      setJobSearchText(route.params.searchQuery);
      // If search comes from HomeScreen, default to jobs tab
      if (route.params?.fromHome) {
        setActiveTab('jobs');
      }
      setPage(1);
    }
  }, [route.params?.searchQuery, route.params?.fromHome]);

  // Check favorite status for jobs (use merged jobs)
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (mergedJobs.length === 0) return;
      
      try {
        const userId = await authService.getUserId();
        if (!userId) {
          console.log('No user ID found, skipping favorite check');
          return;
        }
        
        const jobsToCheck = mergedJobs.slice(0, 10);
        const newFavoriteJobs = new Set();
        
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

    if (mergedJobs.length > 0) {
      checkFavoriteStatus();
    }
  }, [mergedJobs]);

  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const data = await JobService.getJobs();
      setJobs(data);
      setIsInitialLoad(false);
    } catch (err) {
      setJobsError('Failed to load job list.');
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    setCompaniesError('');
    try {
      const companies = await companyService.filterCompanies();
      setCompanies(Array.isArray(companies) ? companies : []);
      setFilteredCompanies(Array.isArray(companies) ? companies : []);
    } catch (err) {
      setCompaniesError('Unable to load company list.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Pull-to-refresh handlers
  const onRefreshJobs = async () => {
    setIsRefreshing(true);
    setPage(1);
    try {
      await Promise.all([fetchJobs(), fetchTrendingJobs()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRefreshCompanies = async () => {
    setIsRefreshing(true);
    setCompanyPage(1);
    try {
      await fetchCompanies();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter functions
  const applyJobFilters = useCallback((jobList, filters) => {
    if (!filters || Object.keys(filters).every(key => !filters[key])) {
      return jobList;
    }

    return jobList.filter(job => {
      // Location filter
      if (filters.location && job.provinceName !== filters.location) {
        return false;
      }

      // Salary filter
      if (filters.salary && Array.isArray(filters.salary) && filters.salary.length > 0) {
        const matchesNegotiable = filters.salary.includes('negotiable') && job.isSalaryNegotiable;
        
        const matchesRange = filters.salary.some(salaryOption => {
          if (salaryOption === 'negotiable') return false;
          
          if (salaryOption.includes('+')) {
            const minStr = salaryOption.replace('+', '');
            const rangeMin = parseInt(minStr);
            if (job.isSalaryNegotiable) return false;
            const jobMinSalary = job.minSalary || 0;
            return jobMinSalary >= rangeMin;
          }
          
          const [minStr, maxStr] = salaryOption.split('-');
          const rangeMin = parseInt(minStr);
          const rangeMax = parseInt(maxStr);
          if (job.isSalaryNegotiable) return false;
          const jobMinSalary = job.minSalary || 0;
          const jobMaxSalary = job.maxSalary || 0;
          return jobMaxSalary >= rangeMin && jobMinSalary <= rangeMax;
        });
        
        if (!matchesNegotiable && !matchesRange) {
          return false;
        }
      }

      // Industry filter: support both Home (industry, industryId) and FilterScreen (workType as industry name)
      if (filters.industryId) {
        if (String(job.industryId) !== String(filters.industryId)) return false;
      }
      const industryNameFilter = filters.industry || filters.workType; // Home uses 'industry', FilterScreen maps to 'workType'
      if (industryNameFilter && job.industry?.industryName !== industryNameFilter) {
        return false;
      }

      // Job type filter: FilterScreen sends 'jobLevel' as JobType name
      if (filters.jobLevel && job.jobType?.jobTypeName !== filters.jobLevel) {
        return false;
      }

      // Date posted filter (FilterScreen maps date to employmentType key)
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

      // Level filter: FilterScreen sends 'experience' as Level name
      if (filters.experience && job.level?.levelName !== filters.experience) {
        return false;
      }

      // Salary filter: FilterScreen sends array of salary tokens in 'salary'
      if (filters.salary && Array.isArray(filters.salary) && filters.salary.length > 0) {
        const matchesNegotiable = filters.salary.includes('negotiable') && job.isSalaryNegotiable;
        const matchesRange = filters.salary.some(salaryOption => {
          if (salaryOption === 'negotiable') return false;
          if (salaryOption.includes('+')) {
            const minStr = salaryOption.replace('+', '');
            const rangeMin = parseInt(minStr);
            if (job.isSalaryNegotiable) return false;
            const jobMinSalary = job.minSalary || 0;
            return jobMinSalary >= rangeMin;
          }
          const [minStr, maxStr] = salaryOption.split('-');
          const rangeMin = parseInt(minStr);
          const rangeMax = parseInt(maxStr);
          if (job.isSalaryNegotiable) return false;
          const jobMinSalary = job.minSalary || 0;
          const jobMaxSalary = job.maxSalary || 0;
          return jobMaxSalary >= rangeMin && jobMinSalary <= rangeMax;
        });
        if (!matchesNegotiable && !matchesRange) {
          return false;
        }
      }

      // Job function filter
      if (filters.jobFunction && job.industry?.industryName !== filters.jobFunction) {
        return false;
      }

      // Industry filter
      if (filters.industry && job.industry?.industryName !== filters.industry) {
        return false;
      }

      return true;
    });
  }, []);

  const applyCompanyFilters = useCallback((companyList, filters) => {
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
        
        const rangeMatch = selectedRange.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) {
          const minSize = parseInt(rangeMatch[1]);
          const maxSize = parseInt(rangeMatch[2]);
          
          const companySizeMatch = companySize?.match(/(\d+)\s*-\s*(\d+)/);
          if (companySizeMatch) {
            const companyMin = parseInt(companySizeMatch[1]);
            const companyMax = parseInt(companySizeMatch[2]);
            
            if (!(companyMin <= maxSize && companyMax >= minSize)) {
              return false;
            }
          } else {
            return false;
          }
        } else {
          if (company.teamSize !== filters.companySize) {
            return false;
          }
        }
      }

      return true;
    });
  }, []);

  // Search functions
  const performJobSearch = useCallback((text, jobList) => {
    if (text.trim() === '') {
      return jobList;
    }
    
    const lowercasedSearchText = text.toLowerCase();
    return jobList.filter(job =>
      job.jobTitle?.toLowerCase().includes(lowercasedSearchText) ||
      (job.company && job.company.companyName && job.company.companyName.toLowerCase().includes(lowercasedSearchText))
    );
  }, []);

  const performCompanySearch = useCallback((text, companyList) => {
    if (text.trim() === '') {
      return companyList;
    }
    
    const lowercasedSearchText = text.toLowerCase();
    return companyList.filter(company =>
      company.companyName?.toLowerCase().includes(lowercasedSearchText) ||
      company.name?.toLowerCase().includes(lowercasedSearchText)
    );
  }, []);

  // Search and filter effect for jobs (use mergedJobs + jobFilters)
  useEffect(() => {
    let timeoutId;

    if (jobSearchText.trim() === '') {
      // Apply only filters when search is empty
      const filtered = applyJobFilters(mergedJobs, jobFilters);
      setFilteredJobs(filtered);
      setSearchLoading(false);
    } else {
      // Show loading and debounce search + filter
      setSearchLoading(true);
      
      timeoutId = setTimeout(() => {
        const searchFiltered = performJobSearch(jobSearchText, mergedJobs);
        const finalFiltered = applyJobFilters(searchFiltered, jobFilters);
        setFilteredJobs(finalFiltered);
        setSearchLoading(false);
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [jobSearchText, mergedJobs, jobFilters, applyJobFilters, performJobSearch]);

  // Build visible jobs list based on page
  useEffect(() => {
    const end = page * pageSize;
    setVisibleJobs(filteredJobs.slice(0, end));
  }, [filteredJobs, page, pageSize]);

  const handleLoadMoreJobs = () => {
    if (isLoadingMore) return;
    const hasMore = visibleJobs.length < filteredJobs.length;
    if (!hasMore) return;
    setIsLoadingMore(true);
    // Simulate small delay for smoother UX
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 250);
  };

  // Search and filter effect for companies
  useEffect(() => {
    let timeoutId;

    if (companySearchText.trim() === '') {
      // Apply only filters when search is empty
      const filtered = applyCompanyFilters(companies, companyFiltersRef.current);
      setFilteredCompanies(filtered);
      setSearchLoading(false);
      setCompanyPage(1);
    } else {
      // Show loading and debounce search + filter
      setSearchLoading(true);
      
      timeoutId = setTimeout(() => {
        const searchFiltered = performCompanySearch(companySearchText, companies);
        const finalFiltered = applyCompanyFilters(searchFiltered, companyFiltersRef.current);
        setFilteredCompanies(finalFiltered);
        setSearchLoading(false);
        setCompanyPage(1);
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [companySearchText, companies, applyCompanyFilters, performCompanySearch]);

  // Build visible companies list based on pagination
  useEffect(() => {
    const end = companyPage * companyPageSize;
    setVisibleCompanies(filteredCompanies.slice(0, end));
  }, [filteredCompanies, companyPage, companyPageSize]);

  const handleLoadMoreCompanies = () => {
    if (isLoadingMoreCompanies) return;
    const hasMore = visibleCompanies.length < filteredCompanies.length;
    if (!hasMore) return;
    setIsLoadingMoreCompanies(true);
    setTimeout(() => {
      setCompanyPage(prev => prev + 1);
      setIsLoadingMoreCompanies(false);
    }, 250);
  };

  // Apply search and filters when switching tabs
  useEffect(() => {
    if (activeTab === 'jobs') {
      // Apply job search and filters
      if (jobSearchText.trim() === '') {
        const filtered = applyJobFilters(jobs, jobFilters);
        setFilteredJobs(filtered);
      } else {
        const searchFiltered = performJobSearch(jobSearchText, jobs);
        const finalFiltered = applyJobFilters(searchFiltered, jobFilters);
        setFilteredJobs(finalFiltered);
      }
    } else {
      // Apply company search and filters
      if (companySearchText.trim() === '') {
        const filtered = applyCompanyFilters(companies, companyFilters);
        setFilteredCompanies(filtered);
      } else {
        const searchFiltered = performCompanySearch(companySearchText, companies);
        const finalFiltered = applyCompanyFilters(searchFiltered, companyFilters);
        setFilteredCompanies(finalFiltered);
      }
    }
  }, [activeTab, jobs, companies, jobSearchText, companySearchText, jobFilters, companyFilters, applyJobFilters, applyCompanyFilters, performJobSearch, performCompanySearch]);

  const handleJobBookmark = async (jobId) => {
    try {
      const userId = await authService.getUserId();
      if (!userId) {
        Alert.alert('Error', 'Please log in to bookmark jobs.');
        return;
      }

      const isCurrentlyFavorite = favoriteJobs.has(jobId);
      
      if (isCurrentlyFavorite) {
        setFavoriteJobs(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(jobId);
          return newFavorites;
        });
        
        try {
          await favoriteJobService.removeFavoriteJob(userId, jobId);
        } catch (error) {
          setFavoriteJobs(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(jobId);
            return newFavorites;
          });
          console.error('Error removing favorite job:', error);
          Alert.alert('Error', 'Failed to remove from favorites. Please try again.');
        }
      } else {
        setFavoriteJobs(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(jobId);
          return newFavorites;
        });
        
        try {
          await favoriteJobService.addFavoriteJob(userId, jobId);
        } catch (error) {
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
    
    // Only clear filters for the current tab
    if (activeTab === 'jobs') {
      jobFiltersRef.current = {};
      setJobFilters({});
      setJobSearchText('');
      AsyncStorage.removeItem('explore_job_filters');
    } else {
      companyFiltersRef.current = {};
      setCompanyFilters({});
      setCompanySearchText('');
      AsyncStorage.removeItem('explore_company_filters');
    }
    
    setSavedFilters({});
    
    setTimeout(() => {
      setFilterLoading(false);
    }, 300);
  };

  const hasActiveFilters = () => {
    const currentFilters = activeTab === 'jobs' ? jobFilters : companyFilters;
    const currentSearchText = activeTab === 'jobs' ? jobSearchText : companySearchText;
    return currentSearchText.trim() !== '' || Object.keys(currentFilters).some(key => currentFilters[key]);
  };

  const openFilter = () => {
    if (activeTab === 'jobs') {
      navigation.navigate('Filter', { savedFilters });
    } else {
      navigation.navigate('CompanyFilter', { savedFilters });
    }
  };

  const renderJobCard = ({ item, index }) => (
    <JobCard
      item={item}
      index={index}
      favoriteJobs={favoriteJobs}
      onBookmarkPress={handleJobBookmark}
      showAnimation={true}
      animationDelay={100}
    />
  );

  const renderCompanyCard = ({ item, index }) => (
    <CompanyCard
      item={item}
      index={index}
      showAnimation={true}
      animationDelay={100}
    />
  );

  const renderContent = () => {
    if (activeTab === 'jobs') {
      if (jobsLoading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        );
      }
      if (loadingTrending) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading trending jobs...</Text>
          </View>
        );
      }

      if (jobsError) {
        return (
          <View style={styles.center}>
            <Text style={styles.error}>{jobsError}</Text>
          </View>
        );
      }
      if (errorTrending) {
        // Vẫn hiển thị jobs nếu trending lỗi
        console.log('Trending error:', errorTrending);
      }

      if (filterLoading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Applying filters...</Text>
          </View>
        );
      }

      if (filteredJobs.length === 0) {
        return (
          <NotFoundScreen 
            useImage={true}
            imageResizeMode="contain"
            imageWidth={280}
            imageHeight={200}
          />
        );
      }

      return (
        <FlatList
          data={visibleJobs}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderJobCard}
          contentContainerStyle={styles.listWrap}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={onRefreshJobs}
          onEndReached={handleLoadMoreJobs}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore && visibleJobs.length > 0 ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color="#007bff" />
              </View>
            ) : null
          }
        />
      );
    } else {
      if (companiesLoading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading companies...</Text>
          </View>
        );
      }

      if (companiesError) {
        return (
          <View style={styles.center}>
            <Text style={styles.error}>{companiesError}</Text>
          </View>
        );
      }

      if (filterLoading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Applying filters...</Text>
          </View>
        );
      }

      if (filteredCompanies.length === 0) {
        return (
          <NotFoundScreen 
            title="No Companies Found"
            message="Sorry, no companies match your current search and filter criteria. Please try adjusting your filters or search terms."
            variant="work"
          />
        );
      }

      return (
        <FlatList
          data={visibleCompanies}
          keyExtractor={(item, idx) => item.userId?.toString() || idx.toString()}
          renderItem={renderCompanyCard}
          contentContainerStyle={styles.listWrap}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={onRefreshCompanies}
          onEndReached={handleLoadMoreCompanies}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMoreCompanies && visibleCompanies.length > 0 ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color="#007bff" />
              </View>
            ) : null
          }
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <HeaderCandidates />
      


      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
          onPress={() => setActiveTab('jobs')}
        >
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>
            Jobs
          </Text>
          {activeTab === 'jobs' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'companies' && styles.activeTab]}
          onPress={() => setActiveTab('companies')}
        >
          <Text style={[styles.tabText, activeTab === 'companies' && styles.activeTabText]}>
            Companies
          </Text>
          {activeTab === 'companies' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === 'jobs' ? 'jobs' : 'companies'}...`}
            placeholderTextColor="#666"
            value={activeTab === 'jobs' ? jobSearchText : companySearchText}
            onChangeText={activeTab === 'jobs' ? setJobSearchText : setCompanySearchText}
          />
          {searchLoading ? (
            <ActivityIndicator size="small" color="#666" style={styles.searchLoading} />
          ) : (
            <TouchableOpacity onPress={openFilter}>
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
              {activeTab === 'jobs' ? filteredJobs.length : filteredCompanies.length} found
            </Text>
            {(() => {
              const currentFilters = activeTab === 'jobs' ? jobFiltersRef.current : companyFiltersRef.current;
              const activeFilterCount = Object.keys(currentFilters).filter(key => currentFilters[key]).length;
              return activeFilterCount > 0;
            })() && (
              <View style={styles.filterIndicator}>
                <MaterialIcons name="filter-list" size={16} color="#2563eb" />
                <Text style={styles.filterIndicatorText}>
                  {(() => {
                    const currentFilters = activeTab === 'jobs' ? jobFiltersRef.current : companyFiltersRef.current;
                    const activeFilterCount = Object.keys(currentFilters).filter(key => currentFilters[key]).length;
                    return `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`;
                  })()}
                </Text>
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

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // No background color for active tab
  },
  tabText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Poppins-Medium',
  },
  activeTabText: {
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
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
  content: {
    flex: 1,
  },
  listWrap: {
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
    fontFamily: 'Poppins-Regular',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginTop: 12,
  },
});

export default ExploreScreen; 