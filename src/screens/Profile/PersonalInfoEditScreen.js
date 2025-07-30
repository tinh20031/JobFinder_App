import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import profileService from '../../services/profileService';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalType, setModalType] = useState(null); // 'save' | 'back' | null
  const [initialProfile, setInitialProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

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
      setInitialProfile({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        gender: profile.gender || '',
        dob: profile.dob ? profile.dob.substring(0, 10) : '',
        province: profile.province || '',
        city: profile.city || '',
      });
    } catch (e) {
      setError('Unable to load profile information.');
    } finally {
      setLoading(false);
    }
  };

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
      city !== initialProfile.city
    );
  };

  const handleBack = () => {
    if (hasChanged()) {
      setModalType('back');
    } else {
      navigation.goBack();
    }
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

  const handleSave = () => {
    setError('');
    const err = validate();
    if (err) {
      setError(err);
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
        await profileService.updateCandidateProfile(formData);
        navigation.goBack();
      } catch (e) {
        setError('Update failed.');
      }
      setSaving(false);
    }
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
      {/* Back button và tiêu đề giống AddLanguageScreen */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <MaterialIcons name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>
      <Text style={styles.header}>Edit Personal Info</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Fullname */}
          <Text style={styles.label}>Fullname</Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Fullname"
            placeholderTextColor="#bcbcbc"
          />

          {/* Date of birth */}
          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={dob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#bcbcbc"
                editable={false}
                pointerEvents="none"
              />
              <MaterialIcons name="calendar-today" size={22} color="#514a6b" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
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
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#bcbcbc"
            keyboardType="email-address"
          />

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            placeholderTextColor="#bcbcbc"
          />

          {/* City */}
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#bcbcbc"
          />

          {/* Province */}
          <Text style={styles.label}>Province</Text>
          <TextInput
            style={styles.input}
            value={province}
            onChangeText={setProvince}
            placeholder="Province"
            placeholderTextColor="#bcbcbc"
          />

          {/* Phone number */}
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#bcbcbc"
            keyboardType="phone-pad"
          />

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
  backBtn: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#150b3d',
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, alignSelf: 'center', borderWidth: 1, borderColor: '#eee' },
  label: { fontWeight: '500', fontSize: 14, color: '#150b3d', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#f8f8f8', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, fontSize: 15, color: '#514a6b', borderWidth: 1, borderColor: '#eee', marginBottom: 0, fontWeight: '400' },
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
    borderColor: '#ff9228',
    backgroundColor: '#fff7ed',
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
    borderColor: '#ff9228',
  },
  radioInnerActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffb237',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  saveBtn: { width: '100%', backgroundColor: '#130160', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginTop: 24, alignSelf: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 12 },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  sheetBtn: { width: '100%', backgroundColor: '#130160', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 12 },
  sheetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sheetBtnUndo: { width: '100%', backgroundColor: '#d6cdfe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 0 },
  sheetBtnUndoText: { color: '#130160', fontWeight: 'bold', fontSize: 16 },
}); 