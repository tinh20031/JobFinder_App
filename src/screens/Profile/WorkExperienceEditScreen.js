import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkExperienceEditScreen({ route, navigation }) {
  const { work, mode } = route.params || {};
  function getMonth(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return (d.getMonth() + 1).toString();
  }
  function getYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.getFullYear().toString();
  }
  const [jobTitle, setJobTitle] = useState(work?.jobTitle || '');
  const [companyName, setCompanyName] = useState(work?.companyName || '');
  const [monthStart, setMonthStart] = useState(getMonth(work?.monthStart));
  const [yearStart, setYearStart] = useState(getYear(work?.monthStart));
  const [monthEnd, setMonthEnd] = useState(getMonth(work?.monthEnd));
  const [yearEnd, setYearEnd] = useState(getYear(work?.monthEnd));
  const [isWorking, setIsWorking] = useState(work?.isWorking || false);
  const [workDescription, setWorkDescription] = useState(work?.workDescription || '');
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'back' | 'save' | 'remove' | null
  const [removing, setRemoving] = useState(false);

  const handleSave = () => setModalType('save');
  const handleBack = useCallback(() => {
    if (
      jobTitle !== (work?.jobTitle || '') ||
      companyName !== (work?.companyName || '') ||
      monthStart !== getMonth(work?.monthStart) ||
      yearStart !== getYear(work?.monthStart) ||
      monthEnd !== getMonth(work?.monthEnd) ||
      yearEnd !== getYear(work?.monthEnd) ||
      isWorking !== (work?.isWorking || false) ||
      workDescription !== (work?.workDescription || '')
    ) {
      setModalType('back');
    } else {
      navigation.goBack();
    }
  }, [jobTitle, companyName, monthStart, yearStart, monthEnd, yearEnd, isWorking, workDescription, work, navigation]);

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
    if (!jobTitle || !companyName || !monthStart || !yearStart || (!isWorking && (!monthEnd || !yearEnd))) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const monthStartStr = yearStart && monthStart ? `${yearStart}-${String(monthStart).padStart(2, '0')}-01` : null;
      const monthEndStr = (!isWorking && yearEnd && monthEnd) ? `${yearEnd}-${String(monthEnd).padStart(2, '0')}-01` : null;
      const workData = {
        jobTitle: jobTitle || null,
        companyName: companyName || null,
        isWorking,
        monthStart: monthStartStr,
        monthEnd: monthEndStr,
        workDescription: workDescription || null
      };
      if (mode === 'edit' && work?.workExperienceId) {
        await profileService.updateWorkExperience(work.workExperienceId, workData, token);
      } else {
        await profileService.createWorkExperience(workData, token);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin work experience.\n' + (e && e.message ? e.message : ''));
    }
    setSaving(false);
  };

  const handleRemove = () => setModalType('remove');
  const handleRemoveConfirm = async () => {
    setModalType(null);
    setRemoving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await profileService.deleteWorkExperience(work.workExperienceId, token);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to remove work experience.');
    }
    setRemoving(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>
      <Text style={styles.header}>{mode === 'edit' ? 'Change work experience' : 'Add work experience'}</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Job title</Text>
        <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Manager" />
        <Text style={styles.label}>Company</Text>
        <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="e.g. Amazon Inc" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start month</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={monthStart}
                onValueChange={setMonthStart}
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
            <Text style={styles.label}>Start year</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={yearStart}
                onValueChange={setYearStart}
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
        {!isWorking && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>End month</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={monthEnd}
                  onValueChange={setMonthEnd}
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
                  selectedValue={yearEnd}
                  onValueChange={setYearEnd}
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
          <Switch value={isWorking} onValueChange={setIsWorking} />
          <Text style={styles.switchLabel}>This is my position now</Text>
        </View>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textarea}
          value={workDescription}
          onChangeText={setWorkDescription}
          placeholder="Write additional information here"
          multiline
          scrollEnabled
        />
        <View style={styles.actionRow}>
          {mode === 'edit' && work?.workExperienceId && (
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} disabled={removing}>
              <Text style={styles.removeBtnText}>REMOVE</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>
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
            {modalType === 'back' ? 'Undo Changes ?' : modalType === 'remove' ? 'Remove Work Experience ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to change what you entered?'
              : modalType === 'remove'
              ? 'Are you sure you want to delete this work experience?'
              : 'Are you sure you want to save what you entered?'}
          </Text>
          {modalType === 'remove' ? (
            <>
              <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnText}>CONTINUE FILLING</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleRemoveConfirm}>
                <Text style={styles.sheetBtnUndoText}>REMOVE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
                <Text style={styles.sheetBtnText}>CONTINUE FILLING</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleModalMainAction}>
                <Text style={styles.sheetBtnUndoText}>{modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', alignItems: 'center', paddingTop: 24 },
  backBtn: { position: 'absolute', top: 30, left: 20, zIndex: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  header: { fontWeight: 'bold', fontSize: 20, color: '#150b3d', marginTop: 24, marginBottom: 16 },
  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  label: { fontWeight: '500', fontSize: 14, color: '#150b3d', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#f8f8f8', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, fontSize: 15, color: '#514a6b', borderWidth: 1, borderColor: '#eee', marginBottom: 0, fontWeight: '400' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  switchLabel: { marginLeft: 12, color: '#514a6b', fontSize: 14 },
  textarea: { minHeight: 100, maxHeight: 200, backgroundColor: '#f8f8f8', borderRadius: 8, padding: 14, fontSize: 15, color: '#514a6b', borderWidth: 1, borderColor: '#eee', textAlignVertical: 'top', marginTop: 0 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 },
  removeBtn: { flex: 1, backgroundColor: '#d6cdfe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginRight: 6 },
  removeBtnText: { color: '#130160', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  saveBtn: { flex: 1, backgroundColor: '#130160', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginLeft: 6, shadowColor: '#99aac5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 5, alignSelf: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  pickerWrapper: { backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 18, justifyContent: 'center', height: 44, paddingVertical: 0 },
  picker: { color: '#514a6b', fontSize: 10, height: 56, textAlignVertical: 'center' },
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