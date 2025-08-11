import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HeaderCandidates from '../../components/HeaderDetail';
import { JobService } from '../../services/JobService';
import * as favoriteJobService from '../../services/favoriteJobService';
import companyService from '../../services/companyService';
import { authService } from '../../services/authService';

import JobCard from '../Jobs/JobCard';
import CompanyCard from '../Company/CompanyCard';

const FavoriteJobDetailScreen = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'companies'

  // Jobs state
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [favoriteJobIds, setFavoriteJobIds] = useState(new Set());
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  // Companies state
  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [favoriteCompanyIds, setFavoriteCompanyIds] = useState(new Set());
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  // Helpers
  const getCompanyId = useCallback((company) => company?.userId ?? company?.companyId ?? company?.id ?? company?.idCompany ?? company?.companyProfileId, []);

  const fetchFavoriteJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobsError('');

      const userId = await authService.getUserId();
      if (!userId) {
        setJobsError('You need to log in to view saved jobs.');
        setFavoriteJobs([]);
        setFavoriteJobIds(new Set());
        return;
      }

      const favoritesResponse = await favoriteJobService.getUserFavorites(userId);

      let favorites = [];
      if (Array.isArray(favoritesResponse)) {
        favorites = favoritesResponse;
      } else if (favoritesResponse && Array.isArray(favoritesResponse.data)) {
        favorites = favoritesResponse.data;
      } else if (favoritesResponse && favoritesResponse.favorites) {
        favorites = favoritesResponse.favorites;
      }

      const jobIds = (favorites || [])
        .map((fav) => fav.jobId || fav.JobId || fav.job_id || fav.jobID || fav.JobID)
        .filter((id) => id != null)
        .map((id) => String(id));

      if (jobIds.length === 0) {
        setFavoriteJobs([]);
        setFavoriteJobIds(new Set());
        return;
      }

      const allJobs = await JobService.getJobs();
      const filtered = allJobs.filter((job) => jobIds.includes(String(job.id)) || jobIds.includes(String(job.jobId)));
      setFavoriteJobs(filtered);
      setFavoriteJobIds(new Set(filtered.map((j) => String(j.id))));
    } catch (err) {
      setJobsError('Failed to load saved jobs.');
      setFavoriteJobs([]);
      setFavoriteJobIds(new Set());
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchFavoriteCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError('');
      const list = await companyService.getFavoriteCompanies();
      const normalized = Array.isArray(list) ? list : [];
      setFavoriteCompanies(normalized);
      const ids = new Set(
        normalized
          .map((c) => getCompanyId(c))
          .filter((v) => v != null)
          .map((v) => String(v))
      );
      setFavoriteCompanyIds(ids);
    } catch (err) {
      setCompaniesError('Failed to load saved companies.');
      setFavoriteCompanies([]);
      setFavoriteCompanyIds(new Set());
    } finally {
      setCompaniesLoading(false);
    }
  }, [getCompanyId]);

  useEffect(() => {
    fetchFavoriteJobs();
    fetchFavoriteCompanies();
  }, [fetchFavoriteJobs, fetchFavoriteCompanies]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'jobs') {
        await fetchFavoriteJobs();
      } else {
        await fetchFavoriteCompanies();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Actions
  const handleJobBookmark = async (jobId) => {
    try {
      const userId = await authService.getUserId();
      if (!userId) {
        Alert.alert('Error', 'Please log in to manage saved items.');
        return;
      }
      await favoriteJobService.removeFavoriteJob(userId, jobId);
      setFavoriteJobs((prev) => prev.filter((j) => String(j.id) !== String(jobId)));
      setFavoriteJobIds((prev) => {
        const next = new Set(prev);
        next.delete(String(jobId));
        return next;
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to remove saved job.');
    }
  };

  const handleCompanyBookmark = async (companyId) => {
    try {
      await companyService.unfavoriteCompany(companyId);
      setFavoriteCompanies((prev) => prev.filter((c) => String(getCompanyId(c)) !== String(companyId)));
      setFavoriteCompanyIds((prev) => {
        const next = new Set(prev);
        next.delete(String(companyId));
        return next;
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to remove saved company.');
    }
  };

  // Renderers
  const renderJobCard = ({ item, index }) => (
    <JobCard
      item={item}
      index={index}
      favoriteJobs={favoriteJobIds}
      onBookmarkPress={handleJobBookmark}
      showAnimation={true}
      animationDelay={100}
    />
  );

  const renderCompanyCard = ({ item, index }) => (
    <CompanyCard
      item={item}
      index={index}
      favoriteCompanies={favoriteCompanyIds}
      onBookmarkPress={(id) => handleCompanyBookmark(id)}
      showAnimation={true}
      animationDelay={100}
    />
  );

  // UI branches per tab
  const renderContent = () => {
    if (activeTab === 'jobs') {
      if (jobsLoading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading saved jobs...</Text>
          </View>
        );
      }
      if (jobsError) {
        return (
          <View style={styles.center}>
            <Text style={styles.error}>{jobsError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchFavoriteJobs}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (favoriteJobs.length === 0) {
        return (
          <View style={styles.emptyState}>
            <MaterialIcons name="bookmark-border" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No saved jobs yet</Text>
            <Text style={styles.emptySubtitle}>Browse jobs and tap the save icon to add them here.</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() =>
                navigation.navigate('MainTab', {
                  screen: 'Explore',
                  params: { initialTab: 'jobs' },
                })
              }
            >
              <Text style={styles.browseBtnText}>Browse jobs</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <FlatList
          data={favoriteJobs}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderJobCard}
          contentContainerStyle={styles.listWrap}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      );
    }

    // companies tab
    if (companiesLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading saved companies...</Text>
        </View>
      );
    }
    if (companiesError) {
      return (
          <View style={styles.center}>
          <Text style={styles.error}>{companiesError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchFavoriteCompanies}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (favoriteCompanies.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="bookmark-border" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No saved companies yet</Text>
          <Text style={styles.emptySubtitle}>Browse companies and tap save to follow them.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() =>
              navigation.navigate('MainTab', {
                screen: 'Explore',
                params: { initialTab: 'companies' },
              })
            }
          > 
            <Text style={styles.browseBtnText}>Browse companies</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={favoriteCompanies}
        keyExtractor={(item, idx) => (getCompanyId(item)?.toString() || idx.toString())}
        renderItem={renderCompanyCard}
        contentContainerStyle={styles.listWrap}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderCandidates />

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Favorites</Text>
        <Text style={styles.bannerSubtitle}>Jobs and companies you have saved</Text>
      </View>

      {/* Tabs (similar style to ExploreScreen) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'jobs' && styles.activeTab]} onPress={() => setActiveTab('jobs')}>
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
          {activeTab === 'jobs' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'companies' && styles.activeTab]} onPress={() => setActiveTab('companies')}>
          <Text style={[styles.tabText, activeTab === 'companies' && styles.activeTabText]}>Companies</Text>
          {activeTab === 'companies' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeTab === 'jobs' ? favoriteJobs.length : favoriteCompanies.length}</Text>
          <Text style={styles.statLabel}>{activeTab === 'jobs' ? 'Saved Jobs' : 'Saved Companies'}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{renderContent()}</View>
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
  listWrap: {
    paddingHorizontal: 16,
    paddingBottom: 32,
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

  // Tabs styles (aligned with ExploreScreen)
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
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
  activeTab: {},
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

  loadingText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginTop: 12,
  },

});

export default FavoriteJobDetailScreen; 