import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ImageBackground, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import profileService from '../../services/profileService';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
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
      } catch (e) {
        setError('Unable to load profile information.');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Validate function
  const validate = () => {
    if (!fullname.trim()) return 'Fullname is required.';
    if (!dob.trim()) return 'Date of birth is required.';
    if (!gender.trim()) return 'Gender is required.';
    if (!email.trim()) return 'Email is required.';
    // Simple email regex
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
      // Nếu có upload ảnh, thêm imageFile vào formData
      // formData.append('imageFile', ...)
      await profileService.updateCandidateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      setError('Update failed.');
    }
    setSaving(false);
  };

  // Thêm hàm chọn ảnh đại diện
  const handlePickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8},);
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', 'Unable to select image: ' + result.errorMessage);
      return;
    }
    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      // Nếu muốn upload ngay, có thể gọi handleSave ở đây hoặc lưu file vào formData khi nhấn SAVE
    }
  };

  const locationText = [address, city, province].filter(Boolean).join(', ');

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 12 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: (insets.bottom || 0) + 64 }}>
      {/* Header with image background */}
      <ImageBackground
        source={require('../../images/profile_header_bg.png')}
        style={[styles.headerWrapper, { width: SCREEN_WIDTH, paddingTop: (insets.top || 0) + 24 }]}
        imageStyle={styles.headerBgImg}
      >
        {/* Avatar */}
        <View style={[styles.avatarWrapper, { top: (insets.top || 0) + 24 }]}> 
          <Image
            source={image ? { uri: image } : require('../../images/banner-hero.jpg')}
            style={styles.avatar}
          />
        </View>
        {/* Name & Location & Change image */}
        <View style={[styles.nameLocationWrapper, { top: (insets.top || 0) + 110 }]}> 
          <Text style={styles.name}>{fullname}</Text>
          <Text style={styles.location}>{locationText}</Text>
          <TouchableOpacity style={styles.changeImageBtn} onPress={handlePickImage}>
            <Text style={styles.changeImageText}>Change image</Text>
          </TouchableOpacity>
        </View>
        {/* Settings & Share icons */}
        <TouchableOpacity style={styles.iconSetting}>
          <MaterialIcons name="settings" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconShare}>
          <MaterialIcons name="share" size={26} color="#fff" />
        </TouchableOpacity>
      </ImageBackground>
      {/* Form fields */}
      <View style={[styles.formWrapper, { width: SCREEN_WIDTH - 32 }]}> 
        {/* Fullname */}
        <View style={styles.card}>
          <Text style={styles.label}>Fullname</Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Fullname"
            placeholderTextColor="#bcbcbc"
          />
        </View>
        {/* Date of birth */}
        <View style={styles.card}>
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
        </View>
        {/* Gender */}
        <View style={styles.card}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity style={[styles.genderOption, gender === 'Male' && styles.genderOptionActive]} onPress={() => setGender('Male')}>
              <View style={[styles.radioOuter, gender === 'Male' && styles.radioOuterActive]}>
                {gender === 'Male' && <View style={styles.radioInnerActive} />}
              </View>
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderOption, gender === 'Female' && styles.genderOptionActive]} onPress={() => setGender('Female')}>
              <View style={[styles.radioOuter, gender === 'Female' && styles.radioOuterActive]}>
                {gender === 'Female' && <View style={styles.radioInnerActive} />}
              </View>
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Email address */}
        <View style={styles.card}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            editable={false}
            placeholder="Email address"
            placeholderTextColor="#bcbcbc"
            keyboardType="email-address"
          />
        </View>
        {/* Phone number */}
        <View style={styles.card}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#bcbcbc"
            keyboardType="phone-pad"
          />
        </View>
        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            placeholderTextColor="#bcbcbc"
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#bcbcbc"
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Province</Text>
          <TextInput
            style={styles.input}
            value={province}
            onChangeText={setProvince}
            placeholder="Province"
            placeholderTextColor="#bcbcbc"
          />
        </View>
      </View>
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <TouchableOpacity style={[styles.saveBtn, { width: SCREEN_WIDTH - 64, opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SAVE</Text>}
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 8, // giảm khoảng cách phía dưới header
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerBgImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  location: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 0,
  },
  iconSetting: {
    position: 'absolute',
    top: 28,
    right: 28,
  },
  iconShare: {
    position: 'absolute',
    top: 28,
    right: 70,
  },
  changeImageBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  formWrapper: {
    alignSelf: 'center',
    marginTop: -140, // giảm khoảng cách phía trên form
    marginBottom: 20,
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
    marginBottom: 10,
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
    marginTop: 2,
    marginBottom: 0,
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
    backgroundColor: '#130160',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
}); 