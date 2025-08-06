import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, Dimensions, ScrollView } from 'react-native';
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
    return (d.getMonth() + 1);
  }
  function getYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.getFullYear();
  }
  const [jobTitle, setJobTitle] = useState(work?.jobTitle || '');
  const [companyName, setCompanyName] = useState(work?.companyName || '');
  const [monthStart, setMonthStart] = useState(getMonth(work?.monthStart));
  const [yearStart, setYearStart] = useState(getYear(work?.monthStart));
  const [monthEnd, setMonthEnd] = useState(getMonth(work?.monthEnd));
  const [yearEnd, setYearEnd] = useState(getYear(work?.monthEnd));
  const [isWorking, setIsWorking] = useState(work?.isWorking || false);
  const [workDescription, setWorkDescription] = useState(work?.workDescription || '');
  const [responsibilities, setResponsibilities] = useState(work?.responsibilities || '');
  const [achievements, setAchievements] = useState(work?.achievements || '');
  const [technologies, setTechnologies] = useState(work?.technologies || '');
  const [projectName, setProjectName] = useState(work?.projectName || '');
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'back' | 'save' | 'remove' | null
  const [removing, setRemoving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function - tương tự web version
  const validateForm = () => {
    const newErrors = {};
    let endBeforeStart = false;
    
    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job Title is required.';
    }
    
    if (!companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    }
    
    if (!workDescription.trim()) {
      newErrors.workDescription = 'Work Description is required.';
    }
    
    if (!responsibilities.trim()) {
      newErrors.responsibilities = 'Responsibilities is required.';
    }
    
    if (!achievements.trim()) {
      newErrors.achievements = 'Achievements is required.';
    }
    
    if (!monthStart) {
      newErrors.monthStart = 'Month is required.';
    }
    
    if (!yearStart) {
      newErrors.yearStart = 'Year is required.';
    }
    
    if (!isWorking) {
      if (!monthEnd) {
        newErrors.monthEnd = 'Month is required.';
      }
      if (!yearEnd) {
        newErrors.yearEnd = 'Year is required.';
      }
      
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
    // Set all fields as touched for validation
    setTouched({
      jobTitle: true,
      companyName: true,
      workDescription: true,
      responsibilities: true,
      achievements: true,
      monthStart: true,
      yearStart: true,
      monthEnd: true,
      yearEnd: true,
    });
    
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
      const toISO = (y, m) => {
        if (!y || !m) return null;
        const monthStr = m.toString().padStart(2, '0');
        return `${y}-${monthStr}-01T00:00:00.000Z`;
      };
      
      const workData = {
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        isWorking,
        monthStart: toISO(yearStart, monthStart),
        yearStart: toISO(yearStart, monthStart),
        monthEnd: isWorking ? null : toISO(yearEnd, monthEnd),
        yearEnd: isWorking ? null : toISO(yearEnd, monthEnd),
        workDescription: workDescription.trim() || null,
        responsibilities: responsibilities.trim() || null,
        achievements: achievements.trim() || null,
        technologies: technologies.trim() || null,
        projectName: projectName.trim() || null,
      };
      
      if (mode === 'edit' && work?.id) {
        workData.id = work.id;
        await profileService.updateWorkExperience(workData);
      } else {
        await profileService.createWorkExperience(workData);
      }
      navigation.goBack();
    } catch (e) {
      console.error('Error saving work experience:', e);
      Alert.alert('Error', 'Failed to save work experience.\n' + (e.message || ''));
    }
    setSaving(false);
  };

  const handleRemove = () => setModalType('remove');
  const handleRemoveConfirm = async () => {
    setModalType(null);
    setRemoving(true);
    try {
      await profileService.deleteWorkExperience(work.id);
      navigation.goBack();
    } catch (e) {
      console.error('WorkExperienceEditScreen - Delete error:', e);
      Alert.alert('Error', 'Failed to remove work experience.');
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

    return (
    <View style={styles.container}>
      <Text style={styles.header}>{mode === 'edit' ? 'Edit Work Experience' : 'Add Work Experience'}</Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tips Section - tương tự web version */}
          <View style={styles.tipsContainer}>
            <Icon name="lightbulb-outline" size={20} color="#1967d2" style={{ marginRight: 8 }} />
            <Text style={styles.tipsText}>
              <Text style={styles.tipsBold}>Tips:</Text> Brief the company's industry, then detail your responsibilities and achievements. For projects, write on the "Project" field below.
            </Text>
          </View>

          <Text style={styles.label}>Job Title <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[
              styles.input, 
              (errors.jobTitle || (touched.jobTitle && !jobTitle.trim())) && styles.inputError,
              jobTitle.trim() && styles.inputValid
            ]} 
            value={jobTitle} 
            onChangeText={(text) => handleInputChange('jobTitle', text, setJobTitle)}
            onBlur={() => handleInputBlur('jobTitle')}
          />
          {(errors.jobTitle || (touched.jobTitle && !jobTitle.trim())) && (
            <Text style={styles.errorText}>Please enter your Job Title</Text>
          )}

          <Text style={styles.label}>Company Name <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[
              styles.input, 
              (errors.companyName || (touched.companyName && !companyName.trim())) && styles.inputError,
              companyName.trim() && styles.inputValid
            ]} 
            value={companyName} 
            onChangeText={(text) => handleInputChange('companyName', text, setCompanyName)}
            onBlur={() => handleInputBlur('companyName')}
          />
          {(errors.companyName || (touched.companyName && !companyName.trim())) && (
            <Text style={styles.errorText}>Please enter your company name</Text>
          )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start month</Text>
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
            <Text style={styles.label}>Start year</Text>
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
        {!isWorking && (
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
          <Switch value={isWorking} onValueChange={setIsWorking} />
          <Text style={styles.switchLabel}>I am currently working here</Text>
        </View>

        <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[
            styles.textarea,
            (errors.workDescription || (touched.workDescription && !workDescription.trim())) && styles.inputError,
            workDescription.trim() && styles.inputValid
          ]}
          value={workDescription}
          onChangeText={(text) => handleInputChange('workDescription', text, setWorkDescription)}
          onBlur={() => handleInputBlur('workDescription')}
          multiline
          scrollEnabled
        />
        {(errors.workDescription || (touched.workDescription && !workDescription.trim())) && (
          <Text style={styles.errorText}>Please enter your work description</Text>
        )}
        <Text style={styles.charCounter}>
          {workDescription.length}/2500
        </Text>

        <Text style={styles.label}>Key Responsibilities <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[
            styles.textarea,
            (errors.responsibilities || (touched.responsibilities && !responsibilities.trim())) && styles.inputError,
            responsibilities.trim() && styles.inputValid
          ]}
          value={responsibilities}
          onChangeText={(text) => handleInputChange('responsibilities', text, setResponsibilities)}
          onBlur={() => handleInputBlur('responsibilities')}
          multiline
          scrollEnabled
        />
        {(errors.responsibilities || (touched.responsibilities && !responsibilities.trim())) && (
          <Text style={styles.errorText}>Please enter your key responsibilities</Text>
        )}
        <Text style={styles.charCounter}>
          {responsibilities.length}/2500
        </Text>

        <Text style={styles.label}>Key Achievements <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[
            styles.textarea,
            (errors.achievements || (touched.achievements && !achievements.trim())) && styles.inputError,
            achievements.trim() && styles.inputValid
          ]}
          value={achievements}
          onChangeText={(text) => handleInputChange('achievements', text, setAchievements)}
          onBlur={() => handleInputBlur('achievements')}
          multiline
          scrollEnabled
        />
        {(errors.achievements || (touched.achievements && !achievements.trim())) && (
          <Text style={styles.errorText}>Please enter your key achievements</Text>
        )}
        <Text style={styles.charCounter}>
          {achievements.length}/2500
        </Text>

        <Text style={styles.label}>Technologies Used (Optional)</Text>
        <TextInput
          style={styles.textarea}
          value={technologies}
          onChangeText={setTechnologies}
          multiline
          scrollEnabled
        />
        <Text style={styles.charCounter}>
          {technologies.length}/2500
        </Text>

        <Text style={styles.label}>Project Name (Optional)</Text>
        <TextInput
          style={styles.textarea}
          value={projectName}
          onChangeText={setProjectName}
          multiline
          scrollEnabled
        />
        <Text style={styles.charCounter}>
          {projectName.length}/2500
        </Text>
        <View style={styles.actionRow}>
          {mode === 'edit' && work?.id && (
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


  header: { fontSize: 20, color: '#150b3d', marginTop: 8, marginBottom: 16, alignSelf: 'center', fontFamily: 'Poppins-Bold' },
  scrollView: { flex: 1 },
  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, alignSelf: 'center', marginTop: 16, marginBottom: 20 },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1967d2',
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
  rowBetween: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  switchLabel: { marginLeft: 12, color: '#514a6b', fontSize: 14, fontFamily: 'Poppins-Regular' },
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
  pickerWrapper: { backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 18, justifyContent: 'center', height: 44, paddingVertical: 0 },
  picker: { color: '#514a6b', fontSize: 10, height: 56, textAlignVertical: 'center', fontFamily: 'Poppins-Regular' },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontSize: 18, color: '#150b3d', marginBottom: 12, fontFamily: 'Poppins-Bold' },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center', fontFamily: 'Poppins-Regular' },
  sheetBtn: { width: '100%', backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 0 },
  sheetBtnText: { color: '#2563eb', fontSize: 16, fontFamily: 'Poppins-Bold' },
  sheetBtnUndo: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 12 },
  sheetBtnUndoText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },
}); 