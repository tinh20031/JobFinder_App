import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate months and years arrays
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function AwardEditScreen({ route, navigation }) {
  const { award, mode } = route.params || {};
  const [awardName, setAwardName] = useState(award?.awardName || '');
  const [awardOrganization, setAwardOrganization] = useState(award?.awardOrganization || '');
  const [selectedMonth, setSelectedMonth] = useState(award?.month ? award.month.slice(5, 7) : '');
  const [selectedYear, setSelectedYear] = useState(award?.year ? award.year.slice(0, 4) : '');
  const [awardDescription, setAwardDescription] = useState(award?.awardDescription || '');
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'back' | 'save' | 'remove' | null
  const [removing, setRemoving] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function - tương tự web version
  const validateForm = () => {
    const newErrors = {};
    
    if (!awardName.trim()) {
      newErrors.awardName = 'Award Name is required.';
    }
    
    if (!selectedMonth) {
      newErrors.month = 'Month is required.';
    }
    
    if (!selectedYear) {
      newErrors.year = 'Year is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setModalType('save');
    }
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
    if (!validateForm()) {
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Format data theo BE expectation - tương tự web version
      const toISO = (y, m) => (y && m ? `${y}-${m}-01T00:00:00.000Z` : null);
      
      const data = {
        AwardName: awardName.trim(),
        AwardOrganization: awardOrganization.trim() || null,
        Month: toISO(selectedYear, selectedMonth),
        Year: toISO(selectedYear, selectedMonth),
        AwardDescription: awardDescription.trim() || null,
      };
      
      if (mode === 'edit' && award?.awardId) {
        await profileService.updateAward(award.awardId, data, token);
      } else {
        await profileService.createAward(data, token);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save award.\n' + (e.message || ''));
    }
    setSaving(false);
  };

  const handleRemove = () => setModalType('remove');
  const handleRemoveConfirm = async () => {
    setModalType(null);
    setRemoving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await profileService.deleteAward(award.awardId, token);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to remove award.');
    }
    setRemoving(false);
  };

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  };

  const handleInputChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  const handleInputBlur = (field) => {
    setTouched({...touched, [field]: true});
  };

    return (
    <View style={styles.container}>
      <Text style={styles.header}>{mode === 'edit' ? 'Edit Award' : 'Add Award'}</Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tips Section - tương tự web version */}
          <View style={styles.tipsContainer}>
            <Icon name="lightbulb-outline" size={20} color="#ffc107" style={{ marginRight: 8 }} />
            <Text style={styles.tipsText}>
              <Text style={styles.tipsBold}>Tips:</Text> Share your achievements and recognitions that demonstrate your skills and capabilities.
            </Text>
          </View>

          <Text style={styles.label}>Award Name <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[
              styles.input, 
              (errors.awardName || (touched.awardName && !awardName.trim())) && styles.inputError,
              awardName.trim() && styles.inputValid
            ]} 
            value={awardName} 
            onChangeText={(text) => handleInputChange('awardName', text, setAwardName)}
            onBlur={() => handleInputBlur('awardName')}
          />
          {(errors.awardName || (touched.awardName && !awardName.trim())) && (
            <Text style={styles.errorText}>Please enter your award name</Text>
          )}

          <Text style={styles.label}>Award Organization (Optional)</Text>
          <TextInput 
            style={styles.input} 
            value={awardOrganization} 
            onChangeText={(text) => handleInputChange('awardOrganization', text, setAwardOrganization)}
          />

          <Text style={styles.label}>Issue Date <Text style={styles.required}>*</Text></Text>
          <View style={styles.dateRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMonth || ''}
                onValueChange={(value) => {
                  setSelectedMonth(value === '' ? '' : value);
                  if (errors.month) {
                    setErrors({...errors, month: null});
                  }
                }}
                style={styles.picker}
                dropdownIconColor="#514a6b"
              >
                <Picker.Item label="Month" value="" />
                {months.map((month) => (
                  <Picker.Item key={month} label={month} value={month} />
                ))}
              </Picker>
            </View>
            
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedYear || ''}
                onValueChange={(value) => {
                  setSelectedYear(value === '' ? '' : value);
                  if (errors.year) {
                    setErrors({...errors, year: null});
                  }
                }}
                style={styles.picker}
                dropdownIconColor="#514a6b"
              >
                <Picker.Item label="Year" value="" />
                {years.map((year) => (
                  <Picker.Item key={year} label={year} value={year} />
                ))}
              </Picker>
            </View>
          </View>
          
          {(errors.month || (touched.month && !selectedMonth)) && (
            <Text style={styles.errorText}>Please select month</Text>
          )}
          {(errors.year || (touched.year && !selectedYear)) && (
            <Text style={styles.errorText}>Please select year</Text>
          )}

          <Text style={styles.label}>Award Description (Optional)</Text>
          <TextInput
            style={styles.textarea}
            value={awardDescription}
            onChangeText={setAwardDescription}
            multiline
            scrollEnabled
          />
          <Text style={styles.charCounter}>
            {awardDescription.length}/2500
          </Text>

          <View style={styles.actionRow}>
            {mode === 'edit' && award?.awardId && (
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} disabled={removing}>
                {removing ? (
                  <ActivityIndicator size="small" color="#130160" />
                ) : (
                  <Text style={styles.removeBtnText}>REMOVE</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>SAVING...</Text>
                </View>
              ) : (
                <Text style={styles.saveBtnText}>SAVE</Text>
              )}
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
            {modalType === 'back' ? 'Undo Changes ?' : modalType === 'remove' ? 'Remove Award ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to change what you entered?'
              : modalType === 'remove'
              ? 'Are you sure you want to delete this award?'
              : 'Are you sure you want to save what you entered?'}
          </Text>
          {modalType === 'remove' ? (
            <>
              <TouchableOpacity style={styles.sheetBtn} onPress={handleRemoveConfirm}>
                <Text style={styles.sheetBtnText}>REMOVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnUndoText}>CONTINUE FILLING</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.sheetBtn} onPress={handleModalMainAction}>
                <Text style={styles.sheetBtnText}>{modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnUndoText}>CONTINUE FILLING</Text>
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


  header: { fontWeight: 'bold', fontSize: 20, color: '#150b3d', marginTop: 8, marginBottom: 16, alignSelf: 'center' },
  scrollView: { flex: 1 },
  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, alignSelf: 'center', marginTop: 16, marginBottom: 20 },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff9e6',
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  tipsText: { fontSize: 15, color: '#222', flex: 1 },
  tipsBold: { fontWeight: 'bold' },
  label: { fontWeight: '600', fontSize: 15, color: '#222', marginBottom: 6, marginTop: 12 },
  required: { color: '#e60023' },
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
    fontWeight: '400' 
  },
  inputError: {
    borderColor: '#e60023',
    borderWidth: 2,
  },
  inputValid: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  errorText: {
    color: '#e60023',
    fontSize: 13,
    marginTop: 4,
    minHeight: 18,
  },
  textarea: { 
    minHeight: 120, 
    maxHeight: 200, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 14, 
    fontSize: 16, 
    color: '#222', 
    borderWidth: 1.5, 
    borderColor: '#ddd', 
    textAlignVertical: 'top', 
    marginTop: 0 
  },
  charCounter: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 4,
  },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 },
  removeBtn: { flex: 1, backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginRight: 6 },
  removeBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  saveBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginLeft: 6, shadowColor: '#99aac5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 5, alignSelf: 'center' },
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
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
  },
  pickerModal: { justifyContent: 'flex-end', margin: 0 },
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  pickerSheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  pickerSheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 16 },

  pickerSheetBtn: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginTop: 16 },
  pickerSheetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 