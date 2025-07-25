import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, useWindowDimensions } from 'react-native';
import HeaderDetail from '../../components/HeaderDetail';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { JobService } from '../../services/JobService';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import JobApplyModal from '../../components/JobApplyModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const JobDetailScreen = ({ route }) => {
  const { jobId } = route?.params || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('about');
  const navigation = useNavigation();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state này
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobs = await JobService.getJobs();
        const found = jobs.find(j => j.id?.toString() === jobId?.toString());
        setJob(found || null);
      } catch (err) {
        setError('Failed to load job data.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  if (error || !job) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error || 'Job not found.'}</Text>
      </View>
    );
  }

  const companyLogo = job.company?.urlCompanyLogo || job.logo;
  const companyName = job.company?.companyName || 'Unknown Company';
  const location = job.location || job.company?.location || '';
  const postedAgo = job.createdAt ? '1 day ago' : '';

  // Thêm hàm formatDate
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const openCompanyWebsite = () => {
    let url = job.company.website;
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    if (url) Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FD' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animatable.View animation="fadeInUp" duration={600} delay={0}>
          <HeaderDetail />
          <View style={styles.headerCard}>
            <View style={styles.logoWrapper}>
              <Image source={companyLogo ? { uri: companyLogo } : require('../../images/jobfinder-logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.jobTitle}>{job.jobTitle}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{location}</Text>
              <Text style={styles.dot}> • </Text>
              <Text style={styles.infoText}>{postedAgo}</Text>
            </View>
          </View>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" duration={600} delay={150}>
          {/* Tabs (About us, Post, Jobs) - chỉ là UI, chưa cần xử lý tab động */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'about' && styles.tabBtnActive]} onPress={() => setActiveTab('about')}><Text style={activeTab === 'about' ? styles.tabTextActive : styles.tabText}>About Job</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]} onPress={() => setActiveTab('overview')}><Text style={activeTab === 'overview' ? styles.tabTextActive : styles.tabText}>Overview</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'recruiter' && styles.tabBtnActive]} onPress={() => setActiveTab('recruiter')}><Text style={activeTab === 'recruiter' ? styles.tabTextActive : styles.tabText}>Recruiter</Text></TouchableOpacity>
          </View>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" duration={600} delay={300}>
          {activeTab === 'about' && (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              {job.description ? (
                <View style={{ marginBottom: 18 }}>
                  <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: job.description }}
                    baseStyle={{ fontSize: 15, color: '#444', lineHeight: 25 }}
                    tagsStyles={{
                      p: { marginBottom: 18, lineHeight: 25 },
                      ul: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      ol: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      li: { marginBottom: 10, lineHeight: 25 },
                      h1: { marginBottom: 20, fontSize: 22, fontWeight: 'bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontWeight: 'bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontWeight: 'bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontWeight: 'bold' },
                      b: { fontWeight: 'bold' },
                    }}
                  />
                </View>
              ) : (
                <Text style={styles.sectionContent}>No description.</Text>
              )}
              <Text style={styles.sectionTitle}>Education</Text>
              {job.education ? (
                <View style={{ marginBottom: 18 }}>
                  <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: job.education }}
                    baseStyle={{ fontSize: 15, color: '#444', lineHeight: 25 }}
                    tagsStyles={{
                      p: { marginBottom: 18, lineHeight: 25 },
                      ul: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      ol: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      li: { marginBottom: 10, lineHeight: 25 },
                      h1: { marginBottom: 20, fontSize: 22, fontWeight: 'bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontWeight: 'bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontWeight: 'bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontWeight: 'bold' },
                      b: { fontWeight: 'bold' },
                    }}
                  />
                </View>
              ) : (
                <Text style={styles.sectionContent}>Not specified.</Text>
              )}
              <Text style={styles.sectionTitle}>Skills</Text>
              {job.yourSkill ? (
                <View style={{ marginBottom: 18 }}>
                  <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: Array.isArray(job.yourSkill) ? job.yourSkill.join(', ') : job.yourSkill }}
                    baseStyle={{ fontSize: 15, color: '#444', lineHeight: 25 }}
                    tagsStyles={{
                      p: { marginBottom: 18, lineHeight: 25 },
                      ul: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      ol: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      li: { marginBottom: 10, lineHeight: 25 },
                      h1: { marginBottom: 20, fontSize: 22, fontWeight: 'bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontWeight: 'bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontWeight: 'bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontWeight: 'bold' },
                      b: { fontWeight: 'bold' },
                    }}
                  />
                </View>
              ) : (
                <Text style={styles.sectionContent}>Not specified.</Text>
              )}
              <Text style={styles.sectionTitle}>Experience</Text>
              {job.yourExperience ? (
                <View style={{ marginBottom: 18 }}>
                  <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: job.yourExperience }}
                    baseStyle={{ fontSize: 15, color: '#444', lineHeight: 25 }}
                    tagsStyles={{
                      p: { marginBottom: 18, lineHeight: 25 },
                      ul: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      ol: { marginBottom: 18, marginTop: 10, paddingLeft: 18 },
                      li: { marginBottom: 10, lineHeight: 25 },
                      h1: { marginBottom: 20, fontSize: 22, fontWeight: 'bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontWeight: 'bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontWeight: 'bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontWeight: 'bold' },
                      b: { fontWeight: 'bold' },
                    }}
                  />
                </View>
              ) : (
                <Text style={styles.sectionContent}>Not specified.</Text>
              )}
            </View>
          )}
          {activeTab === 'overview' && (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Job Overview</Text>
              {/* Industry */}
              <View style={styles.overviewLine}><MaterialIcons name="person" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Industry: </Text><Text style={styles.overviewValue}>{job.industry?.industryName || '-'}</Text></View>
              {/* Level */}
              <View style={styles.overviewLine}><MaterialIcons name="person" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Level: </Text><Text style={styles.overviewValue}>{job.level?.levelName || '-'}</Text></View>
              {/* Number of positions */}
              <View style={styles.overviewLine}><MaterialIcons name="person" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Number of positions: </Text><Text style={styles.overviewValue}>{job.numberOfPositions || '1'}</Text></View>
              {/* Start Date */}
              <View style={styles.overviewLine}><MaterialIcons name="schedule" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Start Date: </Text><Text style={styles.overviewValue}>{formatDate(job.timeStart)}</Text></View>
              {/* End Date */}
              <View style={styles.overviewLine}><MaterialIcons name="schedule" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> End Date: </Text><Text style={styles.overviewValue}>{formatDate(job.timeEnd)}</Text></View>
              {/* Application Deadline */}
              <View style={styles.overviewLine}><MaterialIcons name="hourglass-empty" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Application Deadline: </Text><Text style={styles.overviewValue}>{formatDate(job.expiryDate)}</Text></View>
              {/* Salary */}
              <View style={styles.overviewLine}><MaterialIcons name="attach-money" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Salary: </Text><Text style={styles.overviewValue}>{job.isSalaryNegotiable ? 'Negotiable Salary' : (job.minSalary && job.maxSalary ? `$${job.minSalary} - $${job.maxSalary}` : (job.minSalary ? `$${job.minSalary}` : (job.maxSalary ? `$${job.maxSalary}` : '-')))}</Text></View>
              {/* Address */}
              <View style={styles.overviewLine}><MaterialIcons name="place" size={22} color="#2563eb" /><Text style={styles.overviewLabel}> Address: </Text><Text style={styles.overviewValue}>{job.addressDetail || job.location || '-'}</Text></View>
            </View>
          )}
          {activeTab === 'recruiter' && job.company && (
            <View style={styles.recruiterCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Image source={job.company.urlCompanyLogo ? { uri: job.company.urlCompanyLogo } : require('../../images/jobfinder-logo.png')} style={styles.recruiterLogo} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.recruiterName}>{job.company.companyName}</Text>
                  <Text style={styles.recruiterWebsiteText} onPress={openCompanyWebsite}>
                    Visit company website
                  </Text>
                </View>
              </View>
              <View style={styles.recruiterInfoRow}><Text style={styles.recruiterLabel}>Industry:</Text><Text style={styles.recruiterValue}>{job.company.industryName || '-'}</Text></View>
              <View style={styles.recruiterInfoRow}><Text style={styles.recruiterLabel}>Company size:</Text><Text style={styles.recruiterValue}>{job.company.teamSize || '-'}</Text></View>
              <View style={styles.recruiterInfoRow}><Text style={styles.recruiterLabel}>Location:</Text><Text style={styles.recruiterValue}>{job.company.location || '-'}</Text></View>
              <View style={styles.recruiterInfoRow}><Text style={styles.recruiterLabel}>Contact:</Text><Text style={styles.recruiterValue}>{job.company.contact || '-'}</Text></View>
              <TouchableOpacity style={styles.recruiterProfileBtn} onPress={() => navigation.navigate('CompanyDetail', { companyId: job.company.id || job.company.companyId || job.company._id || job.companyId })}>
                <Text style={styles.recruiterProfileLink}>View company profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animatable.View>
      </ScrollView>
      <Animatable.View animation="fadeInUp" duration={600} delay={450} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100 }}>
        {/* Menu bar dưới cùng */}
        <View style={[styles.bottomMenuBar, { paddingBottom: 10 + insets.bottom }]}>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <MaterialIcons name="bookmark-border" size={22} color="#1967D2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyBtn, isSubmitting && { backgroundColor: '#90caf9' }]}
            onPress={() => setShowApplyModal(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      <JobApplyModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobId={job.id}
        onApplied={() => setShowApplyModal(false)}
        isSubmitting={isSubmitting}
        onSubmittingChange={setIsSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f7fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'contain',
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: '#222',
    fontSize: 15,
  },
  dot: {
    color: '#222',
    fontSize: 18,
    marginHorizontal: 4,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginHorizontal: 8,
  },
  actionText: {
    color: '#FF4D4F',
    fontWeight: '600',
    fontSize: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 18,
    padding: 4,
    elevation: 1,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  tabBtnActive: {
    backgroundColor: '#1967D2',
  },
  tabText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionWrap: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 32,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  sectionContent: {
    color: '#444',
    fontSize: 15,
    marginBottom: 18,
    lineHeight: 22,
  },
  infoRowDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1.2,
  },
  infoValue: {
    color: '#222',
    fontSize: 15,
    flex: 1.5,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  overviewGrid: {
    marginTop: 12,
    marginBottom: 8,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  overviewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 18,
  },
  overviewLabel: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  overviewValue: {
    color: '#222',
    fontSize: 15,
    marginLeft: 4,
    flexShrink: 1,
  },
  recruiterCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 32,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recruiterLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  recruiterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  recruiterProfileLink: {
    color: '#1967D2',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'none',
  },
  recruiterInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recruiterLabel: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1.2,
  },
  recruiterValue: {
    color: '#222',
    fontSize: 15,
    flex: 1.5,
    textAlign: 'right',
  },
  recruiterWebsiteBtn: {
    backgroundColor: '#e6edfa',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  recruiterWebsiteText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recruiterProfileBtn: {
    backgroundColor: '#eaf1fb', // màu nền nhạt gần #1967D2
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: 'center',
  },
  bottomMenuBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    zIndex: 100,
  },
  bookmarkBtn: {
    backgroundColor: '#eaf1fb',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#1967D2',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  menuBarLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100, // Adjust based on the height of the bottom menu bar
    zIndex: 1,
  },
});

export default JobDetailScreen; 