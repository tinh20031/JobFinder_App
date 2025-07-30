import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import companyService from '../../services/companyService';
import HeaderCandidates from '../../components/HeaderCandidate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../constants/api';
import * as Animatable from 'react-native-animatable';

const CompanyListScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

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
        style={{ marginBottom: 24 }}
        onPress={() => navigation.navigate('CompanyDetail', { companyId: item.userId })}
      >
        <Animatable.View animation="fadeInUp" duration={600} delay={index * 100}>
        <View style={styles.companyCard}>
          {/* Hàng trên: logo + company name + location (location dưới company name) */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={logoUrl ? { uri: logoUrl } : require('../../images/jobfinder-logo.png')}
              style={styles.companyLogo}
            />
            <View style={{ marginLeft: 10, justifyContent: 'center' }}>
              <Text style={styles.companyTitle}>{item.companyName || item.name}</Text>
              {item.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <MaterialIcons name="place" size={16} color="#222" style={{ marginRight: 2 }} />
                  <Text style={styles.locationTagText}>{item.location}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {/* Hàng dưới: industry + team size, thẳng hàng với logo */}
          {(item.industryName || item.teamSize) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 0 }}>
              {item.industryName && (
                <View style={styles.industryTagLarge}>
                  <MaterialIcons name="business-center" size={14} color="#1ca97c" style={{ marginRight: 6 }} />
                  <Text style={styles.industryTagTextLarge}>{item.industryName}</Text>
                </View>
              )}
              {item.teamSize && (
                <View style={styles.sizeTagLarge}>
                  <MaterialIcons name="group" size={14} color="#888" style={{ marginRight: 6 }} />
                  <Text style={styles.sizeTagTextLarge}>{item.teamSize}</Text>
                </View>
              )}
            </View>
          )}
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
    <View style={{ flex: 1, backgroundColor: '#f3f7fd' }}>
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
            keyExtractor={(item, idx) => item.userId?.toString() || idx.toString()}
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
    position: 'relative',
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 12,
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
    marginRight: 30, // tăng khoảng cách giữa các tag
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
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 0,
    minHeight: undefined,
    maxWidth: '100%',
  },
  locationTagText: {
    color: '#222',
    fontSize: 13,
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
  // Thêm style mới cho tag lớn
  industryTagLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ec',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 18,
    minHeight: undefined,
    maxWidth: '80%',
  },
  industryTagTextLarge: {
    color: '#1ca97c',
    fontSize: 13,
    fontWeight: '600',
  },
  sizeTagLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7fd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 0,
    minHeight: undefined,
    maxWidth: '80%',
  },
  sizeTagTextLarge: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CompanyListScreen; 