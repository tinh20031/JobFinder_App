import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { JobService } from '../../services/JobService';
import HeaderCandidates from '../../components/HeaderCandidate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient'; // Nếu muốn dùng gradient thực sự, cần cài expo-linear-gradient
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const JobListScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('default');
  const navigation = useNavigation();

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
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}>
        <Animatable.View animation="fadeInUp" duration={600} delay={index * 100}>
          <View style={styles.jobCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Logo */}
              {item.logo && (
                <Image source={{ uri: item.logo }} style={styles.logoCircle} />
              )}
              {/* Thông tin bên phải logo */}
              <View style={{ flex: 1, marginLeft: 5 }}>
                <Text style={styles.jobTitle}>{item.jobTitle || 'Job Title'}</Text>
                <Text style={styles.jobCompany}>{item.company?.companyName || 'Unknown Company'}</Text>
              </View>
            </View>
            {/* Salary dưới logo */}
            <Text style={[styles.jobSalary, { marginTop: 12, marginLeft: item.logo ? 5 : 0 }]}> {/* 56 = logo width (44) + marginRight (12) */}
              <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>{salaryText}</Text>
            </Text>
            {/* Tags Row */}
            <View style={styles.jobTagsRow}>
              {item.jobType && (
                <View style={styles.jobTag}>
                  <Text style={styles.jobTagText}>{typeof item.jobType === 'object' ? item.jobType.jobTypeName : item.jobType}</Text>
                </View>
              )}
              {item.industry && (
                <View style={styles.jobTag}>
                  <Text style={styles.jobTagText}>{typeof item.industry === 'object' ? item.industry.industryName : item.industry}</Text>
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
    <View style={{ flex: 1, backgroundColor: '#f3f7fd' }}>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 24, // tăng khoảng cách giữa các card
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 2, // thêm viền
    borderColor: '#e6edfa', // màu xanh nhạt
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
    color: '#222', // màu chữ bình thường
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
  // Figma card styles
  figmaCardWrap: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e6edfa',
  },
  figmaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  figmaLogoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede7fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  figmaLogoImg: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    borderRadius: 16,
  },
  figmaBookmarkBtn: {
    padding: 4,
  },
  figmaJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  figmaCompanyLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  figmaSalaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  figmaSalary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 2,
  },
  figmaSalaryUnit: {
    fontSize: 15,
    color: '#bbb',
    marginBottom: 2,
  },
  figmaTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  figmaTag: {
    backgroundColor: '#f3f7fd',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  figmaTagText: {
    color: '#222',
    fontSize: 13,
    fontWeight: '500',
  },
  figmaApplyBtn: {
    backgroundColor: '#ffe6df',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginLeft: 8,
  },
  figmaApplyText: {
    color: '#ff855d',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  salaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 2,
  },
  salaryUnit: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tag: {
    backgroundColor: '#f3f7fd',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  tagText: {
    color: '#222',
    fontSize: 13,
    fontWeight: '500',
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb', // màu xanh đậm
    marginLeft: 8,
  },
  jobTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  jobTag: {
    backgroundColor: '#F2F2F2', // màu xám nhạt
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  jobTagText: {
    color: '#222',
    fontSize: 13,
    fontWeight: '500',
  },
  jobApply: {
    backgroundColor: '#FF9900', // màu cam
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginLeft: 70,
  },
  jobApplyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default JobListScreen;
