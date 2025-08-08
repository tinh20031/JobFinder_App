import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const JobCard = ({ 
  item, 
  index, 
  favoriteJobs, 
  onBookmarkPress,
  showAnimation = true,
  animationDelay = 100 
}) => {
  const navigation = useNavigation();

  // Helper function to format salary
  const formatSalary = (minSalary, maxSalary, isNegotiable) => {
    if (isNegotiable) {
      return 'Negotiable Salary';
    }
    if (minSalary && maxSalary) {
      return `$${minSalary} - $${maxSalary}`;
    } else if (minSalary) {
      return `$${minSalary}`;
    } else if (maxSalary) {
      return `$${maxSalary}`;
    }
    return 'Negotiable Salary';
  };

  // Helper function to get job tags
  const getJobTags = (job) => {
    const tags = [];
    
    // Add job type tag
    if (job.jobType?.jobTypeName) {
      tags.push(job.jobType.jobTypeName);
    } else if (job.workType) {
      tags.push(job.workType);
    }
    
    // Add industry tag
    if (job.industry?.industryName) {
      tags.push(job.industry.industryName);
    } else if (job.industryName) {
      tags.push(job.industryName);
    }
    
    // Add level tag if available
    if (job.level?.levelName) {
      tags.push(job.level.levelName);
    } else if (job.levelName) {
      tags.push(job.levelName);
    }
    
    return tags;
  };

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

  const salaryText = formatSalary(item.minSalary, item.maxSalary, item.isSalaryNegotiable);
  const tags = getJobTags(item);
  const logoColor = getLogoColor(item.company?.companyName || 'Unknown');
  const logoText = getLogoText(item.company?.companyName || 'Unknown');

  const JobCardContent = () => (
    <View style={styles.newJobCard}>
      <View style={styles.mainContentContainer}>
        <View style={styles.jobCardHeader}>
          <View style={styles.companyInfoSection}>
            {item.logo ? (
              <Image 
                source={{ uri: item.logo }}
                style={[styles.companyLogo, { backgroundColor: '#fff' }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.companyLogo, { backgroundColor: logoColor }]}>
                <Text style={styles.companyLogoText}>{logoText}</Text>
              </View>
            )}
            <View style={styles.companyTextSection}>
              <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.jobTitle || 'Unknown Job'}
              </Text>
              <Text style={styles.jobCompany}>
                {item.company?.companyName || 'Unknown Company'} - {item.provinceName || item.location || 'Unknown Location'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.jobTags}>
          {tags.map((tag, tagIndex) => {
            // Fixed colors based on tag position (index)
            const colorSchemes = [
              { bg: '#fef5e7', border: '#fed7aa', text: '#d97706' }, // Orange/Yellow (Tag 1)
              { bg: '#f0fff4', border: '#9ae6b4', text: '#059669' }, // Green (Tag 2)
              { bg: '#fff5f5', border: '#feb2b2', text: '#dc2626' }, // Red (Tag 3)
            ];
            const colorIndex = tagIndex % colorSchemes.length;
            const tagColors = colorSchemes[colorIndex];
            
            return (
              <View 
                key={`${tag}-${tagIndex}`} 
                style={[
                  styles.jobTag, 
                  { 
                    backgroundColor: tagColors.bg,
                    borderColor: tagColors.border
                  }
                ]}
              >
                <Text style={[styles.jobTagText, { color: tagColors.text }]}>
                  {tag}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.jobFooter}>
        <View style={styles.footerItem}>
          <MaterialIcons name="payment" size={16} color="#000" />
          <Text style={styles.footerText}>{salaryText}</Text>
        </View>
        {onBookmarkPress && (
          <TouchableOpacity 
            style={styles.bookmarkButton} 
            onPress={(e) => {
              e.stopPropagation();
              onBookmarkPress(item.id);
            }}
          >
            <MaterialIcons 
              name={favoriteJobs?.has(item.id) ? "bookmark" : "bookmark-border"} 
              size={20} 
              color={favoriteJobs?.has(item.id) ? "#2563eb" : "#666"} 
            />
            <Text style={styles.footerText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handlePress = () => {
    navigation.navigate('JobDetail', { jobId: item.id });
  };

  if (showAnimation) {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handlePress}
      >
        <Animatable.View animation="fadeInUp" duration={600} delay={index * animationDelay}>
          <JobCardContent />
        </Animatable.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={handlePress}
    >
      <JobCardContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Job Card Styles
  newJobCard: {
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
  jobCardHeader: {
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 1,
    marginBottom: 1,
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
  jobTitle: {
    fontSize: 14,
    color: '#1a202c',
    marginBottom: -2,
    fontFamily: 'Poppins-Bold',
  },
  jobCompany: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 0,
    fontFamily: 'Poppins-Regular',
  },
  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -4,
  },
  jobTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 0,
    borderWidth: 1,
  },
  jobTagText: {
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
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default JobCard; 