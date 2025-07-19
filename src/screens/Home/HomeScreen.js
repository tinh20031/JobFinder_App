import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Header from '../../components/HeaderCandidate';
import BannerImg from '../../images/banner-img-3.png';
import WorkImg from '../../images/work-1.png';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Header />

      {/* Banner */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerText}>50% off{`\n`}take any courses</Text>
          <View style={styles.bannerButton}><Text style={styles.bannerButtonText}>Join Now</Text></View>
        </View>
        <Image source={BannerImg} style={styles.bannerImage} resizeMode="contain" />
      </View>

      {/* Find Your Job */}
      <Text style={styles.sectionTitle}>Find Your Job</Text>
      <View style={styles.findJobContainer}>
        {/* Box lớn bên trái */}
        <View style={styles.findJobBoxLarge}>
          <Image source={WorkImg} style={styles.findJobIcon} resizeMode="contain" />
          <Text style={styles.findJobNumberLarge}>44.5k</Text>
          <Text style={styles.findJobLabelLarge}>Remote Job</Text>
        </View>
        {/* Hai box nhỏ bên phải */}
        <View style={styles.findJobColSmall}>
          <View style={[styles.findJobBoxSmall, {backgroundColor: '#D6C7FF'}]}>
            <Text style={styles.findJobNumberSmall}>66.8k</Text>
            <Text style={styles.findJobLabelSmall}>Full Time</Text>
          </View>
          <View style={[styles.findJobBoxSmall, {backgroundColor: '#FFE2B6'}]}>
            <Text style={styles.findJobNumberSmall}>38.9k</Text>
            <Text style={styles.findJobLabelSmall}>Part Time</Text>
          </View>
        </View>
      </View>

      {/* Recent Job List */}
      <Text style={styles.sectionTitle}>Recent Job List</Text>
      <View style={styles.jobList}>
        {/* Placeholder cho danh sách job */}
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>Product Designer</Text>
          <Text style={styles.jobCompany}>Google inc · California, USA</Text>
          <Text style={styles.jobSalary}>$15K/Mo</Text>
          <View style={styles.jobTagsRow}>
            <View style={styles.jobTag}><Text>Senior designer</Text></View>
            <View style={styles.jobTag}><Text>Full time</Text></View>
            <View style={styles.jobApply}><Text style={{color:'#fff'}}>Apply</Text></View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FF' },
  banner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#2B3990',
    height: 200, // tăng chiều cao
    padding: 24, // tăng padding cho thoáng
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  bannerButton: { backgroundColor: '#FF9900', borderRadius: 8, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  bannerButtonText: { color: '#fff', fontWeight: 'bold' },
  bannerImage: { width: 170, height: 170, marginLeft: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, marginTop: 24, marginBottom: 8 },
  findJobContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    height: 140,
  },
  findJobBoxLarge: {
    flex: 1.2,
    backgroundColor: '#B6E6FB',
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  findJobIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  findJobNumberLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  findJobLabelLarge: {
    fontSize: 15,
    color: '#222',
  },
  findJobColSmall: {
    flex: 1,
    justifyContent: 'space-between',
  },
  findJobBoxSmall: {
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: 62,
  },
  findJobNumberSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  findJobLabelSmall: {
    fontSize: 13,
    color: '#222',
  },
  jobList: { margin: 16 },
  jobCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  jobCompany: { fontSize: 13, color: '#888', marginBottom: 8 },
  jobSalary: { fontSize: 15, fontWeight: 'bold', color: '#2B3990', marginBottom: 8 },
  jobTagsRow: { flexDirection: 'row', alignItems: 'center' },
  jobTag: { backgroundColor: '#F2F2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  jobApply: { backgroundColor: '#FF9900', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
});

export default HomeScreen;
