import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ImageBackground, Dimensions, TextInput, ActivityIndicator, Alert, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import profileService, { getToken } from '../../services/profileService';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AboutMeSection from './AboutMeSection';
import EducationSection from './EducationSection';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WorkExperienceSection from './WorkExperienceSection';
import SkillsSection from './SkillsSection';
import ForeignLanguageSection from './ForeignLanguageSection';
import HighlightProjectSection from './HighlightProjectSection';
import CertificateSection from './CertificateSection';
import AwardsSection from './AwardsSection';
import PersonalInfoSection from './PersonalInfoSection';
import { useProfileCompletion } from '../../navigation/AppNavigator';
// import HeaderCandidate from '../../components/HeaderCandidate';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SectionCard: card section dùng cho các phần Work Experience, Skills, ...
function SectionCard({ iconName, title, emptyText }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name={iconName} size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.separator} />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { setProfileCompletion } = useProfileCompletion();
  const [fullname, setFullname] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [personalLink, setPersonalLink] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aboutMe, setAboutMe] = useState(null);
  const [aboutMeLoading, setAboutMeLoading] = useState(true);
  const [awards, setAwards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [highlightProjects, setHighlightProjects] = useState([]);
  const [profileStrength, setProfileStrength] = useState({
    percentage: 0,
    missingFields: []
  });


  const navigation = useNavigation();
  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
          const profile = await profileService.getCandidateProfile();
          
          setFullname(profile.fullName || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
          setAddress(profile.address || '');
          setGender(profile.gender || '');
          setDob(profile.dob ? profile.dob.substring(0, 10) : '');
          setImage(profile.image || '');
          setProvince(profile.province || '');
          setCity(profile.city || '');
          setJobTitle(profile.jobTitle || '');
          setPersonalLink(profile.personalLink || '');
          
          // Lấy About Me từ dedicated API
          setAboutMeLoading(true);
          try {
            const about = await profileService.getAboutMe();
            setAboutMe(about);
          } catch (e) {
            console.error('ProfileScreen - AboutMe load error:', e);
            setAboutMe(null);
          }
          setAboutMeLoading(false);
        } catch (e) {
          console.error('Error loading profile:', e);
          setError('Unable to load profile information.');
          setAboutMeLoading(false);
        }
        setLoading(false);
      };
      fetchProfile();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchEducations = async () => {
        try {
          const list = await profileService.getEducationList();
          setEducations(list);
        } catch (e) {
          console.error('ProfileScreen - Education load error:', e);
          setEducations([]);
        }
      };
      fetchEducations();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchWorks = async () => {
        try {
          const list = await profileService.getWorkExperienceList();
          setWorkExperiences(list);
        } catch (e) {
          console.error('ProfileScreen - Fetch work experiences error:', e);
          setWorkExperiences([]);
        }
      };
      fetchWorks();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchAwards = async () => {
        try {
          const list = await profileService.getAwardList();
          setAwards(list);
        } catch (e) {
          setAwards([]);
        }
      };
      fetchAwards();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchCertificates = async () => {
        try {
          const list = await profileService.getCertificateList();
          setCertificates(list);
        } catch (e) {
          setCertificates([]);
        }
      };
      fetchCertificates();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchHighlightProjects = async () => {
        try {
          const list = await profileService.getHighlightProjectList();
          setHighlightProjects(list);
        } catch (e) {
          setHighlightProjects([]);
        }
      };
      fetchHighlightProjects();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfileStrength = async () => {
        try {
          const strength = await profileService.getProfileStrength();
          setProfileStrength(strength);
          // Cập nhật profile completion cho tab bar
          const percentage = strength.percentage || 0;

          setProfileCompletion(percentage);
        } catch (e) {
          setProfileStrength({ percentage: 0, missingFields: [] });
          setProfileCompletion(0);
        }
      };
      fetchProfileStrength();
    }, [setProfileCompletion])
  );

  // Thêm useEffect để đảm bảo cập nhật khi component mount
  useEffect(() => {
    const updateProfileCompletion = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const strength = await profileService.getProfileStrength(token);
        const percentage = strength.percentage || 0;

        setProfileCompletion(percentage);
      } catch (e) {
        setProfileCompletion(0);
      }
    };
    updateProfileCompletion();
  }, [setProfileCompletion]);

  const handleAddEducation = () => {
    navigation.navigate('EducationEdit', { mode: 'add' });
  };
  const handleEditEducation = (item) => {
    navigation.navigate('EducationEdit', { education: item, mode: 'edit' });
  };
  const handleDeleteEducation = async (item) => {
    try {
      await profileService.deleteEducation(item.id);
      
      // Reload list
      const list = await profileService.getEducationList();
      setEducations(list);
      
      // Cập nhật profile completion
      const strength = await profileService.getProfileStrength();
      setProfileStrength(strength);
      setProfileCompletion(strength.percentage || 0);
    } catch (error) {
      console.error('ProfileScreen - Delete education error:', error);
    }
  };

  const handleAddWorkExperience = () => {
    navigation.navigate('WorkExperienceEdit', { mode: 'add' });
  };
  const handleEditWorkExperience = (item) => {
    navigation.navigate('WorkExperienceEdit', { work: item, mode: 'edit' });
  };
  const handleDeleteWorkExperience = async (id) => {
    try {
      await profileService.deleteWorkExperience(id);
      
      // Reload list
      const list = await profileService.getWorkExperienceList();
      setWorkExperiences(list);
      
      // Cập nhật profile completion
      const strength = await profileService.getProfileStrength();
      setProfileStrength(strength);
      setProfileCompletion(strength.percentage || 0);
    } catch (error) {
      console.error('ProfileScreen - Delete work experience error:', error);
    }
  };

  // Hàm edit About Me
  const handleEditAboutMe = async (desc, id) => {
    try {
      if (aboutMe && aboutMe.aboutMeDescription) {
        await profileService.updateAboutMe(id, desc);
        setAboutMe({ ...aboutMe, aboutMeDescription: desc });
      } else {
        const about = await profileService.createAboutMe(desc);
        setAboutMe(about);
      }
      
      // Cập nhật profile completion
      const strength = await profileService.getProfileStrength();
      setProfileStrength(strength);
      setProfileCompletion(strength.percentage || 0);
    } catch (e) {
      console.error('ProfileScreen - handleEditAboutMe error:', e);
      // Handle error silently
    }
  };

  const handleAddAward = () => {
    navigation.navigate('AwardEdit', { mode: 'add' });
  };
  const handleEditAward = (item) => {
    navigation.navigate('AwardEdit', { award: item, mode: 'edit' });
  };
  const handleDeleteAward = async (item) => {
    await profileService.deleteAward(item.id || item.awardId);
    // Reload list
    const list = await profileService.getAwardList();
    setAwards(list);
    // Cập nhật profile completion
    const strength = await profileService.getProfileStrength();
    setProfileStrength(strength);
    setProfileCompletion(strength.percentage || 0);
  };

  const handleAddCertificate = () => {
    navigation.navigate('CertificateEdit', { mode: 'add' });
  };
  const handleEditCertificate = (item) => {
    navigation.navigate('CertificateEdit', { certificate: item, mode: 'edit' });
  };
  const handleDeleteCertificate = async (item) => {
    await profileService.deleteCertificate(item.id || item.certificateId);
    // Reload list
    const list = await profileService.getCertificateList();
    setCertificates(list);
    // Cập nhật profile completion
    const strength = await profileService.getProfileStrength();
    setProfileStrength(strength);
    setProfileCompletion(strength.percentage || 0);
  };

  const handleAddHighlightProject = () => {
    navigation.navigate('HighlightProjectEdit', { mode: 'add' });
  };
  const handleEditHighlightProject = (item) => {
    navigation.navigate('HighlightProjectEdit', { project: item, mode: 'edit' });
  };
  const handleDeleteHighlightProject = async (item) => {
    await profileService.deleteHighlightProject(item.id || item.highlightProjectId);
    // Reload list
    const list = await profileService.getHighlightProjectList();
    setHighlightProjects(list);
    // Cập nhật profile completion
    const strength = await profileService.getProfileStrength();
    setProfileStrength(strength);
    setProfileCompletion(strength.percentage || 0);
  };

  // Validate function
  const validate = () => {
    if (!fullname.trim()) return 'Fullname is required.';
    if (!dob.trim()) return 'Date of birth is required.';
    if (!gender.trim()) return 'Gender is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format.';
    if (!phone.trim()) return 'Phone number is required.';
    if (!/^[0-9]{8,}$/.test(phone)) return 'Invalid phone number.';
    if (!address.trim()) return 'Address is required.';
    if (!city.trim()) return 'City is required.';
    if (!province.trim()) return 'Province is required.';
    return '';
  };

  const handleSave = async () => {
    setError('');
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('FullName', fullname);
      formData.append('Phone', phone);
      formData.append('Gender', gender);
      formData.append('Dob', dob);
      formData.append('Address', address);
      formData.append('City', city);
      formData.append('Province', province);
      
      await profileService.updateCandidateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      setError('Update failed.');
    }
    setSaving(false);
  };

  // Thêm hàm chọn ảnh đại diện
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8},);
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', 'Unable to select image: ' + result.errorMessage);
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setSelectedImageData(selectedImage);
        setShowImagePreview(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Unable to select image');
    }
  };

  const handleConfirmImageUpload = async () => {
    if (!selectedImageData) return;
    
    setUploadingImage(true);
    try {
      // Hiển thị preview ngay lập tức
      setImage(selectedImageData.uri);
      
      // Upload avatar
      const formData = new FormData();
      formData.append('imageFile', {
        uri: selectedImageData.uri,
        type: selectedImageData.type || 'image/jpeg',
        name: selectedImageData.fileName || 'avatar.jpg'
      });
      
      await profileService.updateCandidateProfile(formData);
      
      // Đóng modal và reset state
      setShowImagePreview(false);
      setSelectedImageData(null);
      
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
      // Revert image nếu upload thất bại
      setImage(image);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelImageUpload = () => {
    setShowImagePreview(false);
    setSelectedImageData(null);
  };

  const locationText = [city, province].filter(Boolean).join(', ');

  // Helper function to map field names to navigation handlers
  const getFieldHandler = (field) => {
    const normalized = field.trim().toLowerCase().replace(/s$/, "");
    if (normalized === "education") return () => handleAddEducation();
    if (normalized === "skill") return () => navigation.navigate('AddSkill');
    if (normalized === "about me") return () => navigation.navigate('AboutMeEdit', { aboutMe: null });
    if (normalized === "work experience") return () => handleAddWorkExperience();
    if (normalized === "highlight project") return () => handleAddHighlightProject();
    if (normalized === "certificate") return () => handleAddCertificate();
    if (normalized === "award") return () => handleAddAward();
    if (normalized === "foreign language" || normalized === "foregin language") 
      return () => navigation.navigate('ForeignLanguageList');
    return null;
  };

  // Calculate profile completion percentage (fallback if API fails)
  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 0;

    // Personal Info (7 fields)
    total += 7;
    if (fullname) completed++;
    if (dob) completed++;
    if (gender) completed++;
    if (email) completed++;
    if (phone) completed++;
    if (address) completed++;
    if (city && province) completed++;

    // About Me
    total += 1;
    if (aboutMe?.aboutMeDescription) completed++;

    // Education
    total += 1;
    if (educations.length > 0) completed++;

    // Work Experience
    total += 1;
    if (workExperiences.length > 0) completed++;

    // Skills
    total += 1;
    // You can add skills check here when available

    // Awards
    total += 1;
    if (awards.length > 0) completed++;

    // Certificates
    total += 1;
    if (certificates.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  // Use profile strength from API, fallback to local calculation
  const profileCompletion = profileStrength.percentage || calculateProfileCompletion();

  const ProfileCompletionCard = () => {
    
    // Determine colors based on completion percentage
    let iconColor, percentageColor, progressColor, borderColor, message;
    
    if (profileCompletion < 30) {
      iconColor = "#dc2626"; // Red
      percentageColor = "#dc2626";
      progressColor = "#dc2626";
      borderColor = "#dc2626";
      message = "Your profile needs significant improvement. Complete more sections to increase your chances!";
    } else if (profileCompletion < 70) {
      iconColor = "#eab308"; // Yellow
      percentageColor = "#eab308";
      progressColor = "#eab308";
      borderColor = "#eab308";
      message = "Good progress! Complete your profile to increase your chances of getting hired!";
    } else {
      iconColor = "#16a34a"; // Green
      percentageColor = "#16a34a";
      progressColor = "#16a34a";
      borderColor = "#16a34a";
      message = "Excellent! Your profile is well-rounded and attractive to recruiters.";
    }

    return (
      <View style={[styles.completionCard, { borderLeftColor: borderColor }]}>
        <View style={styles.completionHeader}>
          <Icon name="account-check" size={20} color={iconColor} />
          <Text style={styles.completionTitle}>Profile Completion</Text>
          <Text style={[styles.completionPercentage, { color: percentageColor }]}>{profileCompletion}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${profileCompletion}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={styles.completionText}>
          {message}
        </Text>
      </View>
    );
  };

  // Create sections data for FlatList
  const sections = [
    { id: 'completion', type: 'completion' },
    { id: 'personal', type: 'personal' },
    { id: 'about', type: 'about' },
    { id: 'education', type: 'education' },
    { id: 'work', type: 'work' },
    { id: 'skills', type: 'skills' },
    { id: 'languages', type: 'languages' },
    { id: 'projects', type: 'projects' },
    { id: 'certificates', type: 'certificates' },
    { id: 'awards', type: 'awards' },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'completion':
        return <ProfileCompletionCard />;
      case 'personal':
        return (
        <PersonalInfoSection profile={{
          fullName: fullname,
          dob,
          gender,
          email,
          phone,
          address,
          city,
          province,
          jobTitle,
          personalLink
        }} />
        );
      case 'about':
        return (
        <AboutMeSection
          aboutMe={aboutMe}
          onEdit={handleEditAboutMe}
          loading={aboutMeLoading}
          onAdd={() => navigation.getParent()?.navigate('AboutMeEdit', { aboutMe: null })}
        />
        );
      case 'education':
        return (
        <EducationSection
          educations={educations}
          onAdd={handleAddEducation}
          onEdit={handleEditEducation}
          onDelete={handleDeleteEducation}
        />
        );
      case 'work':
        return (
        <WorkExperienceSection
          works={workExperiences}
          onAdd={handleAddWorkExperience}
          onEdit={handleEditWorkExperience}
          onDelete={handleDeleteWorkExperience}
        />
        );
      case 'skills':
        return <SkillsSection navigation={navigation} />;
      case 'languages':
        return <ForeignLanguageSection navigation={navigation} />;
      case 'projects':
        return (
        <HighlightProjectSection
          projects={highlightProjects}
          onAdd={handleAddHighlightProject}
          onEdit={handleEditHighlightProject}
          onDelete={handleDeleteHighlightProject}
        />
        );
      case 'certificates':
        return (
        <CertificateSection
          certificates={certificates}
          onAdd={handleAddCertificate}
          onEdit={handleEditCertificate}
          onDelete={handleDeleteCertificate}
        />
        );
      case 'awards':
        return (
        <AwardsSection
          awards={awards}
          onAdd={handleAddAward}
          onEdit={handleEditAward}
          onDelete={handleDeleteAward}
        />
        );
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={require('../../images/profile_header_bg.png')}
        style={[styles.headerWrapper, { paddingTop: (insets.top || 0) + 24 }]}
        imageStyle={styles.headerBgImg}
      >
      {/* Gradient overlay for better text readability */}
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.3)', 'rgba(37, 99, 235, 0.7)', 'rgba(37, 99, 235, 0.9)']}
        style={styles.gradientOverlay}
      />
      
              {/* Avatar with status indicator */}
        <View style={[styles.avatarWrapper, { top: (insets.top || 0) + 24, left: 16 }]}>  
        <Image
          source={image ? { uri: image } : require('../../images/banner-hero.jpg')}
          style={styles.avatar}
        />
        <View style={styles.onlineIndicator} />
      </View>
      <TouchableOpacity style={[styles.cameraIcon, { top: (insets.top || 0) + 24 + 58, left: 16 + 58 }]} onPress={handlePickImage}>
        <MaterialIcons name="camera-alt" size={16} color="#fff" />
      </TouchableOpacity>
      
              {/* Name & Location & Change image */}
        <View style={[styles.nameLocationWrapper, { top: (insets.top || 0) + 110, left: 16 }]}>  
        <Text style={styles.name}>{fullname}</Text>
        {locationText && (
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.location}>{locationText}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.changeImageBtn} onPress={handlePickImage}>
          <MaterialIcons name="edit" size={14} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.changeImageText}>Change image</Text>
        </TouchableOpacity>
      </View>
      
      </ImageBackground>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 12 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* <HeaderCandidate /> */}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ 
          paddingBottom: (insets.bottom || 0) + 64,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {renderHeader()}
        <View style={styles.contentContainer}>
          {sections.map((item) => (
            <View key={item.id} style={styles.sectionContainer}>
              {renderSection({ item })}
            </View>
          ))}
      </View>
    </ScrollView>

    {/* Image Preview Modal */}
    <Modal
      isVisible={showImagePreview}
      onBackdropPress={handleCancelImageUpload}
      style={styles.modal}
      backdropOpacity={0.8}
    >
      <View style={styles.imagePreviewSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.imagePreviewTitle}>Preview Avatar</Text>
        
        {selectedImageData && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: selectedImageData.uri }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </View>
        )}
        
        <View style={styles.imagePreviewActions}>
          <TouchableOpacity 
            style={[styles.imagePreviewBtn, styles.cancelBtn]} 
            onPress={handleCancelImageUpload}
            disabled={uploadingImage}
          >
            <Text style={styles.cancelBtnText}>CANCEL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.imagePreviewBtn, styles.confirmBtn, uploadingImage && styles.disabledBtn]} 
            onPress={handleConfirmImageUpload}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>CONFIRM</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerWrapper: {
    height: 440, // tăng chiều cao để background tím phủ hết phần header
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  headerBgImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarWrapper: {
    position: 'absolute',
    left: 28,
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50', // Green color for online
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  nameLocationWrapper: {
    position: 'absolute',
    left: 28,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  location: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 4,
  },

  changeImageBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  formWrapper: {
    alignSelf: 'center',
    marginTop: -140, // tăng giá trị âm để card nổi lên sát header tím
    marginBottom: 20,
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 22,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  label: {
    color: '#150a33',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12, // tăng thêm khoảng cách với input bên dưới
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#514a6b',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginTop: 0,
    marginBottom: 18, // tăng thêm khoảng cách với label tiếp theo
    fontWeight: '400',
  },
  genderRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 2,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 18,
    backgroundColor: '#fff',
  },
  genderOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  genderText: {
    color: '#514a6b',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioOuterActive: {
    borderColor: '#2563eb',
  },
  radioInnerActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffb237',
  },
  countryCodeBox: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 10,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  value: {
    color: '#514a6b',
    fontSize: 15,
    fontWeight: '400',
  },
  saveBtn: {
    height: 54,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
    alignSelf: 'center',
    width: '100%',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#150a33',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    color: '#514a6b',
    fontSize: 15,
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 10,
  },

  completionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: -60, // Đặt margin âm để card overlap với header
    elevation: 2,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#150b3d',
    marginLeft: 8,
  },
  completionPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  sectionContainer: {
    width: '100%',
    marginBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    width: '100%',
    marginBottom: -80, // Điều chỉnh overlap phù hợp với marginTop âm của completionCard
  },

  // Image Preview Modal Styles
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  imagePreviewSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 34,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 16,
  },
  imagePreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#150b3d',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#eee',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  imagePreviewBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  confirmBtn: {
    backgroundColor: '#2563eb',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 