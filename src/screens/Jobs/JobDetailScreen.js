import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, useWindowDimensions, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import HeaderDetail from '../../components/HeaderDetail';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { JobService } from '../../services/JobService';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import JobApplyModal from '../../components/JobApplyModal';
import CvMatchingModal from '../../components/CvMatchingModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import chatService from '../../services/chatService';
import * as favoriteJobService from '../../services/favoriteJobService';

const JobDetailScreen = ({ route }) => {
  const { jobId } = route?.params || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('about');
  const navigation = useNavigation();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCvMatchModal, setShowCvMatchModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state này
  const [showMessageModal, setShowMessageModal] = useState(false); // Thêm state cho message modal
  const [message, setMessage] = useState(''); // Thêm state cho nội dung tin nhắn
  const [isFavorite, setIsFavorite] = useState(false); // State cho favorite status
  const [favoriteLoading, setFavoriteLoading] = useState(false); // Loading state cho favorite action
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      console.log('Fetching job with ID:', jobId);
      
      try {
        // Thử lấy job từ trending jobs trước
        let found = null;
        
        try {
          const trendingJobs = await JobService.getTrendingJobs({ 
            role: "candidate", 
            page: 1, 
            pageSize: 50 
          });
          
          // Xử lý cấu trúc dữ liệu trending jobs
          let actualTrendingJobs = trendingJobs;
          if (trendingJobs && typeof trendingJobs === 'object' && !Array.isArray(trendingJobs)) {
            if (trendingJobs.data && Array.isArray(trendingJobs.data)) {
              actualTrendingJobs = trendingJobs.data;
            } else if (trendingJobs.jobs && Array.isArray(trendingJobs.jobs)) {
              actualTrendingJobs = trendingJobs.jobs;
            } else if (trendingJobs.items && Array.isArray(trendingJobs.items)) {
              actualTrendingJobs = trendingJobs.items;
            } else if (trendingJobs.results && Array.isArray(trendingJobs.results)) {
              actualTrendingJobs = trendingJobs.results;
            }
          }
          
          if (actualTrendingJobs && Array.isArray(actualTrendingJobs)) {
            found = actualTrendingJobs.find(j => j.id?.toString() === jobId?.toString());
            console.log('Found in trending jobs:', found ? 'Yes' : 'No');
          }
        } catch (trendingError) {
          console.log('Error fetching trending jobs, trying regular jobs:', trendingError);
        }
        
        // Nếu không tìm thấy trong trending jobs, thử với regular jobs
        if (!found) {
          const jobs = await JobService.getJobs();
          found = jobs.find(j => j.id?.toString() === jobId?.toString());
          console.log('Found in regular jobs:', found ? 'Yes' : 'No');
        }
        
        // Nếu vẫn không tìm thấy, thử lấy trực tiếp bằng API getJobById
        if (!found) {
          try {
            found = await JobService.getJobById(jobId);
            console.log('Found via getJobById:', found ? 'Yes' : 'No');
          } catch (getByIdError) {
            console.log('Error getting job by ID:', getByIdError);
          }
        }
        
        setJob(found || null);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job data.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  // Check if job is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!job || !job.id) return;
      
      try {
        const userId = await authService.getUserId();
        if (!userId) {
          console.log('No user ID found, skipping favorite check');
          return;
        }
        
        console.log('Checking favorite status for job:', job.id, 'user:', userId);
        const response = await favoriteJobService.isJobFavorite(userId, job.id);
        console.log('Favorite status response:', response);
        
        // Handle different response types
        if (typeof response === 'boolean') {
          setIsFavorite(response);
        } else if (response && typeof response === 'object') {
          // If response is an object, check for a boolean property
          setIsFavorite(response.isFavorite || response.favorited || false);
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
        console.log('Error checking favorite status:', error);
        setIsFavorite(false);
      }
    };

    if (job) {
      checkFavoriteStatus();
    }
  }, [job]);

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

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }

    try {
      // Lấy thông tin user hiện tại
      const token = await authService.getToken();
      const userId = await authService.getUserId();
      
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to send messages.');
        return;
      }

      // Chuẩn bị payload cho API
      const payload = {
        senderId: Number(userId),
        receiverId: Number(job.company?.id || job.companyId),
        relatedJobId: Number(job.id),
        messageText: message.trim(),
      };

      // Gửi tin nhắn
      await chatService.sendMessage(payload);
      
      // Đóng modal và chuyển qua trang ChatDetail
      setMessage('');
      setShowMessageModal(false);
      
      // Chuyển qua trang ChatDetail với thông tin contact
      navigation.navigate('ChatDetail', {
        contact: {
          id: job.company?.id || job.companyId,
          name: job.company?.companyName || 'Employer',
          avatar: job.company?.urlCompanyLogo || require('../../images/jobfinder-logo.png'),
        },
        partnerOnline: false, // Mặc định offline
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!job || !job.id) return;
    
    try {
      setFavoriteLoading(true);
      const userId = await authService.getUserId();
      
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to favorite jobs.');
        return;
      }

      console.log('Toggling favorite for job:', job.id, 'user:', userId, 'current status:', isFavorite);

      if (isFavorite) {
        // Remove from favorites
        console.log('Removing from favorites...');
        await favoriteJobService.removeFavoriteJob(userId, job.id);
        setIsFavorite(false);
        console.log('Successfully removed from favorites');
      } else {
        // Add to favorites
        console.log('Adding to favorites...');
        await favoriteJobService.addFavoriteJob(userId, job.id);
        setIsFavorite(true);
        console.log('Successfully added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
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
          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.followBtn} onPress={() => setShowMessageModal(true)}>
              <Feather name="message-circle" size={20} color="#fff" />
              <Text style={styles.followBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cvMatchBtn} onPress={() => setShowCvMatchModal(true)}>
              <MaterialIcons name="search" size={20} color="#fff" />
              <Text style={styles.cvMatchBtnText}>Try CV Match</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" duration={600} delay={300}>
          {/* Tabs (About us, Post, Jobs) - chỉ là UI, chưa cần xử lý tab động */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'about' && styles.tabBtnActive]} onPress={() => setActiveTab('about')}><Text style={activeTab === 'about' ? styles.tabTextActive : styles.tabText}>About Job</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]} onPress={() => setActiveTab('overview')}><Text style={activeTab === 'overview' ? styles.tabTextActive : styles.tabText}>Overview</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'recruiter' && styles.tabBtnActive]} onPress={() => setActiveTab('recruiter')}><Text style={activeTab === 'recruiter' ? styles.tabTextActive : styles.tabText}>Recruiter</Text></TouchableOpacity>
          </View>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" duration={600} delay={450}>
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
                      h1: { marginBottom: 20, fontSize: 22, fontFamily: 'Poppins-Bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontFamily: 'Poppins-Bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontFamily: 'Poppins-Bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontFamily: 'Poppins-Bold' },
                      b: { fontFamily: 'Poppins-Bold' },
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
                      h1: { marginBottom: 20, fontSize: 22, fontFamily: 'Poppins-Bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontFamily: 'Poppins-Bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontFamily: 'Poppins-Bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontFamily: 'Poppins-Bold' },
                      b: { fontFamily: 'Poppins-Bold' },
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
                      h1: { marginBottom: 20, fontSize: 22, fontFamily: 'Poppins-Bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontFamily: 'Poppins-Bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontFamily: 'Poppins-Bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontFamily: 'Poppins-Bold' },
                      b: { fontFamily: 'Poppins-Bold' },
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
                      h1: { marginBottom: 20, fontSize: 22, fontFamily: 'Poppins-Bold' },
                      h2: { marginBottom: 18, fontSize: 20, fontFamily: 'Poppins-Bold' },
                      h3: { marginBottom: 16, fontSize: 18, fontFamily: 'Poppins-Bold' },
                      img: { marginVertical: 16, borderRadius: 10 },
                      strong: { fontFamily: 'Poppins-Bold' },
                      b: { fontFamily: 'Poppins-Bold' },
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
      <Animatable.View animation="fadeInUp" duration={600} delay={600} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100 }}>
        {/* Menu bar dưới cùng */}
        <View style={[styles.bottomMenuBar, { paddingBottom: 10 + insets.bottom }]}>
          <TouchableOpacity 
            style={[styles.bookmarkBtn, isFavorite && styles.bookmarkBtnActive]} 
            onPress={handleToggleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={isFavorite ? "#fff" : "#1967D2"} />
            ) : (
              <MaterialIcons 
                name={isFavorite ? "bookmark" : "bookmark-border"} 
                size={22} 
                color={isFavorite ? "#fff" : "#1967D2"} 
              />
            )}
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
      <CvMatchingModal
        visible={showCvMatchModal}
        onClose={() => setShowCvMatchModal(false)}
        jobId={job.id}
        jobTitle={job.jobTitle}
      />
      
      {/* Message Modal */}
      {showMessageModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 24 : 0}
            style={styles.kbAvoider}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animatable.View animation="fadeInUp" duration={300} style={styles.messageModal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Image 
                  source={job.company?.urlCompanyLogo ? { uri: job.company.urlCompanyLogo } : require('../../images/jobfinder-logo.png')} 
                  style={styles.modalCompanyLogo} 
                />
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalCompanyName}>{job.company?.companyName || 'Contact Employer'}</Text>
                  <Text style={styles.modalCompanyIndustry}>{job.company?.industryName || 'Replies instantly'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowMessageModal(false)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={24} color="#606770" />
              </TouchableOpacity>
            </View>

            {/* Message Input */}
            <View style={styles.modalBody}>
              <TextInput
                style={styles.messageInput}
                placeholder="Enter Message..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendMessage}
              >
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={styles.sendButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
              </Animatable.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      )}
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
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Regular',
  },
  dot: {
    color: '#222',
    fontSize: 18,
    marginHorizontal: 4,
    fontFamily: 'Poppins-Bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 18,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1967D2',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 8,
    flex: 1,
    justifyContent: 'center',
  },
  followBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  cvMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1967D2',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginLeft: 8,
    flex: 1,
    justifyContent: 'center',
  },
  cvMatchBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-SemiBold',
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
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
    color: '#222',
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  sectionContent: {
    color: '#444',
    fontSize: 15,
    marginBottom: 18,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
  },
  infoValue: {
    color: '#222',
    fontSize: 15,
    flex: 1.5,
    textAlign: 'right',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Regular',
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
    fontSize: 15,
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
  overviewValue: {
    color: '#222',
    fontSize: 15,
    marginLeft: 4,
    flexShrink: 1,
    fontFamily: 'Poppins-Regular',
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
    color: '#222',
    fontFamily: 'Poppins-Bold',
  },
  recruiterProfileLink: {
    color: '#1967D2',
    fontSize: 17,
    textAlign: 'center',
    textDecorationLine: 'none',
    fontFamily: 'Poppins-Bold',
  },
  recruiterInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recruiterLabel: {
    color: '#222',
    fontSize: 15,
    flex: 1.2,
    fontFamily: 'Poppins-Bold',
  },
  recruiterValue: {
    color: '#222',
    fontSize: 15,
    flex: 1.5,
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
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
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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
  bookmarkBtnActive: {
    backgroundColor: '#1967D2',
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
    fontSize: 16,
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Bold',
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
  // Message Modal Styles
  kbAvoider: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  messageModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalCompanyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalCompanyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  modalCompanyIndustry: {
    fontSize: 13,
    color: '#65676b',
    fontFamily: 'Poppins-Regular',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1967D2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default JobDetailScreen; 