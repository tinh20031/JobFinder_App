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
      
      if (mode === 'edit' && certificate?.id) {
        await profileService.updateCertificate(certificate.id, data);
      } else {
        await profileService.createCertificate(data);
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
      await profileService.deleteCertificate(certificate.id);
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
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMonth || ''}
                onValueChange={(value) => {
                  setSelectedMonth(value === '' ? '' : value);
                  if (errors.selectedMonth) {
                    setErrors({...errors, selectedMonth: null});
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
                  if (errors.selectedYear) {
                    setErrors({...errors, selectedYear: null});
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
            {mode === 'edit' && certificate?.id && (
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
  container: { flex: 1, backgroundColor: '#f8f8f8', paddingTop: 24 },


  header: { fontSize: 20, color: '#150b3d', marginTop: 8, marginBottom: 16, alignSelf: 'center', fontFamily: 'Poppins-Bold' },
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
  tipsText: { fontSize: 15, color: '#222', flex: 1, fontFamily: 'Poppins-Regular' },
  tipsBold: { fontFamily: 'Poppins-Bold' },
  label: { fontWeight: '600', fontSize: 15, color: '#222', marginBottom: 6, marginTop: 12, fontFamily: 'Poppins-SemiBold' },
  required: { color: '#e60023', fontFamily: 'Poppins-Regular' },
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
    fontFamily: 'Poppins-Regular'
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
    fontFamily: 'Poppins-Regular',
  },
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
    fontFamily: 'Poppins-Regular',
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
    marginTop: 0,
    fontFamily: 'Poppins-Regular'
  },
  charCounter: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 },
  removeBtn: { flex: 1, backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginRight: 6 },
  removeBtnText: { color: '#2563eb', fontSize: 16, letterSpacing: 0.84, fontFamily: 'Poppins-Bold' },
  saveBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginLeft: 6, shadowColor: '#99aac5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 5, alignSelf: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, letterSpacing: 0.84, fontFamily: 'Poppins-Bold' },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontSize: 18, color: '#150b3d', marginBottom: 12, fontFamily: 'Poppins-Bold' },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center', fontFamily: 'Poppins-Regular' },
  sheetBtn: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 12 },
  sheetBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },
  sheetBtnUndo: { width: '100%', backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 0 },
  sheetBtnUndoText: { color: '#2563eb', fontSize: 16, fontFamily: 'Poppins-Bold' },
  pickerModal: { justifyContent: 'flex-end', margin: 0 },
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  pickerSheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  pickerSheetTitle: { fontSize: 18, color: '#150b3d', marginBottom: 16, fontFamily: 'Poppins-Bold' },

  pickerSheetBtn: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginTop: 16 },
  pickerSheetBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },
}); 