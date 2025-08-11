import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../constants/api';

const CompanyCard = ({ 
  item, 
  index, 
  favoriteCompanies, // optional: Set of saved company ids
  onBookmarkPress,    // optional: handler(id)
  showAnimation = true,
  animationDelay = 100 
}) => {
  const navigation = useNavigation();

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
    if (company.teamSize) {
      tags.push(`${company.teamSize} employees`);
    }
    return tags;
  };

  const logoUrl = item.urlCompanyLogo
    ? (item.urlCompanyLogo.startsWith('http') ? item.urlCompanyLogo : `${BASE_URL}${item.urlCompanyLogo}`)
    : null;
  const tags = getCompanyTags(item);
  const logoColor = getLogoColor(item.companyName || item.name || 'Unknown');
  const logoText = getLogoText(item.companyName || item.name || 'Unknown');

  const getCompanyId = (company) => company?.userId ?? company?.companyId ?? company?.id;

  const CompanyCardContent = () => {
    const id = getCompanyId(item);
    const idStr = id != null ? String(id) : undefined;
    const isSaved = idStr ? favoriteCompanies?.has(idStr) : false;
    return (
    <View style={styles.newCompanyCard}>
      <View style={styles.mainContentContainer}>
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
        </View>
        
        <View style={styles.companyTags}>
          {tags.map((tag, tagIndex) => (
            <View 
              key={tagIndex} 
              style={[
                styles.companyTag, 
                { 
                  backgroundColor: '#f0fff4',
                  borderColor: '#9ae6b4'
                }
              ]}
            >
              <Text style={[styles.companyTagText, { color: '#059669' }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.companyFooter}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location || 'Unknown Location'}</Text>
        </View>
        {onBookmarkPress && (
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={(e) => {
              e.stopPropagation();
              if (id != null) onBookmarkPress(id);
            }}
          >
            <MaterialIcons 
              name={isSaved ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={isSaved ? '#2563eb' : '#666'}
            />
            <Text style={styles.footerText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
    );
  };

  const handlePress = () => {
    navigation.navigate('CompanyDetail', { companyId: item.userId });
  };

  if (showAnimation) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <Animatable.View animation="fadeInUp" duration={600} delay={index * animationDelay}>
          <CompanyCardContent />
        </Animatable.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <CompanyCardContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Company Card Styles
  newCompanyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  companyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  companyLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  companyLogoText: {
    color: '#3182ce',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  companyTitle: {
    fontSize: 14,
    color: '#1a202c',
    marginBottom: -2,
    fontFamily: 'Poppins-Bold',
  },
  companyIndustry: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },
  companyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -4,
  },
  companyTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 0,
    borderWidth: 1,
  },
  companyTagText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
  },
  mainContentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 1,
    marginBottom: 1,
  },
  companyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationText: {
    fontSize: 11,
    color: '#495057',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    paddingHorizontal: 8,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CompanyCard; 