import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { JobService } from '../../../../services/JobService';
import { JobCardSkeleton } from '../../../../components/SkeletonLoading';
import { authService } from '../../../../services/authService';
import * as favoriteJobService from '../../../../services/favoriteJobService';

const { width: screenWidth } = Dimensions.get('window');

const JobCard = ({ 
  title = "Trending Jobs", 
  showSeeAll = true, 
  limit = null,
  showHeader = true 
}) => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteJobs, setFavoriteJobs] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch trending jobs data from API
  useEffect(() => {
    const fetchTrendingJobs = async (retryCount = 0) => {
      try {
        setLoading(true);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000) // Increased to 5 seconds
        );
        
        const jobsPromise = JobService.getTrendingJobs({ 
          role: "candidate", 
          page: 1, 
          pageSize: limit || 10 
        });
        const jobsData = await Promise.race([jobsPromise, timeoutPromise]);
        
        console.log('API trending jobs response:', jobsData);
        
        // Debug company data structure
        if (jobsData && Array.isArray(jobsData) && jobsData.length > 0) {
          console.log('First job company data:', jobsData[0]?.company);
          console.log('First job logo data:', jobsData[0]?.company?.urlCompanyLogo);
        }
        
        // Kiểm tra và xử lý dữ liệu an toàn
        let actualJobsData = jobsData;
        
        // Nếu jobsData là object, tìm thuộc tính chứa mảng jobs
        if (jobsData && typeof jobsData === 'object' && !Array.isArray(jobsData)) {
          if (jobsData.data && Array.isArray(jobsData.data)) {
            actualJobsData = jobsData.data;
          } else if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
            actualJobsData = jobsData.jobs;
          } else if (jobsData.items && Array.isArray(jobsData.items)) {
            actualJobsData = jobsData.items;
          } else if (jobsData.results && Array.isArray(jobsData.results)) {
            actualJobsData = jobsData.results;
          }
        }
        
        if (!actualJobsData || !Array.isArray(actualJobsData)) {
          console.log('API trending jobs trả về dữ liệu không hợp lệ, thử dùng API getJobs:', jobsData);
          
          // Fallback to getJobs API
          try {
            const fallbackJobsData = await JobService.getJobs();
            if (fallbackJobsData && Array.isArray(fallbackJobsData)) {
                             const mappedJobs = fallbackJobsData.map((job, index) => ({
                 id: job.id?.toString() || job.jobId?.toString() || index.toString(),
                 title: job.jobTitle || job.title || 'Unknown Job',
                 company: job.company?.companyName || 'Unknown Company',
                 location: formatLocation(job.location, job.provinceName),
                 salary: formatSalary(job.minSalary, job.maxSalary, job.isSalaryNegotiable),
                 tags: getJobTags(job),
                 logoColor: getLogoColor(job.company?.companyName || 'Unknown'),
                 logoText: getLogoText(job.company?.companyName || 'Unknown'),
                 logoUrl: job.company?.urlCompanyLogo || job.logo || null
               }));
              
              setAllJobs(mappedJobs);
              const limitedJobs = limit ? mappedJobs.slice(0, limit) : mappedJobs;
              setJobs(limitedJobs);
              return;
            }
          } catch (fallbackError) {
            console.error('Lỗi khi dùng API getJobs fallback:', fallbackError);
          }
          
          setJobs([]);
          setAllJobs([]);
          return;
        }
        
        // Map API data to match component structure
        const mappedJobs = actualJobsData.map((job, index) => {
          const mappedJob = {
            id: job.id?.toString() || job.jobId?.toString() || index.toString(),
            title: job.jobTitle || job.title || 'Unknown Job',
            company: job.company?.companyName || 'Unknown Company',
            location: formatLocation(job.location, job.provinceName),
            salary: formatSalary(job.minSalary, job.maxSalary, job.isSalaryNegotiable),
            tags: getJobTags(job),
            logoColor: getLogoColor(job.company?.companyName || 'Unknown'),
            logoText: getLogoText(job.company?.companyName || 'Unknown'),
            logoUrl: job.company?.urlCompanyLogo || job.logo || null
          };
          
          // Debug logo URL for first job
          if (index === 0) {
            console.log('First mapped job logo URL:', mappedJob.logoUrl);
            console.log('Original job company data:', job.company);
            console.log('Original job ID:', job.id, 'jobId:', job.jobId);
            console.log('Mapped job ID:', mappedJob.id);
          }
          
          return mappedJob;
        });
        
        // Store all jobs and apply limit if specified
        setAllJobs(mappedJobs);
        const limitedJobs = limit ? mappedJobs.slice(0, limit) : mappedJobs;
        setJobs(limitedJobs);
      } catch (error) {
        console.error('Error fetching trending jobs:', error);
        
        // Retry logic - try again up to 2 times
        if (retryCount < 2) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          setTimeout(() => fetchTrendingJobs(retryCount + 1), 1000); // Wait 1 second before retry
          return;
        }
        
        // Set empty array if all retries failed
        setJobs([]);
        setAllJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingJobs();
  }, [limit]);

  // Check favorite status for jobs when jobs are loaded
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

  // Auto-scroll carousel effect
  useEffect(() => {
    if (jobs.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % jobs.length;
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, 3000); // Auto-scroll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [jobs]);

  // Handle scroll events
  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (screenWidth - 60)); // 60 is total horizontal padding
    setCurrentIndex(index);
  };

  // Helper function to format location - use provinceName from API
  const formatLocation = (location, provinceName) => {
    return provinceName || location || 'Unknown Location';
  };

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

  // Helper function to get job tags - only jobType and industry
  const getJobTags = (job) => {
    const tags = [];
    if (job.jobType?.jobTypeName) {
      tags.push(job.jobType.jobTypeName);
    }
    if (job.industry?.industryName) {
      tags.push(job.industry.industryName);
    }
    return tags; // Return empty array if no tags - no hardcode fallback
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

  const renderJobItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => {
        console.log('Navigating to JobDetail with jobId:', item.id);
        navigation.navigate('JobDetail', { jobId: item.id });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.companyInfoSection}>
          {item.logoUrl ? (
            <Image 
              source={{ uri: item.logoUrl }}
              style={[styles.companyLogo, { backgroundColor: '#fff' }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.companyLogo, { backgroundColor: item.logoColor }]}>
              <Text style={styles.companyLogoText}>{item.logoText}</Text>
            </View>
          )}
          <View style={styles.companyTextSection}>
            <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
            <Text style={styles.jobCompany}>{item.company}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.bookmarkButton} 
          onPress={(e) => {
            e.stopPropagation(); // Prevent card press when bookmark is pressed
            handleJobBookmark(item.id);
          }}
        >
          <Icon 
            name={favoriteJobs.has(item.id) ? "bookmark" : "bookmark-border"} 
            size={28} 
            color={favoriteJobs.has(item.id) ? "#2563eb" : "#0070BA"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.jobLocation}>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      <Text style={styles.jobSalary}>{item.salary}</Text>
      <View style={styles.jobTags}>
        {item.tags.map((tag, index) => (
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
              onPress={() => navigation.navigate('JobList')}
            >
              See All
            </Text>
          )}
        </View>
      )}

      {/* Content based on state */}
      {loading ? (
        <View style={styles.skeletonContainer}>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No jobs available</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            snapToInterval={screenWidth - 60} // 60 is total horizontal padding
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContent}
            getItemLayout={(data, index) => ({
              length: screenWidth - 60,
              offset: (screenWidth - 60) * index,
              index,
            })}
          />
          
          {/* Pagination Dots */}
          {jobs.length > 1 && (
            <View style={styles.paginationContainer}>
              {jobs.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Load More Button - Show when there are more jobs than the limit */}
          {limit && allJobs.length > limit && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={() => navigation.navigate('JobList')}
              activeOpacity={0.8}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
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
    paddingBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  jobsListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginRight: 20,
    width: screenWidth - 60, // Full width minus padding
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
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  jobTagText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  loadMoreButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadMoreText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2563eb',
    width: 24,
  },
});

export default JobCard; 