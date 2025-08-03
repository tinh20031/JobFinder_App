import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderCandidate from '../../components/HeaderDetail';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import applicationService from '../../services/applicationService';
import { JobService } from '../../services/JobService';

const ApplyCVScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [jobDetails, setJobDetails] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getAppliedJobs();
      setApplications(response);
      setError('');
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
      setError('Failed to fetch applied jobs');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppliedJobs();
    setRefreshing(false);
  };

  // Group applications by jobId and apply search filter
  useEffect(() => {
    const grouped = {};
    applications.forEach(app => {
      const jobId = app.job.jobId;
      if (!grouped[jobId]) {
        grouped[jobId] = {
          job: app.job,
          count: 1,
          applications: [app],
        };
      } else {
        grouped[jobId].count += 1;
        grouped[jobId].applications.push(app);
      }
    });
    let jobsArr = Object.values(grouped);
    if (searchTerm) {
      jobsArr = jobsArr.filter(item =>
        item.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.job.addressDetail && item.job.addressDetail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.job.provinceName && item.job.provinceName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredJobs(jobsArr);
    setCurrentPage(1); // Reset to first page when filtering
  }, [applications, searchTerm]);

  // Fetch job details if missing company name
  useEffect(() => {
    const fetchMissingJobDetails = async () => {
      const missingJobIds = filteredJobs
        .map(item => item.job.jobId)
        .filter(jobId => !jobDetails[jobId]);
      const uniqueJobIds = [...new Set(missingJobIds)];
      for (const jobId of uniqueJobIds) {
        try {
          const detail = await JobService.getJobById(jobId);
          setJobDetails(prev => ({ ...prev, [jobId]: detail }));
        } catch (e) { /* ignore */ }
      }
    };
    if (filteredJobs.length > 0) fetchMissingJobDetails();
  }, [filteredJobs]);

  const handleJobPress = (jobId) => {
    navigation.navigate('ApplyCVDetail', { jobId });
  };

  const handleViewApplications = (jobId) => {
    navigation.navigate('ApplyCVDetail', { jobId });
  };



  const formatDateVN = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTimeVN = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage-1)*jobsPerPage, currentPage*jobsPerPage);

  const handleSetPage = (page) => {
    setCurrentPage(page);
  };

  const renderJobItem = ({ item }) => {
    const job = item.job;
    const detail = jobDetails[job.jobId];
    const companyName = job.Company?.CompanyName || detail?.company?.companyName || job.company?.companyName || '';
    const location = [job.addressDetail, job.provinceName].filter(Boolean).join(', ') || 'N/A';

    // Get the latest application status
    const latestApplication = item.applications[item.applications.length - 1];
    const status = latestApplication?.status || 0;
    const statusText = ['Pending', 'Interview', 'Rejected', 'Accepted'][status] || 'Pending';
    const statusColor = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'][status] || '#f59e0b';

    return (
      <Animatable.View animation="fadeInUp" duration={600} style={styles.jobCard}>
        <TouchableOpacity
          style={styles.jobContent}
          onPress={() => handleJobPress(job.jobId)}
        >
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {job.title}
            </Text>
            <View style={styles.headerRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewApplicationsButton}
                onPress={() => handleViewApplications(job.jobId)}
              >
                <Text style={styles.viewApplicationsText}>{item.count} Applied</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="business" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {companyName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {location}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.detailText}>
                {job.timeStart ? formatDateVN(job.timeStart) : ''}
                {job.timeStart && job.timeEnd ? ' - ' : ''}
                {job.timeEnd ? formatDateVN(job.timeEnd) : ''}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };



  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => handleSetPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <MaterialIcons name="chevron-left" size={24} color={currentPage === 1 ? "#ccc" : "#444"} />
        </TouchableOpacity>

        {Array.from({ length: totalPages }, (_, i) => (
          <TouchableOpacity
            key={i + 1}
            style={[styles.paginationButton, currentPage === i + 1 && styles.paginationButtonActive]}
            onPress={() => handleSetPage(i + 1)}
          >
            <Text style={[styles.paginationText, currentPage === i + 1 && styles.paginationTextActive]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => handleSetPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <MaterialIcons name="chevron-right" size={24} color={currentPage === totalPages ? "#ccc" : "#444"} />
        </TouchableOpacity>
      </View>
    );
  };



  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderCandidate />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1967d2" />
          <Text style={styles.loadingText}>Loading applied jobs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderCandidate />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Applied Jobs</Text>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={24} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="work-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>You haven't applied for any jobs yet.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={paginatedJobs}
              renderItem={renderJobItem}
              keyExtractor={(item) => item.job.jobId.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
            {renderPagination()}
          </>
        )}
      </ScrollView>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fd',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viewApplicationsButton: {
    backgroundColor: '#1967d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewApplicationsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  jobDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  paginationButtonActive: {
    backgroundColor: '#1967d2',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  paginationTextActive: {
    color: '#fff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ApplyCVScreen; 