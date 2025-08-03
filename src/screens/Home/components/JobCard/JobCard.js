import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { JobService } from '../../../../services/JobService';
import { JobCardSkeleton } from '../../../../components/SkeletonLoading';

const JobCard = ({ 
  title = "Recent Jobs", 
  showSeeAll = true, 
  limit = null,
  showHeader = true 
}) => {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs data from API
  useEffect(() => {
    const fetchJobs = async (retryCount = 0) => {
      try {
        setLoading(true);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000) // Increased to 5 seconds
        );
        
        const jobsPromise = JobService.getJobs();
        const jobsData = await Promise.race([jobsPromise, timeoutPromise]);
        
        // Map API data to match component structure
        const mappedJobs = jobsData.map((job, index) => ({
          id: job.id?.toString() || index.toString(),
          title: job.jobTitle || job.title || 'Unknown Job',
          company: job.company?.companyName || 'Unknown Company',
          location: formatLocation(job.location, job.provinceName),
          salary: formatSalary(job.minSalary, job.maxSalary, job.isSalaryNegotiable),
          tags: getJobTags(job),
          logoColor: getLogoColor(job.company?.companyName || 'Unknown'),
          logoText: getLogoText(job.company?.companyName || 'Unknown'),
          logoUrl: job.logo || null
        }));
        
        // Store all jobs and apply limit if specified
        setAllJobs(mappedJobs);
        const limitedJobs = limit ? mappedJobs.slice(0, limit) : mappedJobs;
        setJobs(limitedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        
        // Retry logic - try again up to 2 times
        if (retryCount < 2) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          setTimeout(() => fetchJobs(retryCount + 1), 1000); // Wait 1 second before retry
          return;
        }
        
        // Set empty array if all retries failed
        setJobs([]);
        setAllJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [limit]);

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

  const handleJobBookmark = (jobId) => {
    // Handle job bookmark logic
    console.log('Job bookmarked:', jobId);
  };

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
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
          <Icon name="bookmark-border" size={28} color="#0070BA" />
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
        <View style={styles.jobsListContainer}>
          {jobs.map((job, index) => (
            <View key={job.id} style={{ marginBottom: 16 }}>
              {renderJobItem({ item: job })}
            </View>
          ))}
          
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
});

export default JobCard; 