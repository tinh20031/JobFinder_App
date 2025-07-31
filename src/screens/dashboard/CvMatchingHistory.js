import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Image
} from 'react-native';
import { cvMatchingService } from '../../services/cvMatchingService';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderDetail from '../../components/HeaderDetail';

const { width } = Dimensions.get('window');

const CvMatchingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await cvMatchingService.getMyTryMatchHistory();
      setHistory(response || []);
    } catch (error) {
      Alert.alert('Error', 'Cannot load CV matching history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
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

  const handleViewDetail = (record) => {
    // Lấy tryMatchId giống như web component
    const tryMatchId = record.tryMatchId || record.tryMatchID || record.id;
    console.log('Navigating to detail with tryMatchId:', tryMatchId);
    navigation.navigate('TryMatchDetail', { tryMatchId });
  };

  const renderHistoryItem = ({ item }) => {
    const score = Math.round(item.similarityScore || 0);
    const scoreColor = getScoreColor(score);
    
    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleViewDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.historyRow}>
          <View style={styles.historyLeft}>
                         <Text style={styles.jobTitle}>
               {item.job?.title || item.jobTitle || 'No title'}
             </Text>
            <Text style={styles.date}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.historyRight}>
            {item.status === "Processing" ? (
              <View style={styles.scoreProcessing}>
                <ActivityIndicator size="small" color="#2563eb" />
                                 <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : item.status === "Failed" ? (
              <View style={styles.scoreFailed}>
                <Icon name="error" size={16} color="#c62828" />
                                 <Text style={styles.failedText}>Failed</Text>
              </View>
            ) : (
              <View style={styles.scoreCompleted}>
                                 <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                   <Text style={styles.scoreNumber}>{score}%</Text>
                 </View>
              </View>
            )}
            
            <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search" size={48} color="#dee2e6" />
             <Text style={styles.emptyTitle}>No CV matching history</Text>
       <Text style={styles.emptyDescription}>
         You haven't tried matching CV with any job yet. Try it now!
       </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
                 <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderDetail />
      
      <Text style={styles.titleText}>CV Match History</Text>
      
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => (item.tryMatchId || item.tryMatchID || item.id).toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#6c757d',
  },
  scoreCompleted: {
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBadge: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scoreProcessing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  processingText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreFailed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  failedText: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusProcessing: {
    backgroundColor: '#e3f2fd',
  },
  statusFailed: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusProcessing: {
    backgroundColor: '#e3f2fd',
  },
  statusFailed: {
    backgroundColor: '#ffebee',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default CvMatchingHistory; 