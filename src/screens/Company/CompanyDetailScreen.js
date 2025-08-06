import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import companyService from '../../services/companyService';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import HeaderDetail from '../../components/HeaderDetail';
import * as Animatable from 'react-native-animatable';

const CompanyDetailScreen = ({ route }) => {
  const { companyId } = route?.params || {};
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        setLoading(false);
        setError('Company ID is missing.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await companyService.getCompanyDetail(companyId);
        setCompany(data);
      } catch (err) {
        setError('Failed to load company data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>Company not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderDetail />
      <Animatable.View animation="fadeInUp" duration={600} delay={0}>
        <View style={[styles.coverContainer, { width, height: width * 0.45 }]}> {/* height tỉ lệ 1:2.85, to hơn */}
          <Image
            source={{ uri: company.imageLogoLgr }}
            style={[styles.coverImage, { width, height: width * 0.45, resizeMode: 'contain', backgroundColor: '#fff' }]}
          />
        </View>
      </Animatable.View>
      <Animatable.View animation="fadeInUp" duration={600} delay={150}>
        <View style={styles.infoCard}>
        <View style={styles.logoWrapper}>
          <Image source={{ uri: company.urlCompanyLogo }} style={styles.logo} />
      </View>
      <Text style={styles.companyName}>{company.companyName}</Text>
      <View style={styles.tagsContainer}>
        {company.industryName ? (
          <View style={styles.industryTag}>
            <MaterialIcons name="business-center" size={16} color="#1ca97c" />
            <Text style={styles.industryTagText}>{company.industryName}</Text>
          </View>
        ) : null}
      </View>
        </View>
      </Animatable.View>
      <Animatable.View animation="fadeInUp" duration={600} delay={300}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="add" size={20} color="#FF4D4F" style={{ marginRight: 6 }} />
            <Text style={styles.actionText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => company.website && Linking.openURL(`https://${company.website}`)}>
            <MaterialIcons name="open-in-new" size={20} color="#FF4D4F" style={{ marginRight: 6 }} />
            <Text style={styles.actionText}>Visit website</Text>
            </TouchableOpacity>
        </View>
      </Animatable.View>
      <Animatable.View animation="fadeInUp" duration={600} delay={450}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>About Company</Text>
        {company.companyProfileDescription ? (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <RenderHTML
              contentWidth={width - 40}
              source={{ html: company.companyProfileDescription }}
              baseStyle={{ fontSize: 15, color: '#444', lineHeight: 25 }}
              tagsStyles={{
                p: { marginBottom: 18, lineHeight: 25 },
                ul: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                ol: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                li: { marginBottom: 10, lineHeight: 25 },
                h1: { marginBottom: 20, fontSize: 22, fontFamily: 'Poppins-Bold' },
                h2: { marginBottom: 18, fontSize: 20, fontFamily: 'Poppins-Bold' },
                h3: { marginBottom: 16, fontSize: 18, fontFamily: 'Poppins-Bold' },
                img: { marginVertical: 16, borderRadius: 10 },
                strong: { fontFamily: 'Poppins-Bold' },
                b: { fontFamily: 'Poppins-Bold' },
              }}
            />
          </View>
        ) : null}
      </Animatable.View>
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <View style={styles.blackDivider} />
        <View style={styles.companyCard}>
          {company.companyName ? (
            <View style={styles.infoRowCard}>
              <Text style={styles.infoLabelCard}>Company name:</Text>
              <Text style={styles.infoValueCard}>{company.companyName}</Text>
            </View>
          ) : null}
          {company.industryName ? (
            <View style={styles.infoRowCard}>
              <Text style={styles.infoLabelCard}>Industry:</Text>
              <Text style={styles.infoValueCard}>{company.industryName}</Text>
            </View>
          ) : null}
          {company.location ? (
            <View style={styles.infoRowCard}>
              <Text style={styles.infoLabelCard}>Location:</Text>
              <Text style={styles.infoValueCard}>{company.location}</Text>
            </View>
          ) : null}
          {company.teamSize ? (
            <View style={styles.infoRowCard}>
              <Text style={styles.infoLabelCard}>Company size:</Text>
              <Text style={styles.infoValueCard}>{company.teamSize}</Text>
          </View>
        ) : null}
        {company.contact ? (
            <View style={styles.infoRowCard}>
              <Text style={styles.infoLabelCard}>Contact:</Text>
              <Text style={styles.infoValueCard}>{company.contact}</Text>
          </View>
        ) : null}
      </View>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  coverContainer: {
    // width và height sẽ được set động bằng useWindowDimensions
    backgroundColor: '#eee',
    position: 'relative',
    marginBottom: 50,
  },
  coverImage: {
    // width và height sẽ được set động, bỏ width: '100%', height: '100%'
  },
  logoWrapper: {
    marginTop: -140,
    marginBottom: 0,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 3,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 72,
  },
  companyName: {
    marginTop: 10,
    fontSize: 24,
    textAlign: 'center', // Căn giữa tên công ty
    color: '#191970',
    fontFamily: 'Poppins-Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12, // Tăng khoảng cách
    justifyContent: 'center', // Căn giữa các tag
    gap: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 20, // Thêm padding để tag không bị sát viền
  },
  industryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ec',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  industryTagText: {
    color: '#1ca97c',
    fontSize: 14,
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  tag: {
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5, // Tăng padding cho tag
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#2563eb',
    fontFamily: 'Poppins-Medium',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#222',
    marginHorizontal: 18,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 20,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  aboutText: {
    fontSize: 15,
    color: '#444',
    marginHorizontal: 20,
    marginBottom: 20, // Giảm margin bottom để gần hơn với phần dưới
    fontFamily: 'Poppins-Regular',
  },
  additionalInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12, // Tăng khoảng cách
  },
  infoLabel: {
    color: '#222',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  infoValue: {
    color: '#2563eb',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Regular',
  },
  infoCard: {
    backgroundColor: '#F2F2F2',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    marginTop: -40,
    marginHorizontal: 0,
    zIndex: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginHorizontal: 6,
  },
  actionText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  companyCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoLabelCard: {
    color: '#222',
    fontSize: 15,
    flex: 1.2,
    fontFamily: 'Poppins-Bold',
  },
  infoValueCard: {
    color: '#444',
    fontSize: 15,
    flex: 1.5,
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
  },
  blackDivider: {
    height: 1.5,
    backgroundColor: '#222',
    marginHorizontal: 18,
    marginBottom: 0,
  },
});

export default CompanyDetailScreen; 