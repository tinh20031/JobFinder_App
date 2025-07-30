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

export default function CertificateEditScreen({ route, navigation }) {
  const { certificate, mode } = route.params || {};
  const [certificateName, setCertificateName] = useState(certificate?.certificateName || '');
  const [organization, setOrganization] = useState(certificate?.organization || '');
  const [selectedMonth, setSelectedMonth] = useState(certificate?.month ? certificate.month.slice(5, 7) : '');
  const [selectedYear, setSelectedYear] = useState(certificate?.year ? certificate.year.slice(0, 4) : '');
  const [certificateUrl, setCertificateUrl] = useState(certificate?.certificateUrl || '');
  const [certificateDescription, setCertificateDescription] = useState(certificate?.certificateDescription || '');
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'back' | 'save' | 'remove' | null
  const [removing, setRemoving] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!certificateName.trim()) {
      newErrors.certificateName = 'Certificate Name is required.';
    }
    
    if (!selectedMonth) {
      newErrors.selectedMonth = 'Month is required.';
    }
    
    if (!selectedYear) {
      newErrors.selectedYear = 'Year is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setModalType('save');
    }
  };

  const handleBack = useCallback(() => {
    const originalMonth = certificate?.month ? certificate.month.slice(5, 7) : '';
    const originalYear = certificate?.year ? certificate.year.slice(0, 4) : '';
    
    if (
      certificateName !== (certificate?.certificateName || '') ||
      organization !== (certificate?.organization || '') ||
      selectedMonth !== originalMonth ||
      selectedYear !== originalYear ||
      certificateUrl !== (certificate?.certificateUrl || '') ||
      certificateDescription !== (certificate?.certificateDescription || '')
    ) {
      setModalType('back');
    } else {
      navigation.goBack();
    }
  }, [certificateName, organization, selectedMonth, selectedYear, certificateUrl, certificateDescription, certificate, navigation]);

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
        CertificateName: certificateName.trim(),
        Organization: organization.trim() || null,
        Month: toISO(selectedYear, selectedMonth),
        Year: toISO(selectedYear, selectedMonth),
        CertificateUrl: certificateUrl.trim() || null,
        CertificateDescription: certificateDescription.trim() || null,
      };
      
      if (mode === 'edit' && certificate?.certificateId) {
        await profileService.updateCertificate(certificate.certificateId, data, token);
      } else {
        await profileService.createCertificate(data, token);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save certificate.\n' + (e.message || ''));
    }
    setSaving(false);
  };

  const handleRemove = () => setModalType('remove');
  const handleRemoveConfirm = async () => {
    setModalType(null);
    setRemoving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await profileService.deleteCertificate(certificate.certificateId, token);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to remove certificate.');
    }
    setRemoving(false);
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

  const formatMonthYear = () => {
    if (selectedMonth && selectedYear) {
      return `${selectedMonth}/${selectedYear}`;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>
      <Text style={styles.header}>{mode === 'edit' ? 'Edit Certificate' : 'Add Certificate'}</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <Icon name="lightbulb-outline" size={20} color="#ffc107" style={{ marginRight: 8 }} />
            <Text style={styles.tipsText}>
              <Text style={styles.tipsBold}>Tips:</Text> Share your professional certifications and qualifications that demonstrate your expertise.
            </Text>
          </View>

          <Text style={styles.label}>Certificate Name <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[
              styles.input, 
              (errors.certificateName || (touched.certificateName && !certificateName.trim())) && styles.inputError,
              certificateName.trim() && styles.inputValid
            ]} 
            value={certificateName} 
            onChangeText={(text) => handleInputChange('certificateName', text, setCertificateName)}
            onBlur={() => handleInputBlur('certificateName')}
          />
          {(errors.certificateName || (touched.certificateName && !certificateName.trim())) && (
            <Text style={styles.errorText}>Please enter your certificate name</Text>
          )}

          <Text style={styles.label}>Issuing Organization (Optional)</Text>
          <TextInput 
            style={styles.input} 
            value={organization} 
            onChangeText={(text) => handleInputChange('organization', text, setOrganization)}
          />

          <Text style={styles.label}>Issue Date <Text style={styles.required}>*</Text></Text>
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={[
                styles.datePickerBtn,
                (errors.selectedMonth || (touched.selectedMonth && !selectedMonth)) && styles.inputError,
                selectedMonth && styles.inputValid
              ]}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.datePickerText}>
                {selectedMonth || 'Month'}
              </Text>
              <Icon name="keyboard-arrow-down" size={20} color="#514a6b" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.datePickerBtn,
                (errors.selectedYear || (touched.selectedYear && !selectedYear)) && styles.inputError,
                selectedYear && styles.inputValid
              ]}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.datePickerText}>
                {selectedYear || 'Year'}
              </Text>
              <Icon name="keyboard-arrow-down" size={20} color="#514a6b" />
            </TouchableOpacity>
          </View>
          
          {(errors.selectedMonth || (touched.selectedMonth && !selectedMonth)) && (
            <Text style={styles.errorText}>Please select a month</Text>
          )}
          {(errors.selectedYear || (touched.selectedYear && !selectedYear)) && (
            <Text style={styles.errorText}>Please select a year</Text>
          )}

          <Text style={styles.label}>Certificate URL (Optional)</Text>
          <TextInput 
            style={styles.input} 
            value={certificateUrl} 
            onChangeText={(text) => handleInputChange('certificateUrl', text, setCertificateUrl)}
            keyboardType="url"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Certificate Description (Optional)</Text>
          <TextInput
            style={styles.textarea}
            value={certificateDescription}
            onChangeText={setCertificateDescription}
            multiline
            scrollEnabled
          />
          <Text style={styles.charCounter}>
            {certificateDescription.length}/2500
          </Text>

          <View style={styles.actionRow}>
            {mode === 'edit' && certificate?.certificateId && (
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

      {/* Month Picker Modal */}
      <Modal
        isVisible={showMonthPicker}
        onBackdropPress={() => setShowMonthPicker(false)}
        style={styles.pickerModal}
        backdropOpacity={0.6}
      >
        <View style={styles.pickerSheet}>
          <View style={styles.pickerSheetHandle} />
          <Text style={styles.pickerSheetTitle}>Select Month</Text>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => {
              setSelectedMonth(itemValue);
              if (errors.selectedMonth) {
                setErrors({...errors, selectedMonth: null});
              }
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select Month" value="" />
            {months.map((month) => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>
          <TouchableOpacity 
            style={styles.pickerSheetBtn} 
            onPress={() => setShowMonthPicker(false)}
          >
            <Text style={styles.pickerSheetBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        isVisible={showYearPicker}
        onBackdropPress={() => setShowYearPicker(false)}
        style={styles.pickerModal}
        backdropOpacity={0.6}
      >
        <View style={styles.pickerSheet}>
          <View style={styles.pickerSheetHandle} />
          <Text style={styles.pickerSheetTitle}>Select Year</Text>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => {
              setSelectedYear(itemValue);
              if (errors.selectedYear) {
                setErrors({...errors, selectedYear: null});
              }
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select Year" value="" />
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
          <TouchableOpacity 
            style={styles.pickerSheetBtn} 
            onPress={() => setShowYearPicker(false)}
          >
            <Text style={styles.pickerSheetBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isVisible={modalType !== null}
        onBackdropPress={() => setModalType(null)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {modalType === 'back' ? 'Undo Changes ?' : modalType === 'remove' ? 'Remove Certificate ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to change what you entered?'
              : modalType === 'remove'
              ? 'Are you sure you want to delete this certificate?'
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
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  backBtn: { position: 'absolute', top: 30, left: 20, zIndex: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  header: { fontWeight: 'bold', fontSize: 20, color: '#150b3d', marginTop: 24, marginBottom: 16, textAlign: 'center' },
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
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
  removeBtn: { flex: 1, backgroundColor: '#d6cdfe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginRight: 6 },
  removeBtnText: { color: '#130160', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  saveBtn: { flex: 1, backgroundColor: '#130160', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginLeft: 6, shadowColor: '#99aac5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 5, alignSelf: 'center' },
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
  pickerModal: { justifyContent: 'flex-end', margin: 0 },
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  pickerSheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  pickerSheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 16 },
  picker: { width: '100%', height: 200 },
  pickerSheetBtn: { width: '100%', backgroundColor: '#130160', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginTop: 16 },
  pickerSheetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 