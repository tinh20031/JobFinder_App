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

  // Helper function to generate logo color based on company name
  const getLogoColor = (companyName) => {
    const colors = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#be185d', '#65a30d'];
    const index = companyName.length % colors.length;
    return colors[index];
  };

  // Helper function to generate logo text (first letter of company name)
  const getLogoText = (companyName) => {
    return companyName.charAt(0).toUpperCase();
  };

  // Helper function to get company tags
  const getCompanyTags = (company) => {
    const tags = [];
    if (company.industryName) {
      tags.push(company.industryName);
    }
    if (company.teamSize) {
      tags.push(`${company.teamSize} employees`);
    }
    return tags;
  };

  const handleCompanyBookmark = (companyId) => {
    // Handle company bookmark logic
    console.log('Company bookmarked:', companyId);
  };

  const renderCompanyCard = ({ item, index }) => {
    const logoUrl = item.urlCompanyLogo
      ? (item.urlCompanyLogo.startsWith('http') ? item.urlCompanyLogo : `${BASE_URL}${item.urlCompanyLogo}`)
      : null;
    const tags = getCompanyTags(item);
    const logoColor = getLogoColor(item.companyName || item.name || 'Unknown');
    const logoText = getLogoText(item.companyName || item.name || 'Unknown');

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CompanyDetail', { companyId: item.userId })}
      >
        <Animatable.View animation="fadeInUp" duration={600} delay={index * 100}>
          <View style={styles.newCompanyCard}>
            <View style={styles.companyCardHeader}>
              <View style={styles.companyInfoSection}>
                {logoUrl ? (
                  <Image 
                    source={{ uri: logoUrl }}
                    style={[styles.companyLogo, { backgroundColor: '#fff' }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.companyLogo, { backgroundColor: logoColor }]}>
                    <Text style={styles.companyLogoText}>{logoText}</Text>
                  </View>
                )}
                <View style={styles.companyTextSection}>
                  <Text style={styles.companyTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.companyName || item.name || 'Unknown Company'}
                  </Text>
                  <Text style={styles.companyIndustry}>
                    {item.industryName || 'Unknown Industry'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.bookmarkButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  handleCompanyBookmark(item.userId);
                }}
              >
                <MaterialIcons name="bookmark-border" size={28} color="#0070BA" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.companyLocation}>
              <Text style={styles.locationText}>
                {item.location || 'Unknown Location'}
              </Text>
            </View>
            
            <View style={styles.companyTags}>
              {tags.map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.companyTag}>
                  <Text style={styles.companyTagText}>{tag}</Text>
                </View>
              ))}
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
    paddingBottom: 100, // Tăng padding để tránh bottom navigation
  },
  // New Company Card Styles (from HomeScreen)
  newCompanyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  companyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  companyInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyTextSection: {
    marginLeft: 12,
    flex: 1,
    paddingLeft: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 6,
    marginBottom: 8,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoText: {
    color: '#2563eb',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  bookmarkButton: {
    padding: 4,
  },
  companyTitle: {
    fontSize: 20,
    color: '#000',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  companyIndustry: {
    fontSize: 15,
    color: '#666',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },
  companyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 68,
  },
  locationText: {
    fontSize: 16, 
    color: '#666',
    marginLeft: 0,
    fontFamily: 'Poppins-Regular',
  },
  companyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 68,
    marginTop: 8,
  },
  companyTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  companyTagText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  // Old Company Card Styles (keeping for reference)
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
  // Old company logo and title styles (removed to avoid conflicts)
  // companyLogo: {
  //   width: 44,
  //   height: 44,
  //   borderRadius: 22,
  //   backgroundColor: '#fff',
  //   borderWidth: 1,
  //   borderColor: '#eee',
  //   marginRight: 12,
  // },
  // companyTitle: {
  //   fontSize: 17,
  //   fontWeight: 'bold',
  //   color: '#222',
  // },
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