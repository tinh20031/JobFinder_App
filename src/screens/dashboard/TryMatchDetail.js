import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  Linking
} from 'react-native';
import { cvMatchingService } from '../../services/cvMatchingService';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderDetail from '../../components/HeaderDetail';

const { width } = Dimensions.get('window');

const TryMatchDetail = () => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { tryMatchId } = route.params;

  useEffect(() => {
    fetchDetail();
  }, [tryMatchId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching detail for tryMatchId:', tryMatchId);
      
      if (!tryMatchId) {
        throw new Error('No tryMatchId provided');
      }
      
      const response = await cvMatchingService.getTryMatchDetail(tryMatchId);
      console.log('API Response:', response);
      
      // Xử lý response giống như web
      const result = response.data || response.Data || response.result || response;
      if (response.success || response.Success) {
        console.log('Setting detail data:', result);
        setDetail(result);
      } else {
        throw new Error(response.errorMessage || response.ErrorMessage || "Not found");
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
      
      // Fallback: Hiển thị dữ liệu mẫu để test UI
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('Using fallback data for testing');
        setDetail({
          id: tryMatchId,
          jobTitle: "Frontend Developer (React)",
          status: "Completed",
          similarityScore: 75,
          createdAt: new Date().toISOString(),
          suggestions: [
            "Revise your **description** to better align with the job's requirements.",
            "Update your **education** details to better reflect the job's qualifications.",
            "Tailor your **CV** to improve overall alignment with the job's requirements."
          ],
          cvFileUrl: "https://example.com/cv.pdf",
          jobId: 1,
          job: {
            id: 1,
            title: "Frontend Developer (React)",
            company: {
              name: "TechCorp Inc."
            },
            location: "Ho Chi Minh City"
          }
        });
      } else {
        Alert.alert(
          'Error', 
          `Cannot load CV matching detail: ${error.message || 'Unknown error'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "#28a745";
    if (status === "Processing") return "#2563eb";
    if (status === "Failed") return "#dc3545";
    return "#888";
  };



  const handleViewCV = () => {
    if (detail?.cvFileUrl) {
      Linking.openURL(detail.cvFileUrl);
    }
  };

  const handleViewJob = () => {
    if (detail?.jobId) {
      // Navigate to job detail screen
      navigation.navigate('JobDetail', { jobId: detail.jobId });
    }
  };

  const renderHeader = () => {
    if (!detail) return null;

    return (
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={styles.jobTitle}>
            {detail.jobTitle || detail.job?.title || detail.jobTitle || "Job"}
          </Text>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: getStatusColor(detail.status) === "#28a745" ? "#e6f9ea" : 
                             getStatusColor(detail.status) === "#2563eb" ? "#e3f2fd" : "#ffebee" 
            }
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(detail.status) }]}>
              {detail.status || "Unknown"}
            </Text>
          </View>
        </View>
        
        <Text style={styles.metaText}>
          Matched at: {detail.createdAt ? formatDate(detail.createdAt) : "-"}
        </Text>
      </View>
    );
  };

  const renderScoreSection = () => {
    if (!detail || detail.similarityScore === null || detail.similarityScore === undefined) return null;
    
    const score = Math.round(detail.similarityScore);
    const scoreColor = score >= 50 ? '#28a745' : '#e53935';

    return (
      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>Similarity Score</Text>
        <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreNumber}>{score}</Text>
        </View>
      </View>
    );
  };

  const renderErrorSection = () => {
    if (detail?.status !== "Failed") return null;

    return (
      <View style={styles.errorSection}>
        <Icon name="error" size={20} color="#dc3545" />
        <Text style={styles.errorText}>{detail.errorMessage || "Processing failed."}</Text>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!detail?.suggestions || detail.suggestions.length === 0) return null;

    const renderBoldText = (text) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <Text key={index} style={[styles.suggestionText, styles.boldText]}>
              {boldText}
            </Text>
          );
        }
        return (
          <Text key={index} style={styles.suggestionText}>
            {part}
          </Text>
        );
      });
    };

    return (
      <View style={styles.suggestionsSection}>
        <Text style={styles.suggestionsTitle}>Suggestions</Text>
        <View style={styles.suggestionsList}>
          {detail.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Icon name="lightbulb" size={16} color="#ffc107" />
              <View style={styles.suggestionTextContainer}>
                {renderBoldText(suggestion)}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtons}>
        {detail?.cvFileUrl && (
          <TouchableOpacity style={styles.actionButton} onPress={handleViewCV}>
            <Text style={styles.actionButtonText}>View CV</Text>
          </TouchableOpacity>
        )}
        {detail?.jobId && (
          <TouchableOpacity style={styles.actionButton} onPress={handleViewJob}>
            <Text style={styles.actionButtonText}>View Job</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#dc3545" />
        <Text style={styles.errorTitle}>No detail found for this try-match record.</Text>
        <Text style={styles.errorDescription}>
          TryMatchId: {tryMatchId || 'Not provided'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchDetail}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderDetail />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderScoreSection()}
        {renderErrorSection()}
        {renderSuggestions()}
        {renderActionButtons()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  scoreSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  scoreCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  errorSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorText: {
    marginLeft: 6,
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionsSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2563eb',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
  },
  suggestionTextContainer: {
    marginLeft: 8,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafd',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafd',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TryMatchDetail; 