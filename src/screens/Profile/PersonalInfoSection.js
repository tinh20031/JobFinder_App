import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export default function PersonalInfoSection({ profile }) {
  const navigation = useNavigation();

  const handleEdit = () => {
    navigation.navigate('PersonalInfoEdit');
  };

  const InfoField = ({ icon, label, value, placeholder }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
                    <Icon name={icon} size={16} color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <TextInput
        style={styles.fieldInput}
        value={value || ''}
        editable={false}
        placeholder={placeholder}
        placeholderTextColor="#bcbcbc"
      />
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="account-circle-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Personal Information</Text>
        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                      <Icon name="pencil" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      
      <View style={styles.fieldsGrid}>
        <InfoField 
          icon="account" 
          label="Full Name" 
          value={profile?.fullName} 
          placeholder="Enter your full name"
        />
        <InfoField 
          icon="briefcase" 
          label="Job Title" 
          value={profile?.jobTitle} 
          placeholder="Enter your job title"
        />
        <InfoField 
          icon="calendar" 
          label="Date of Birth" 
          value={profile?.dob ? profile.dob.substring(0, 10) : ''} 
          placeholder="YYYY-MM-DD"
        />
        <InfoField 
          icon="email" 
          label="Email Address" 
          value={profile?.email} 
          placeholder="Enter your email"
        />
        <InfoField 
          icon="phone" 
          label="Phone Number" 
          value={profile?.phone} 
          placeholder="Enter your phone number"
        />
        <InfoField 
          icon="map" 
          label="Province" 
          value={profile?.province} 
          placeholder="Enter your province"
        />
        <InfoField 
          icon="city" 
          label="Award/Commune" 
          value={profile?.city} 
          placeholder="Enter your award/commune"
        />
        <InfoField 
          icon="map-marker" 
          label="Address" 
          value={profile?.address} 
          placeholder="Enter your address"
        />
        <InfoField 
          icon="link" 
          label="Personal Link" 
          value={profile?.personalLink} 
          placeholder="LinkedIn, portfolio, website..."
        />
      </View>

      {/* Gender Selection */}
      <View style={styles.genderSection}>
        <View style={styles.fieldHeader}>
                      <Icon name="gender-male-female" size={16} color="#2563eb" style={{ marginRight: 8 }} />
          <Text style={styles.fieldLabel}>Gender</Text>
        </View>
        <View style={styles.genderRow}> 
          <View style={[styles.genderOption, profile?.gender === 'Male' && styles.genderOptionActive]}
            pointerEvents="none"
          >
            <View style={[styles.radioOuter, profile?.gender === 'Male' && styles.radioOuterActive]}>
              {profile?.gender === 'Male' && <View style={styles.radioInnerActive} />}
            </View>
            <Text style={styles.genderText}>Male</Text>
          </View>
          <View style={[styles.genderOption, profile?.gender === 'Female' && styles.genderOptionActive]}
            pointerEvents="none"
          >
            <View style={[styles.radioOuter, profile?.gender === 'Female' && styles.radioOuterActive]}>
              {profile?.gender === 'Female' && <View style={styles.radioInnerActive} />}
            </View>
            <Text style={styles.genderText}>Female</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: '#150b3d',
    flex: 1,
    fontFamily: 'Poppins-Bold',
  },
  editBtn: {
    padding: 4,
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  fieldsGrid: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#150a33',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
    fontFamily: 'Poppins-SemiBold',
  },
  fieldInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#514a6b',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  genderSection: {
    marginTop: 8,
  },
  genderRow: {
    flexDirection: 'row',
    marginTop: 8,
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
    fontFamily: 'Poppins-Medium',
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
    backgroundColor: '#2563eb',
  },
}); 