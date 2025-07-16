import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import companyService from '../../services/companyService';
import HeaderCandidates from '../../components/HeaderCandidate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../constants/api';

const CompanyListScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const companies = await companyService.filterCompanies();
        setCompanies(Array.isArray(companies) ? companies : []);
      } catch (err) {
        setError(err?.message || 'Unable to load company list.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const renderCompanyCard = ({ item, index }) => {
    const logoUrl = item.urlCompanyLogo
      ? (item.urlCompanyLogo.startsWith('http') ? item.urlCompanyLogo : `${BASE_URL}${item.urlCompanyLogo}`)
      : null;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={{ marginBottom: 18 }}
        onPress={() => { /* Xử lý khi nhấn vào company */ }}
      >
        <View style={styles.companyCard}>
         
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image
              source={logoUrl ? { uri: logoUrl } : require('../../images/jobfinder-logo.png')}
              style={styles.companyLogo}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.companyTitle}>{item.companyName || item.name}</Text>
              {/* Industry + Team size trên cùng một hàng */}
              {(item.industryName || item.teamSize) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  {item.industryName && (
                    <View style={styles.industryTag}>
                      <MaterialIcons name="business-center" size={16} color="#1ca97c" style={{ marginRight: 4 }} />
                      <Text style={styles.industryTagText}>{item.industryName}</Text>
                    </View>
                  )}
                  {item.teamSize && (
                    <View style={styles.sizeTag}>
                      <MaterialIcons name="group" size={16} color="#888" style={{ marginRight: 4 }} />
                      <Text style={styles.sizeTagText}>{item.teamSize}</Text>
                    </View>
                  )}
                </View>
              )}
              {/* Location tag */}
              {item.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={styles.locationTag}>
                    <MaterialIcons name="place" size={16} color="#2563eb" style={{ marginRight: 4 }} />
                    <Text style={styles.locationTagText}>{item.location}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: '#f8f9fb'}}>
        <HeaderCandidates />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading company list...</Text>
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
        <Text style={styles.bannerTitle}>Find Companies</Text>
      </View>
      {/* Filter & Sort (placeholder, có thể mở rộng sau) */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialIcons name="filter-list" size={22} color="#2563eb" />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
        <Text style={styles.totalCompanyText}>Show <Text style={{ fontWeight: 'bold' }}>{companies.length}</Text> companies</Text>
      </View>
      <View style={styles.sortRow}>
        <View style={styles.sortDropdown}></View>
      </View>
      {/* Company List - only this part scrolls */}
      <View style={{ flex: 1 }}>
        {companies.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No companies found.</Text>
        ) : (
          <FlatList
            data={companies}
            keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
            renderItem={renderCompanyCard}
            contentContainerStyle={styles.companyListWrap}
            showsVerticalScrollIndicator={false}
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
  totalCompanyText: {
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
  companyListWrap: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  companyCard: {
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
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f7fd',
  },
  companyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  industryTag: {
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
  industryTagText: {
    color: '#1ca97c',
    fontSize: 11, // nhỏ hơn
    fontWeight: '600',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6edfa',
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 6,
    marginRight: 4,
    minHeight: 20,
    maxWidth: '70%',
  },
  locationTagText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  sizeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7fd',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 6,
    marginRight: 8, // tăng khoảng cách nếu có nhiều tag
    minHeight: 18,
    maxWidth: '70%',
  },
  sizeTagText: {
    color: '#888',
    fontSize: 11, // nhỏ hơn
    fontWeight: '600',
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
});

export default CompanyListScreen; 