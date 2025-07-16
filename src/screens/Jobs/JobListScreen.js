import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { JobService } from '../../services/JobService';
import HeaderCandidates from '../../components/HeaderCandidate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient'; // Nếu muốn dùng gradient thực sự, cần cài expo-linear-gradient

const JobListScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await JobService.getJobs();
        setJobs(data);
      } catch (err) {
        setError('Failed to load job list.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const renderJobCard = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ marginBottom: 18 }}
      onPress={() => { /* Xử lý khi nhấn vào job */ }}
    >
      {/* Có thể dùng LinearGradient ở đây nếu muốn nổi bật hơn */}
      {/*
      <LinearGradient
        colors={['#f8f9fb', '#e6edfa']}
        style={styles.jobCard}
      >
      */}
      <View style={styles.jobCard}>
        {/* Badge 'Mới' cho job đầu tiên */}
        {index === 0 && (
          <View style={styles.badgeNew}>
            <Text style={styles.badgeNewText}>New</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Image source={{ uri: item.logo }} style={styles.jobLogo} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            {/* Company tag trên 1 dòng */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View style={styles.companyTag}>
                <MaterialIcons name="business" size={16} color="#1ca97c" style={{ marginRight: 4 }} />
                <Text style={styles.companyTagText}>{item.company?.companyName || 'Không rõ công ty'}</Text>
              </View>
            </View>
            {/* Province tag xuống dòng riêng */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={styles.provinceTag}>
                <MaterialIcons name="place" size={16} color="#2563eb" style={{ marginRight: 4 }} />
                <Text style={styles.provinceTagText}>{item.provinceName || item.location}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {item.tags?.map((tag, idx) => (
            <View key={idx} style={[styles.tag, tag.color && { backgroundColor: tag.color }]}> 
              <Text style={[styles.tagText, tag.color && { color: '#222' }]}>{tag.label}</Text>
            </View>
          ))}
        </View>
      </View>
      {/*</LinearGradient>*/}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
        <HeaderCandidates />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading job list...</Text>
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
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fb' }}>
      <HeaderCandidates />
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Find Jobs</Text>
      </View>
      {/* Filter & Sort */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialIcons name="filter-list" size={22} color="#2563eb" />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
        <Text style={styles.totalJobText}>Show <Text style={{ fontWeight: 'bold' }}>{jobs.length}</Text> jobs</Text>
      </View>
      <View style={styles.sortRow}>
        <View style={styles.sortDropdown}>
          {/* Có thể thêm sort text ở đây nếu muốn */}
        </View>
      </View>
      {/* Job List - only this part scrolls */}
      <View style={{ flex: 1 }}>
        {jobs.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No jobs found.</Text>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
            renderItem={renderJobCard}
            contentContainerStyle={styles.jobListWrap}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
  },
  jobItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  salary: {
    fontSize: 15,
    color: '#28a745',
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
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  breadcrumb: {
    color: '#888',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fe',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  filterBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  totalJobText: {
    color: '#444',
    fontSize: 15,
  },
  sortRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7fd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sortText: {
    color: '#444',
    fontSize: 15,
    marginRight: 8,
  },
  jobListWrap: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    // marginBottom: 18, // Đã chuyển ra ngoài TouchableOpacity
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e6edfa',
    position: 'relative',
    // Hiệu ứng nhấn sẽ đổi màu nền nhẹ (xử lý ở TouchableOpacity)
  },
  badgeNew: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    zIndex: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeNewText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  jobLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f7fd',
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  jobCompany: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 4,
    marginRight: 8,
  },
  jobLocation: {
    fontSize: 14,
    color: '#888',
    marginLeft: 2,
  },
  tag: {
    backgroundColor: '#e7f0fe',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: 'bold',
  },
  companyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ec',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 6,
    marginRight: 8, // tăng khoảng cách giữa các tag
    minHeight: 18,
    maxWidth: '70%',
  },
  companyTagText: {
    color: '#1ca97c',
    fontSize: 11, // nhỏ hơn
    fontWeight: '600',
  },
  provinceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6edfa',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 6,
    marginRight: 8, // tăng khoảng cách giữa các tag
    minHeight: 18,
    maxWidth: '70%',
  },
  provinceTagText: {
    color: '#2563eb',
    fontSize: 11, // nhỏ hơn
    fontWeight: '600',
  },
});

export default JobListScreen;
