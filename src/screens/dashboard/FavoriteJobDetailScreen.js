import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { JobService } from '../../services/JobService';
import HeaderCandidates from '../../components/HeaderDetail';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import * as favoriteJobService from '../../services/favoriteJobService';
import { authService } from '../../services/authService';

const FavoriteJobDetailScreen = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [removingJobId, setRemovingJobId] = useState(null); // Loading state for specific job
  const navigation = useNavigation();

  const fetchFavoriteJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = await authService.getUserId();
      if (!userId) {
        setError('You must be logged in to view favorite jobs.');
        setLoading(false);
        return;
      }

             // Get user's favorite jobs
       const favoritesResponse = await favoriteJobService.getUserFavorites(userId);

       // Handle different response formats
       let favorites = [];
       if (Array.isArray(favoritesResponse)) {
         favorites = favoritesResponse;
       } else if (favoritesResponse && Array.isArray(favoritesResponse.data)) {
         favorites = favoritesResponse.data;
       } else if (favoritesResponse && favoritesResponse.favorites) {
         favorites = favoritesResponse.favorites;
       } else {
         favorites = [];
       }

       // Extract job IDs from favorites - handle different field names
       const jobIds = favorites.map(fav => {
         const jobId = fav.jobId || fav.JobId || fav.job_id || fav.job_id;
         return jobId;
       }).filter(id => id != null);

             if (jobIds.length === 0) {
         setFavoriteJobs([]);
         setLoading(false);
         return;
       }

       // Get all jobs and filter by favorite job IDs
       const allJobs = await JobService.getJobs();

       const favoriteJobsData = allJobs.filter(job => {
         const jobIdStr = job.id?.toString();
         const jobIdNum = job.jobId?.toString();
         const isFavorite = jobIds.includes(jobIdStr) || jobIds.includes(jobIdNum);
         return isFavorite;
       });
       

      
             // If no jobs found but we have job IDs, try to get jobs directly
       if (favoriteJobsData.length === 0 && jobIds.length > 0) {
         try {
           const directJobs = [];
           for (const jobId of jobIds.slice(0, 5)) { // Limit to first 5 to avoid too many requests
             try {
               const job = await JobService.getJobById(jobId);
               if (job) {
                 directJobs.push(job);
               }
             } catch (err) {
               // Silent fail for individual job fetch
             }
           }
           if (directJobs.length > 0) {
             setFavoriteJobs(directJobs);
             return;
           }
         } catch (err) {
           // Silent fail for direct job fetching
         }
       }
      
      setFavoriteJobs(favoriteJobsData);
         } catch (err) {
       setError('Failed to load favorite jobs.');
     } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavoriteJobs();
    setRefreshing(false);
  };

    const handleRemoveFavorite = async (jobId) => {
    // Validate jobId
    if (!jobId) {
      Alert.alert('Error', 'Invalid job ID. Please try again.');
      return;
    }

    try {
      setRemovingJobId(jobId);
      const userId = await authService.getUserId();
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to manage favorites.');
        return;
      }

      console.log('Removing favorite job with ID:', jobId, 'for user:', userId);
      await favoriteJobService.removeFavoriteJob(userId, jobId);
      
      // Remove from local state
      setFavoriteJobs(prevJobs => prevJobs.filter(job => (job.id !== jobId && job.jobId !== jobId)));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove job from favorites.');
    } finally {
      setRemovingJobId(null);
    }
  };

  const renderJobCard = ({ item, index }) => {
    let salaryText = '';
    if (item.minSalary && item.maxSalary) {
      salaryText = `$${item.minSalary} - $${item.maxSalary}`;
    } else if (item.minSalary) {
      salaryText = `$${item.minSalary}`;
    } else if (item.maxSalary) {
      salaryText = `$${item.maxSalary}`;
    } else {
      salaryText = 'Negotiable Salary';
    }

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('JobDetail', { jobId: item.id || item.jobId })}>
        <Animatable.View animation="fadeInUp" duration={600} delay={index * 100}>
          <View style={styles.jobCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                             {/* Logo */}
               {(item.logo || item.company?.urlCompanyLogo || item.company?.logo || item.urlCompanyLogo) && (
                 <Image 
                   source={{ 
                     uri: item.logo || item.company?.urlCompanyLogo || item.company?.logo || item.urlCompanyLogo 
                   }} 
                   style={styles.logoCircle}
                   resizeMode="cover"
                 />
               )}
                             {/* Thông tin bên phải logo */}
               <View style={{ flex: 1, marginLeft: 5 }}>
                 <Text style={styles.jobTitle}>
                   {item.jobTitle || item.title || item.name || item.jobName || 'Job Title'}
                 </Text>
                 <Text style={styles.jobCompany}>{item.company?.companyName || 'Unknown Company'}</Text>
                 {/* Location */}
                 {item.location && (
                   <Text style={styles.jobLocation}>{item.location}</Text>
                 )}
               </View>
              {/* Remove favorite button */}
              <TouchableOpacity 
                style={[styles.removeFavoriteBtn, removingJobId === (item.id || item.jobId) && styles.removeFavoriteBtnActive]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(item.id || item.jobId);
                }}
                disabled={removingJobId === (item.id || item.jobId)}
              >
                {removingJobId === (item.id || item.jobId) ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="bookmark" size={20} color="#1967D2" />
                )}
              </TouchableOpacity>
            </View>
            
            {/* Salary */}
            <Text style={[styles.jobSalary, { marginTop: 12, marginLeft: item.logo ? 5 : 0 }]}>
              <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>{salaryText}</Text>
            </Text>
            
            {/* Job Details Row */}
            <View style={styles.jobDetailsRow}>
              {/* Experience Level */}
              {item.experienceLevel && (
                <View style={styles.jobDetailItem}>
                  <MaterialIcons name="work" size={16} color="#666" />
                  <Text style={styles.jobDetailText}>
                    {typeof item.experienceLevel === 'object' ? item.experienceLevel.name : item.experienceLevel}
                  </Text>
                </View>
              )}
              
              {/* Number of Positions */}
              {item.numberOfPositions && item.numberOfPositions > 1 && (
                <View style={styles.jobDetailItem}>
                  <MaterialIcons name="group" size={16} color="#666" />
                  <Text style={styles.jobDetailText}>{item.numberOfPositions} positions</Text>
                </View>
              )}
            </View>
            
            {/* Tags Row */}
            <View style={styles.jobTagsRow}>
              {item.jobType && (
                <View style={styles.jobTag}>
                  <Text style={styles.jobTagText}>
                    {typeof item.jobType === 'object' ? item.jobType.jobTypeName : item.jobType}
                  </Text>
                </View>
              )}
              {item.industry && (
                <View style={styles.jobTag}>
                  <Text style={styles.jobTagText}>
                    {typeof item.industry === 'object' ? item.industry.industryName : item.industry}
                  </Text>
                </View>
              )}
              {/* Skills */}
              {item.skills && item.skills.length > 0 && (
                <View style={styles.jobTag}>
                  <Text style={styles.jobTagText}>
                    {item.skills.slice(0, 2).join(', ')}
                    {item.skills.length > 2 && '...'}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Additional Info */}
            <View style={styles.additionalInfoRow}>
              {/* Posted Date */}
              {item.createdAt && (
                <View style={styles.additionalInfoItem}>
                  <MaterialIcons name="schedule" size={14} color="#999" />
                  <Text style={styles.additionalInfoText}>
                    Posted {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {/* Expiry Date */}
              {item.expiryDate && (
                <View style={styles.additionalInfoItem}>
                  <MaterialIcons name="event" size={14} color="#999" />
                  <Text style={styles.additionalInfoText}>
                    Expires {new Date(item.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
        <HeaderCandidates />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading favorite jobs...</Text>
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
          <TouchableOpacity style={styles.retryBtn} onPress={fetchFavoriteJobs}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f7fd' }}>
      <HeaderCandidates />
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Favorite Jobs</Text>
        <Text style={styles.bannerSubtitle}>Your saved job opportunities</Text>
      </View>
      
            {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteJobs.length}</Text>
          <Text style={styles.statLabel}>Saved Jobs</Text>
        </View>
      </View>

      

      {/* Job List */}
      <View style={{ flex: 1 }}>
        {favoriteJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="bookmark-border" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No favorite jobs yet</Text>
            <Text style={styles.emptySubtitle}>
              Start browsing jobs and save the ones you like by tapping the bookmark icon
            </Text>
                         <TouchableOpacity 
               style={styles.browseBtn}
               onPress={() => navigation.navigate('MainTab', { screen: 'Job' })}
             >
               <Text style={styles.browseBtnText}>Browse Jobs</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favoriteJobs}
            keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
            renderItem={renderJobCard}
            contentContainerStyle={styles.jobListWrap}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  retryBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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
    color: '#222',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    color: '#2563eb',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  jobListWrap: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 2,
    borderColor: '#e6edfa',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 17,
    color: '#222',
    fontFamily: 'Poppins-Bold',
  },
  jobCompany: {
    fontSize: 14,
    color: '#222',
    marginLeft: 4,
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
  },
  jobLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  jobSalary: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
  jobTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  jobTag: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  jobTagText: {
    color: '#222',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  jobDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  jobDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  additionalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  additionalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  additionalInfoText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  removeFavoriteBtn: {
    backgroundColor: '#eaf1fb',
    borderRadius: 12,
    padding: 8,
  },
  removeFavoriteBtnActive: {
    backgroundColor: '#1967D2',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  browseBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },

});

export default FavoriteJobDetailScreen; 