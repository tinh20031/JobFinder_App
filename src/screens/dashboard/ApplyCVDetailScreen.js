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
  RefreshControl,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HeaderCandidate from '../../components/HeaderDetail';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import applicationService from '../../services/applicationService';
import { JobService } from '../../services/JobService';

const ApplyCVDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId } = route.params || {};
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [jobDetails, setJobDetails] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 5;

  useEffect(() => {
    if (jobId) {
      fetchApplications();
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const allApps = await applicationService.getAppliedJobs();
      const filteredApps = allApps.filter(app => app.job.jobId === Number(jobId));
      setApplications(filteredApps);
      setError('');
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const jobDetail = await JobService.getJobById(jobId);
      setJobDetails(jobDetail);
    } catch (err) {
      console.error('Error fetching job details:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    await fetchJobDetails();
    setRefreshing(false);
  };

  const handleShowModal = (content) => {
    setModalContent(content);
    setShowModal(true);
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
  const totalPages = Math.ceil(applications.length / applicationsPerPage);
  const paginatedApplications = applications.slice((currentPage-1)*applicationsPerPage, currentPage*applicationsPerPage);

  const handleSetPage = (page) => {
    setCurrentPage(page);
  };

  const handleViewCV = (resumeUrl) => {
    if (resumeUrl) {
      Linking.openURL(resumeUrl);
    } else {
      Alert.alert('No CV', 'No CV file available for this application');
    }
  };

  const renderApplicationItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.applicationCard}>
      <View style={styles.applicationContent}>
        <View style={styles.submissionDateSection}>
          <Text style={styles.sectionTitle}>Submission Date:</Text>
          <Text style={styles.applicationDate}>
            {formatDateTimeVN(item.submittedAt)}
          </Text>
        </View>

        <View style={styles.coverLetterSection}>
          <Text style={styles.sectionTitle}>Cover Letter:</Text>
          <Text style={styles.coverLetterText}>
            {item.coverLetter || 'No cover letter provided'}
          </Text>
        </View>

        <View style={styles.cvSection}>
          <Text style={styles.sectionTitle}>CV:</Text>
          <TouchableOpacity
            style={styles.viewCvButton}
            onPress={() => handleViewCV(item.resumeUrl)}
          >
            <MaterialIcons name="visibility" size={20} color="#1967d2" />
            <Text style={styles.viewCvText}>View CV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

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

  const renderModal = () => {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cover Letter</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false);
                  setModalContent('');
                }}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalBodyText}>{modalContent}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderCandidate />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1967d2" />
          <Text style={styles.loadingText}>Loading applications...</Text>
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
          <Text style={styles.title}>Applied jobs!</Text>
          <Text style={styles.subtitle}>All times you applied for this job</Text>
        </View>



        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={24} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="work-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>You haven't applied for this job yet.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={paginatedApplications}
              renderItem={renderApplicationItem}
              keyExtractor={(item) => item.applicationId.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
            
            {renderPagination()}
          </>
        )}
      </ScrollView>

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  submissionDateSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  applicationDate: {
    fontSize: 16,
    color: '#555',
    fontWeight: '400',
    marginLeft: 4,
  },
  applicationContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  coverLetterText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  cvSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  viewCvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewCvText: {
    color: '#1967d2',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 32,
    paddingHorizontal: 20,
  },
  paginationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationButtonActive: {
    backgroundColor: '#1967d2',
    shadowColor: '#1967d2',
    shadowOpacity: 0.3,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  paginationTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  modalBodyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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

export default ApplyCVDetailScreen; 