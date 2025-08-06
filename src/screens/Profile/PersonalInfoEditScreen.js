import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import profileService from '../../services/profileService';
import locationService from '../../services/locationService';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PersonalInfoEditScreen({ route }) {
  const navigation = useNavigation();
  const [fullname, setFullname] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [personalLink, setPersonalLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalType, setModalType] = useState(null); // 'save' | 'back' | null
  const [initialProfile, setInitialProfile] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
    loadProvinces();
  }, []);

  useEffect(() => {
    if (province && provinces.length > 0) {
      loadCities(province);
    }
  }, [province, provinces, loadCities]);

  const loadProfile = async () => {
    try {
          const profile = await profileService.getCandidateProfile();
      
      setFullname(profile.fullName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setGender(profile.gender || '');
      setDob(profile.dob ? profile.dob.substring(0, 10) : '');
      setProvince(profile.province || '');
      setCity(profile.city || '');
      setJobTitle(profile.jobTitle || '');
      setPersonalLink(profile.personalLink || '');
      setInitialProfile({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        gender: profile.gender || '',
        dob: profile.dob ? profile.dob.substring(0, 10) : '',
        province: profile.province || '',
        city: profile.city || '',
        jobTitle: profile.jobTitle || '',
        personalLink: profile.personalLink || '',
      });
    } catch (e) {
      console.error('PersonalInfoEditScreen - Error loading profile:', e);
      setError('Unable to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const provincesData = await locationService.getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadCities = useCallback(async (provinceName) => {
    try {
      // Tìm province code từ tên province
      const selectedProvince = provinces.find(p => p.name === provinceName);
      if (selectedProvince) {
        // Sử dụng getWards thay vì getDistricts vì API mới trả về wards
        const citiesData = await locationService.getWards(selectedProvince.province_code || selectedProvince.code);
        setCities(citiesData);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    }
  }, [provinces]);

  const hasChanged = () => {
    if (!initialProfile) return false;
    return (
      fullname !== initialProfile.fullName ||
      email !== initialProfile.email ||
      phone !== initialProfile.phone ||
      address !== initialProfile.address ||
      gender !== initialProfile.gender ||
      dob !== initialProfile.dob ||
      province !== initialProfile.province ||
      city !== initialProfile.city ||
      jobTitle !== initialProfile.jobTitle ||
      personalLink !== initialProfile.personalLink
    );
  };



  // Validate function
  const validate = () => {
    const newErrors = {};
    
    if (!fullname.trim()) newErrors.fullname = 'Full name is required.';
    if (!jobTitle.trim()) newErrors.jobTitle = 'Job title is required.';
    if (!phone.trim()) newErrors.phone = 'Phone is required.';
    if (!dob || dob.trim() === '') newErrors.dob = 'Date of birth is required.';
    if (!province.trim()) newErrors.province = 'Province is required.';
    if (!city.trim()) newErrors.city = 'City is required.';
    
    // Email validation (optional but if provided must be valid)
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Invalid email format.';
    }
    
    // Phone validation
    if (phone.trim() && !/^[0-9]{8,}$/.test(phone)) {
      newErrors.phone = 'Invalid phone number.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    setError('');
    const isValid = validate();
    if (!isValid) {
      return;
    }
    setModalType('save');
  };

  const handleModalMainAction = async () => {
    if (modalType === 'back') {
      setModalType(null);
      navigation.goBack();
    } else if (modalType === 'save') {
      setModalType(null);
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
        formData.append('Email', email);
        formData.append('JobTitle', jobTitle);
        formData.append('PersonalLink', personalLink);
        
        await profileService.updateCandidateProfile(formData);
        navigation.goBack();
      } catch (e) {
        console.error('PersonalInfoEditScreen - Save error:', e);
        setError('Update failed.');
      }
      setSaving(false);
    }
  };

  // Helper function to get input style based on validation state
  const getInputStyle = (fieldName) => {
    const hasError = errors[fieldName] || (touched[fieldName] && !getFieldValue(fieldName)?.trim());
    const hasValue = getFieldValue(fieldName)?.trim();
    
    return [
      styles.input,
      hasError && styles.inputError,
      hasValue && !hasError && touched[fieldName] && styles.inputSuccess
    ];
  };

  const getFieldValue = (fieldName) => {
    switch (fieldName) {
      case 'fullname': return fullname;
      case 'jobTitle': return jobTitle;
      case 'phone': return phone;
      case 'email': return email;
      case 'dob': return dob;
      case 'province': return province;
      case 'city': return city;
      default: return '';
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 12 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Personal Info</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Fullname */}
          <Text style={styles.label}>
            Full name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={getInputStyle('fullname')}
            value={fullname}
            onChangeText={setFullname}
            onBlur={() => handleFieldBlur('fullname')}
            placeholder="Enter your full name"
            placeholderTextColor="#bcbcbc"
          />
          {errors.fullname && <Text style={styles.errorText}>{errors.fullname}</Text>}

          {/* Job Title */}
          <Text style={styles.label}>
            Job Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={getInputStyle('jobTitle')}
            value={jobTitle}
            onChangeText={setJobTitle}
            onBlur={() => handleFieldBlur('jobTitle')}
            placeholder="Enter your job title"
            placeholderTextColor="#bcbcbc"
          />
          {errors.jobTitle && <Text style={styles.errorText}>{errors.jobTitle}</Text>}

          {/* Date of birth */}
          <Text style={styles.label}>
            Date of Birth <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[getInputStyle('dob')[0], { flex: 1 }]}
                value={dob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#bcbcbc"
                editable={false}
                pointerEvents="none"
              />
              <MaterialIcons name="calendar-today" size={22} color="#514a6b" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={dob ? new Date(dob) : new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const yyyy = selectedDate.getFullYear();
                  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const dd = String(selectedDate.getDate()).padStart(2, '0');
                  setDob(`${yyyy}-${mm}-${dd}`);
                }
              }}
            />
          )}

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'Male' && styles.genderOptionActive]} 
              onPress={() => setGender('Male')}
            >
              <View style={[styles.radioOuter, gender === 'Male' && styles.radioOuterActive]}>
                {gender === 'Male' && <View style={styles.radioInnerActive} />}
              </View>
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'Female' && styles.genderOptionActive]} 
              onPress={() => setGender('Female')}
            >
              <View style={[styles.radioOuter, gender === 'Female' && styles.radioOuterActive]}>
                {gender === 'Female' && <View style={styles.radioInnerActive} />}
              </View>
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Email address */}
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[getInputStyle('email')[0], styles.disabledInput]}
            value={email}
            onChangeText={setEmail}
            onBlur={() => handleFieldBlur('email')}
            placeholder="Enter your email"
            placeholderTextColor="#bcbcbc"
            keyboardType="email-address"
            editable={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Province */}
          <Text style={styles.label}>
            Current province/city <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity 
            style={getInputStyle('province')[0]} 
            onPress={() => setShowProvincePicker(true)}
          >
            <Text style={[styles.inputText, !province && styles.placeholderText]}>
              {province || 'Select province'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#514a6b" />
          </TouchableOpacity>
          {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}

          {/* City */}
          <Text style={styles.label}>
            Award <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity 
            style={[getInputStyle('city')[0], !province && styles.disabledInput]} 
            onPress={() => province && setShowCityPicker(true)}
            disabled={!province}
          >
            <Text style={[styles.inputText, !city && styles.placeholderText]}>
              {city || 'Select city'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#514a6b" />
          </TouchableOpacity>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          {/* Address */}
          <Text style={styles.label}>Address (Street, district,...)</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            placeholderTextColor="#bcbcbc"
          />

          {/* Personal Link */}
          <Text style={styles.label}>Personal Link</Text>
          <TextInput
            style={styles.input}
            value={personalLink}
            onChangeText={setPersonalLink}
            placeholder="LinkedIn, portfolio, website..."
            placeholderTextColor="#bcbcbc"
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Phone number */}
          <Text style={styles.label}>
            Phone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={getInputStyle('phone')}
            value={phone}
            onChangeText={setPhone}
            onBlur={() => handleFieldBlur('phone')}
            placeholder="Enter your phone"
            placeholderTextColor="#bcbcbc"
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave} 
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SAVE</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Province Picker Modal */}
      <Modal
        isVisible={showProvincePicker}
        onBackdropPress={() => setShowProvincePicker(false)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select Province</Text>
          <ScrollView style={styles.pickerList}>
            {provinces.map((provinceItem) => (
              <TouchableOpacity
                key={provinceItem.code || provinceItem.id}
                style={styles.pickerItem}
                onPress={() => {
                  setProvince(provinceItem.name);
                  setCity(''); // Reset city when province changes
                  setShowProvincePicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{provinceItem.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => setShowProvincePicker(false)}
          >
            <Text style={styles.sheetBtnUndoText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        isVisible={showCityPicker}
        onBackdropPress={() => setShowCityPicker(false)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select City</Text>
          <ScrollView style={styles.pickerList}>
            {cities.map((cityItem) => (
              <TouchableOpacity
                key={cityItem.code || cityItem.id}
                style={styles.pickerItem}
                onPress={() => {
                  setCity(cityItem.name);
                  setShowCityPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{cityItem.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => setShowCityPicker(false)}
          >
            <Text style={styles.sheetBtnUndoText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal xác nhận SAVE hoặc BACK */}
      <Modal
        isVisible={modalType !== null}
        onBackdropPress={() => setModalType(null)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {modalType === 'back' ? 'Undo Changes ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to change what you entered?'
              : 'Are you sure you want to save what you entered?'}
          </Text>
          <TouchableOpacity style={styles.sheetBtn} onPress={handleModalMainAction}>
            <Text style={styles.sheetBtnText}>{modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtnUndo} onPress={() => setModalType(null)}>
            <Text style={styles.sheetBtnUndoText}>CONTINUE FILLING</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    paddingTop: 24,
  },

  header: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#150b3d',
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, alignSelf: 'center', borderWidth: 1, borderColor: '#eee' },
  label: { fontWeight: '600', fontSize: 15, color: '#222', marginBottom: 6, marginTop: 12 },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingVertical: 12, 
    paddingHorizontal: 14, 
    fontSize: 16, 
    color: '#222', 
    borderWidth: 1.5, 
    borderColor: '#ddd', 
    marginBottom: 0, 
    fontWeight: '400',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  inputText: {
    fontSize: 15,
    color: '#514a6b',
    fontWeight: '400',
    flex: 1
  },
  placeholderText: {
    color: '#bcbcbc'
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 18,
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
    backgroundColor: '#2563eb',
  },
  errorText: {
    color: '#e60023',
    marginTop: 4,
    fontSize: 13,
    marginBottom: 8,
  },
  required: {
    color: '#e60023',
  },
  inputError: {
    borderColor: '#e60023',
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  inputFocus: {
    borderColor: '#1967d2',
    borderWidth: 1.5,
  },
  saveBtn: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginTop: 24, alignSelf: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 12 },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  sheetBtn: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 12 },
  sheetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sheetBtnUndo: { width: '100%', backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 0 },
  sheetBtnUndoText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  pickerList: {
    maxHeight: 300,
    marginBottom: 16
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 0
  },
  pickerItemText: {
    fontSize: 16,
    color: '#514a6b',
    textAlign: 'center',
    fontWeight: '500'
  },
}); 