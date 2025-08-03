import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CompanyCard = ({ company, onBookmark }) => {
  return (
    <View style={styles.carouselJobCard}>
      {/* Header với logo, tên công ty, ngành nghề và bookmark */}
      <View style={styles.jobCardHeader}>
        <View style={styles.companyInfoSection}>
          <View style={[styles.companyLogo, { backgroundColor: company.logoColor }]}>
            <Text style={styles.companyLogoText}>{company.logoText}</Text>
          </View>
          <View style={styles.companyTextSection}>
            <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">{company.name}</Text>
            <Text style={styles.jobCompany}>{company.industry}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bookmarkButton} onPress={() => onBookmark(company.id)}>
          <Icon name="bookmark-border" size={28} color="#0070BA" />
        </TouchableOpacity>
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Địa điểm */}
      <View style={styles.jobLocation}>
        <Text style={styles.locationText}>{company.location}</Text>
      </View>
      
      {/* Số lượng job */}
      <Text style={styles.jobSalary}> {company.jobCount} jobs</Text>
      
      {/* Tags */}
      <View style={styles.jobTags}>
        {company.tags.map((tag, index) => (
          <View key={index} style={styles.jobTag}>
            <Text style={styles.jobTagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselJobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 16,
    width: 360,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  jobCardHeader: {
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
  jobTitle: {
    fontSize: 20,
    color: '#000',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  jobCompany: {
    fontSize: 15,
    color: '#666',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },
  jobLocation: {
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
  jobSalary: {
    fontSize: 17,
    color: '#2563eb',
    marginBottom: 16,
    marginLeft: 68,
    fontFamily: 'Poppins-SemiBold',
  },
  jobTags: {
    flexDirection: 'row',
    marginLeft: 68,
  },
  jobTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  jobTagText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
});

export default CompanyCard; 