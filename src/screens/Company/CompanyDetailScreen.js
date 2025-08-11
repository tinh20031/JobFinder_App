import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import companyService from '../../services/companyService';
import RenderHTML from 'react-native-render-html';
import HeaderDetail from '../../components/HeaderDetail';
import * as Animatable from 'react-native-animatable';

const LOG_TAG = '[CompanyDetail]';
const log = (...args) => {
  // eslint-disable-next-line no-console
  console.log(LOG_TAG, ...args);
};

const CompanyDetailScreen = ({ route }) => {
  const { companyId } = route?.params || {};
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteActionLoading, setFavoriteActionLoading] = useState(false);

  // Helper function to safely convert values to string
  const safeText = (val) => {
    if (val == null) return '';
    return String(val);
  };

  // Map thuộc tính favorite từ nhiều dạng khác nhau của backend
  const mapFavoriteFromDetail = (detail) => {
    if (!detail || typeof detail !== 'object') return null;
    const possible = [
      detail.isFavorite,
      detail.isFavorited,
      detail.favorited,
      detail.isFollowing,
      detail.following,
      detail.isFollow,
      detail.isFollowed,
    ];
    for (const v of possible) {
      if (typeof v === 'boolean') return v;
      if (v === 1 || v === 0) return Boolean(v);
      if (typeof v === 'string' && (v.toLowerCase() === 'true' || v.toLowerCase() === 'false')) {
        return v.toLowerCase() === 'true';
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchCompany = async () => {
      log('fetchCompany:start', { companyId });
      if (!companyId) {
        setLoading(false);
        setError('Company ID is missing.');
        log('fetchCompany:missing-companyId');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await companyService.getCompanyDetail(companyId);
        setCompany(data);
        // Đồng bộ trạng thái favorite ban đầu từ chi tiết công ty nếu có
        const mapped = mapFavoriteFromDetail(data);
        if (mapped !== null && !didInitFavoriteRef.current) {
          setIsFavorite(mapped);
          didInitFavoriteRef.current = true;
          log('fetchCompany:mapped-initial-favorite', { mapped });
        }
      } catch (err) {
        setError('Failed to load company data.');
        log('fetchCompany:error', err?.message || err);
      } finally {
        setLoading(false);
        log('fetchCompany:done');
      }
    };
    fetchCompany();
  }, [companyId]);

  const didInitFavoriteRef = useRef(false);
  const favoriteRequestIdRef = useRef(0);

  const refreshFavoriteStatus = useCallback(async (force = false) => {
    if (!companyId) return;
    // Chỉ sync 1 lần khi mở màn hình; chỉ fetch lại nếu force = true
    if (didInitFavoriteRef.current && !force) {
      log('refreshFavoriteStatus:skip (already inited and not forced)');
      return;
    }
    const requestId = ++favoriteRequestIdRef.current;
    setFavoriteLoading(true);
    log('refreshFavoriteStatus:start', { force, requestId });
    try {
      const list = await companyService.getFavoriteCompanies();
      // Bỏ qua kết quả cũ nếu đã có request mới hoặc đã init/force = false
      if (favoriteRequestIdRef.current !== requestId) {
        log('refreshFavoriteStatus:ignore-stale', { requestId, latest: favoriteRequestIdRef.current });
        return;
      }
      if (didInitFavoriteRef.current && !force) {
        log('refreshFavoriteStatus:ignore (already inited after await)');
        return;
      }
      const getId = (item) => item?.companyProfileId ?? item?.companyId ?? item?.id ?? item?.idCompany ?? item?.userId;
      const exists = Array.isArray(list) && list.some((x) => String(getId(x)) === String(companyId));
      setIsFavorite(Boolean(exists));
      didInitFavoriteRef.current = true;
      log('refreshFavoriteStatus:done', { exists });
    } catch (e) {
      // giữ im lặng nếu không đăng nhập hoặc lỗi mạng
      log('refreshFavoriteStatus:error', e?.message || e);
    } finally {
      setFavoriteLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    // Reset cờ khi đổi công ty để sync lần đầu cho công ty mới
    didInitFavoriteRef.current = false;
    log('effect:companyId-changed -> reset didInitFavoriteRef and refresh', { companyId });
    refreshFavoriteStatus(false);
  }, [companyId, refreshFavoriteStatus]);

  // Không refresh theo focus để tránh ghi đè UI ngay sau khi bấm

  const toggleFavorite = async () => {
    if (!companyId || favoriteActionLoading) return;
    setFavoriteActionLoading(true);
    const previousIsFavorite = isFavorite;
    log('toggleFavorite:pressed', { companyId, previousIsFavorite });
    // Cập nhật lạc quan ngay lập tức
    setIsFavorite(!previousIsFavorite);
    // Đánh dấu đã đồng bộ để bỏ qua response muộn của request khởi tạo
    didInitFavoriteRef.current = true;
    try {
      if (!previousIsFavorite) {
        const res = await companyService.favoriteCompany(companyId);
        log('toggleFavorite:favorite:success', res);
      } else {
        const res = await companyService.unfavoriteCompany(companyId);
        log('toggleFavorite:unfavorite:success', res);
      }
      // Tuỳ chọn: có thể đồng bộ lại từ server nếu cần
      // await refreshFavoriteStatus(true);
    } catch (e) {
      // Hoàn tác nếu lỗi
      setIsFavorite(previousIsFavorite);
      log('toggleFavorite:error -> revert', e?.message || e);
    } finally {
      setFavoriteActionLoading(false);
      log('toggleFavorite:done', { finalIsFavorite: !previousIsFavorite });
    }
  };

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

  if (!company || typeof company !== 'object') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>Company not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderDetail />
      {company && (
        <>
          <Animatable.View animation="fadeInUp" duration={600} delay={0}>
            <View style={[styles.coverContainer, { width, height: width * 0.45 }]}>
              <Image
                source={{ uri: safeText(company.imageLogoLgr) }}
                style={[styles.coverImage, { width, height: width * 0.45, resizeMode: 'contain', backgroundColor: '#fff' }]}
              />
            </View>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" duration={600} delay={150}>
            <View style={styles.infoCard}>
              <View style={styles.logoWrapper}>
                <Image source={{ uri: safeText(company.urlCompanyLogo) }} style={styles.logo} />
              </View>
              <Text style={styles.companyName}>{safeText(company.companyName)}</Text>
              <View style={styles.tagsContainer}>
                {safeText(company.industryName) ? (
                  <View style={styles.industryTag}>
                    <MaterialIcons name="business-center" size={16} color="#1ca97c" />
                    <Text style={styles.industryTagText}>{safeText(company.industryName)}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" duration={600} delay={300}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={toggleFavorite} disabled={favoriteActionLoading}>
                {favoriteActionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={20} color="#fff" />
                )}
                <Text style={styles.actionText}>{isFavorite ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => {
                  const website = safeText(company.website);
                  if (website) {
                    Linking.openURL(`https://${website}`);
                  }
                }}
              >
                <MaterialIcons name="open-in-new" size={20} color="#fff" />
                <Text style={styles.actionText}>Visit website</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" duration={600} delay={450}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>About Company</Text>
            {safeText(company.companyProfileDescription) ? (
              <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                <RenderHTML
                  contentWidth={width - 40}
                  source={{ html: safeText(company.companyProfileDescription) }}
                  baseStyle={{ fontSize: 15, color: '#444', lineHeight: 25, fontFamily: 'Poppins-Regular' }}
                  tagsStyles={{
                    p: { marginBottom: 18, lineHeight: 25, fontFamily: 'Poppins-Regular' },
                    ul: { marginBottom: 18, marginTop: 10, paddingLeft: 18, fontFamily: 'Poppins-Regular' },
                    ol: { marginBottom: 18, marginTop: 10, paddingLeft: 18, fontFamily: 'Poppins-Regular' },
                    li: { marginBottom: 10, lineHeight: 25, fontFamily: 'Poppins-Regular' },
                    h1: { marginBottom: 20, fontSize: 22, fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
                    h2: { marginBottom: 18, fontSize: 20, fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
                    h3: { marginBottom: 16, fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
                    img: { marginVertical: 16, borderRadius: 10 },
                    strong: { fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
                    b: { fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
                  }}
                />
              </View>
            ) : (
              <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 15, color: '#666', fontStyle: 'italic', fontFamily: 'Poppins-Regular' }}>
                  No company description available.
                </Text>
              </View>
            )}
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" duration={600} delay={600}>
            <View style={styles.blackDivider} />
            <View style={styles.companyCard}>
              {safeText(company.companyName) ? (
                <View style={styles.infoRowCard}>
                  <Text style={styles.infoLabelCard}>Company name:</Text>
                  <Text style={styles.infoValueCard}>{safeText(company.companyName)}</Text>
                </View>
              ) : null}
              
              {safeText(company.industryName) ? (
                <View style={styles.infoRowCard}>
                  <Text style={styles.infoLabelCard}>Industry:</Text>
                  <Text style={styles.infoValueCard}>{safeText(company.industryName)}</Text>
                </View>
              ) : null}
              
              {safeText(company.location) ? (
                <View style={styles.infoRowCard}>
                  <Text style={styles.infoLabelCard}>Location:</Text>
                  <Text style={styles.infoValueCard}>{safeText(company.location)}</Text>
                </View>
              ) : null}
              
              {safeText(company.teamSize) ? (
                <View style={styles.infoRowCard}>
                  <Text style={styles.infoLabelCard}>Company size:</Text>
                  <Text style={styles.infoValueCard}>{safeText(company.teamSize)}</Text>
                </View>
              ) : null}
              
              {safeText(company.contact) ? (
                <View style={styles.infoRowCard}>
                  <Text style={styles.infoLabelCard}>Contact:</Text>
                  <Text style={styles.infoValueCard}>{safeText(company.contact)}</Text>
                </View>
              ) : null}
            </View>
          </Animatable.View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  coverContainer: {
    backgroundColor: '#eee',
    position: 'relative',
    marginBottom: 50,
  },
  coverImage: {
    // width và height sẽ được set động
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
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#191970',
    fontFamily: 'Poppins-Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
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
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#222',
    marginHorizontal: 18,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Regular',
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
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginHorizontal: 6,
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
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
    fontWeight: 'bold',
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