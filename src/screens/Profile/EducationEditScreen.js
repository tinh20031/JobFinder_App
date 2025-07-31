import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import profileService from '../../services/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EducationEditScreen({ route, navigation }) {
  const { education, mode } = route.params || {};
  // Helper parse DateTime string to month/year
  function getMonth(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return (d.getMonth() + 1);
  }
  function getYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.getFullYear();
  }
  const [level, setLevel] = useState(education?.degree || '');
  const [school, setSchool] = useState(education?.school || '');
  const [major, setMajor] = useState(education?.major || '');
  const [monthStart, setMonthStart] = useState(getMonth(education?.monthStart));
  const [yearStart, setYearStart] = useState(getYear(education?.monthStart));
  const [monthEnd, setMonthEnd] = useState(getMonth(education?.monthEnd));
  const [yearEnd, setYearEnd] = useState(getYear(education?.monthEnd));
  const [isStudying, setIsStudying] = useState(education?.isStudying || false);
  const [description, setDescription] = useState(education?.detail || '');
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'back' | 'save' | 'remove' | null
  const [removing, setRemoving] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    let endBeforeStart = false;
    
    if (!level.trim()) newErrors.level = 'Degree is required.';
    if (!school.trim()) newErrors.school = 'School is required.';
    if (!major.trim()) newErrors.major = 'Major is required.';
    if (!monthStart) newErrors.monthStart = 'Start month is required.';
    if (!yearStart) newErrors.yearStart = 'Start year is required.';
    
    if (!isStudying) {
      if (!monthEnd) newErrors.monthEnd = 'End month is required.';
      if (!yearEnd) newErrors.yearEnd = 'End year is required.';
      
      // Validate end > start
      if (monthStart && yearStart && monthEnd && yearEnd) {
        const start = new Date(`${yearStart}-${monthStart}-01T00:00:00.000Z`);
        const end = new Date(`${yearEnd}-${monthEnd}-01T00:00:00.000Z`);
        if (end <= start) {
          endBeforeStart = true;
        }
      }
    }
    
    if (endBeforeStart) {
      newErrors.dateRange = 'Please enter an end date bigger than the start date.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setModalType('save');
  };



  const handleModalMainAction = async () => {
    if (modalType === 'back') {
      setModalType(null);
      navigation.goBack();
    } else if (modalType === 'save') {
      setModalType(null);
      await handleSaveMain();
    }
  };

  const handleSaveMain = async () => {
    // Validate required fields
    if (!level || !school || !major || !monthStart || !yearStart) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    // Validate end date if not currently studying
    if (!isStudying && (!monthEnd || !yearEnd)) {
      Alert.alert('Error', 'Please fill in end date or check "I am currently studying".');
      return;
    }

    // Validate date range
    if (!isStudying && monthStart && yearStart && monthEnd && yearEnd) {
      const start = new Date(`${yearStart}-${monthStart}-01T00:00:00.000Z`);
      const end = new Date(`${yearEnd}-${monthEnd}-01T00:00:00.000Z`);
      if (end <= start) {
        Alert.alert('Error', 'Please enter an end date bigger than the start date.');
        return;
      }
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }

      // Format dates safely - similar to web version
      const toISO = (y, m) => (y && m ? `${y}-${m.toString().padStart(2, '0')}-01T00:00:00.000Z` : null);

      const educationData = {
        educationId: education?.educationId || 0,
        candidateProfileId: education?.candidateProfileId || 0,
        degree: level,
        school: school,
        major: major,
        isStudying: isStudying,
        monthStart: toISO(yearStart, monthStart),
        yearStart: toISO(yearStart, monthStart),
        monthEnd: isStudying ? null : toISO(yearEnd, monthEnd),
        yearEnd: isStudying ? null : toISO(yearEnd, monthEnd),
        detail: description,
        createdAt: education?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (mode === 'edit') {
        await profileService.updateEducation(education.educationId, educationData, token);
      } else {
        await profileService.createEducation(educationData, token);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving education:', error);
      Alert.alert('Error', 'Failed to save education. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    setModalType('remove');
  };

  const handleRemoveConfirm = async () => {
    setRemoving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }
      await profileService.deleteEducation(education.educationId, token);
      navigation.goBack();
    } catch (error) {
      console.error('Error removing education:', error);
      Alert.alert('Error', 'Failed to remove education. Please try again.');
    } finally {
      setRemoving(false);
      setModalType(null);
    }
  };

  const getInputStyle = (fieldName) => {
    const hasError = errors[fieldName] || (touched[fieldName] && !getFieldValue(fieldName));
    const hasValue = getFieldValue(fieldName);
    
    if (hasError) return [styles.input, styles.inputError];
    if (hasValue && touched[fieldName]) return [styles.input, styles.inputSuccess];
    return styles.input;
  };

  const getFieldValue = (fieldName) => {
    switch (fieldName) {
      case 'level': return level;
      case 'school': return school;
      case 'major': return major;
      default: return '';
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

    return (
    <View style={styles.container}>
      <Text style={styles.header}>Education</Text>
      <ScrollView  
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Tips Section - tương tự Work Experience */}
          <View style={styles.tipsContainer}>
            <Icon name="lightbulb-outline" size={20} color="#1967d2" style={{ marginRight: 8 }} />
            <Text style={styles.tipsText}>
              <Text style={styles.tipsBold}>Tips:</Text> Include your highest level of education, relevant coursework, and any academic achievements that showcase your skills and knowledge.
            </Text>
          </View>

          <Text style={styles.label}>
            Degree <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={getInputStyle('level')} 
            value={level} 
            onChangeText={setLevel} 
            onBlur={() => handleFieldBlur('level')}
          />
          {errors.level && <Text style={styles.errorText}>{errors.level}</Text>}
          
          <Text style={styles.label}>
            School <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={getInputStyle('school')} 
            value={school} 
            onChangeText={setSchool} 
            onBlur={() => handleFieldBlur('school')}
          />
          {errors.school && <Text style={styles.errorText}>{errors.school}</Text>}
          
          <Text style={styles.label}>
            Major <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={getInputStyle('major')} 
            value={major} 
            onChangeText={setMajor} 
            onBlur={() => handleFieldBlur('major')}
          />
          {errors.major && <Text style={styles.errorText}>{errors.major}</Text>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>
                Start month <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={monthStart || ''}
                  onValueChange={(value) => setMonthStart(value === '' ? '' : value)}
                  style={styles.picker}
                  dropdownIconColor="#514a6b"
                >
                  <Picker.Item label="Month" value="" />
                  {[...Array(12)].map((_, i) => (
                    <Picker.Item key={i+1} label={`${i+1}`} value={i+1} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>
                Start year <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={yearStart || ''}
                  onValueChange={(value) => setYearStart(value === '' ? '' : value)}
                  style={styles.picker}
                  dropdownIconColor="#514a6b"
                >
                  <Picker.Item label="Year" value="" />
                  {Array.from({length: 50}, (_, i) => 1980 + i).map(y => (
                    <Picker.Item key={y} label={`${y}`} value={y} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          {!isStudying && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>End month</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={monthEnd || ''}
                    onValueChange={(value) => setMonthEnd(value === '' ? '' : value)}
                    style={styles.picker}
                    dropdownIconColor="#514a6b"
                  >
                    <Picker.Item label="Month" value="" />
                    {[...Array(12)].map((_, i) => (
                      <Picker.Item key={i+1} label={`${i+1}`} value={i+1} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>End year</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={yearEnd || ''}
                    onValueChange={(value) => setYearEnd(value === '' ? '' : value)}
                    style={styles.picker}
                    dropdownIconColor="#514a6b"
                  >
                    <Picker.Item label="Year" value="" />
                    {Array.from({length: 50}, (_, i) => 1980 + i).map(y => (
                      <Picker.Item key={y} label={`${y}`} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          )}
          <View style={styles.rowBetween}>
            <Switch value={isStudying} onValueChange={setIsStudying} />
            <Text style={styles.switchLabel}>I am currently studying</Text>
          </View>
          <Text style={styles.label}>Additional detail (Optional)</Text>
          <TextInput
            style={styles.textarea}
            multiline
            placeholder="Write additional information here"
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <View style={styles.actionRow}>
            {mode === 'edit' && education?.educationId && (
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} disabled={removing}>
                <Text style={styles.removeBtnText}>REMOVE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Modal xác nhận */}
      <Modal
        isVisible={modalType !== null}
        onBackdropPress={() => setModalType(null)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {modalType === 'back' ? 'Undo Changes ?' : modalType === 'remove' ? 'Remove Education ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to change what you entered?'
              : modalType === 'remove'
              ? 'Are you sure you want to delete this education?'
              : 'Are you sure you want to save what you entered?'}
          </Text>
          {modalType === 'remove' ? (
            <>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleRemoveConfirm}>
                <Text style={styles.sheetBtnUndoText}>REMOVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnText}>CONTINUE FILLING</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleModalMainAction}>
                <Text style={styles.sheetBtnUndoText}>{modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnText}>CONTINUE FILLING</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', paddingTop: 24 },
  scrollView: { flex: 1, width: '100%' },
  header: { fontWeight: 'bold', fontSize: 20, color: '#150b3d', marginTop: 8, marginBottom: 16, alignSelf: 'center' },
  scrollContent: { alignItems: 'center', paddingBottom: 20 },


  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1967d2',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  tipsText: { fontSize: 15, color: '#222', flex: 1 },
  tipsBold: { fontWeight: 'bold' },
  label: { fontWeight: '600', fontSize: 15, color: '#222', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, fontSize: 16, color: '#222', borderWidth: 1.5, borderColor: '#ddd', marginBottom: 0, fontWeight: '400' },
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
  errorText: {
    color: '#e60023',
    marginTop: 4,
    fontSize: 13,
    marginBottom: 8,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  switchLabel: { marginLeft: 12, color: '#514a6b', fontSize: 14 },
  textarea: { minHeight: 100, maxHeight: 200, backgroundColor: '#f8f8f8', borderRadius: 8, padding: 14, fontSize: 15, color: '#514a6b', borderWidth: 1, borderColor: '#eee', textAlignVertical: 'top', marginTop: 0 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 },
  removeBtn: { flex: 1, backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginRight: 6 },
  removeBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginLeft: 6,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
  pickerWrapper: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 18,
    justifyContent: 'center',
    height: 44,
    paddingVertical: 0,
  },
  picker: {
    color: '#514a6b',
    fontSize: 10,
    height: 56,
    textAlignVertical: 'center',
    // paddingHorizontal: 16, // tuỳ platform
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 12 },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 0,
  },
  sheetBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
  sheetBtnUndo: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 12,
  },
  sheetBtnUndoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
}); 