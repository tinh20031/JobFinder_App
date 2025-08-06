import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ActivityIndicator, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate months and years arrays
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function HighlightProjectEditScreen({ route, navigation }) {
  const { project, mode } = route.params || {};
  const [projectName, setProjectName] = useState(project?.projectName || '');
  const [isWorking, setIsWorking] = useState(project?.isWorking || false);
  const [monthStart, setMonthStart] = useState(project?.monthStart ? project.monthStart.slice(5, 7) : '');
  const [yearStart, setYearStart] = useState(project?.yearStart ? project.yearStart.slice(0, 4) : '');
  const [monthEnd, setMonthEnd] = useState(project?.monthEnd ? project.monthEnd.slice(5, 7) : '');
  const [yearEnd, setYearEnd] = useState(project?.yearEnd ? project.yearEnd.slice(0, 4) : '');
  const [projectDescription, setProjectDescription] = useState(project?.projectDescription || '');
  const [technologies, setTechnologies] = useState(project?.technologies || '');
  const [responsibilities, setResponsibilities] = useState(project?.responsibilities || '');
  const [teamSize, setTeamSize] = useState(project?.teamSize || '');
  const [achievements, setAchievements] = useState(project?.achievements || '');
  const [projectLink, setProjectLink] = useState(project?.projectLink || '');
  
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = 'Project Name is required.';
    }
    
    if (!projectDescription.trim()) {
      newErrors.projectDescription = 'Project Description is required.';
    }
    
    if (!technologies.trim()) {
      newErrors.technologies = 'Technologies is required.';
    }
    
    if (!responsibilities.trim()) {
      newErrors.responsibilities = 'Responsibilities is required.';
    }
    
    if (!teamSize.trim()) {
      newErrors.teamSize = 'Team Size is required.';
    }
    
    if (!achievements.trim()) {
      newErrors.achievements = 'Achievement is required.';
    }
    
    if (!monthStart) {
      newErrors.monthStart = 'Start Month is required.';
    }
    
    if (!yearStart) {
      newErrors.yearStart = 'Start Year is required.';
    }
    
    if (!isWorking) {
      if (!monthEnd) {
        newErrors.monthEnd = 'End Month is required.';
      }
      if (!yearEnd) {
        newErrors.yearEnd = 'End Year is required.';
      }
      
      // Date range validation
      if (yearStart && monthStart && yearEnd && monthEnd) {
        const start = new Date(`${yearStart}-${monthStart}-01`);
        const end = new Date(`${yearEnd}-${monthEnd}-01`);
        if (end <= start) {
          newErrors.dateRange = 'End date must be after start date.';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    // Set all fields as touched for validation
    setTouched({
      projectName: true,
      projectDescription: true,
      technologies: true,
      responsibilities: true,
      teamSize: true,
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
      // Format data theo BE expectation
      const toISO = (y, m) => (y && m ? `${y}-${m}-01T00:00:00.000Z` : null);
      
      const data = {
        ProjectName: projectName.trim(),
        IsWorking: isWorking,
        MonthStart: toISO(yearStart, monthStart),
        YearStart: toISO(yearStart, monthStart),
        MonthEnd: isWorking ? null : toISO(yearEnd, monthEnd),
        YearEnd: isWorking ? null : toISO(yearEnd, monthEnd),
        ProjectDescription: projectDescription.trim() || null,
        Technologies: technologies.trim() || null,
        Responsibilities: responsibilities.trim() || null,
        TeamSize: teamSize.trim() || null,
        Achievements: achievements.trim() || null,
        ProjectLink: projectLink.trim() || null,
      };
      
      if (mode === 'edit' && project?.id) {
        await profileService.updateHighlightProject(project.id, data);
      } else {
        await profileService.createHighlightProject(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save project.\n' + (e.message || ''));
    }
    setSaving(false);
  };

  const handleRemove = () => setModalType('remove');
  const handleRemoveConfirm = async () => {
    setModalType(null);
    setRemoving(true);
    try {
      await profileService.deleteHighlightProject(project.id);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to remove project.');
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

  const formatDate = (month, year) => {
    if (month && year) {
      return `${month}/${year}`;
    }
    return '';
  };

    return (
    <View style={styles.container}>
      <Text style={styles.header}>{mode === 'edit' ? 'Edit Project' : 'Add Project'}</Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <Icon name="lightbulb-outline" size={20} color="#ffc107" style={{ marginRight: 8 }} />
            <Text style={styles.tipsText}>
              <Text style={styles.tipsBold}>Tips:</Text> Share the project that relates to your skills and capabilities, and be sure to include project details, your role, technologies, and team size.
            </Text>
          </View>

          <Text style={styles.label}>Project Name <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[
              styles.input, 
              (errors.projectName || (touched.projectName && !projectName.trim())) && styles.inputError,
              projectName.trim() && styles.inputValid
            ]} 
            value={projectName} 
            onChangeText={(text) => handleInputChange('projectName', text, setProjectName)}
            onBlur={() => handleInputBlur('projectName')}
          />
          {(errors.projectName || (touched.projectName && !projectName.trim())) && (
            <Text style={styles.errorText}>Please enter project name</Text>
          )}

          <Text style={styles.label}>Start Date <Text style={styles.required}>*</Text></Text>
          <View style={styles.dateRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={monthStart || ''}
                onValueChange={(value) => {
                  setMonthStart(value === '' ? '' : value);
                  if (errors.monthStart) {
                    setErrors({...errors, monthStart: null});
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
                selectedValue={yearStart || ''}
                onValueChange={(value) => {
                  setYearStart(value === '' ? '' : value);
                  if (errors.yearStart) {
                    setErrors({...errors, yearStart: null});
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
          
          {(errors.monthStart || (touched.monthStart && !monthStart)) && (
            <Text style={styles.errorText}>Please select start month</Text>
          )}
          {(errors.yearStart || (touched.yearStart && !yearStart)) && (
            <Text style={styles.errorText}>Please select start year</Text>
          )}

          {!isWorking && (
            <>
              <Text style={styles.label}>End Date <Text style={styles.required}>*</Text></Text>
              <View style={styles.dateRow}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={monthEnd || ''}
                    onValueChange={(value) => {
                      setMonthEnd(value === '' ? '' : value);
                      if (errors.monthEnd) {
                        setErrors({...errors, monthEnd: null});
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
                    selectedValue={yearEnd || ''}
                    onValueChange={(value) => {
                      setYearEnd(value === '' ? '' : value);
                      if (errors.yearEnd) {
                        setErrors({...errors, yearEnd: null});
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
              
              {(errors.monthEnd || (touched.monthEnd && !monthEnd)) && (
                <Text style={styles.errorText}>Please select end month</Text>
              )}
                        {(errors.yearEnd || (touched.yearEnd && !yearEnd)) && (
            <Text style={styles.errorText}>Please select end year</Text>
          )}
        </>
      )}
      
      {errors.dateRange && (
        <Text style={styles.errorText}>{errors.dateRange}</Text>
      )}

          <View style={styles.switchRow}>
            <Text style={styles.label}>I am working on this project</Text>
            <Switch
              value={isWorking}
              onValueChange={setIsWorking}
              trackColor={{ false: '#ddd', true: '#130160' }}
              thumbColor={isWorking ? '#fff' : '#f4f3f4'}
            />
          </View>

          <Text style={styles.label}>Project Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              styles.textarea,
              (errors.projectDescription || (touched.projectDescription && !projectDescription.trim())) && styles.inputError,
              projectDescription.trim() && styles.inputValid
            ]}
            value={projectDescription}
            onChangeText={(text) => handleInputChange('projectDescription', text, setProjectDescription)}
            onBlur={() => handleInputBlur('projectDescription')}
            multiline
            scrollEnabled
          />
          {(errors.projectDescription || (touched.projectDescription && !projectDescription.trim())) && (
            <Text style={styles.errorText}>Please enter project description</Text>
          )}
          <Text style={styles.charCounter}>
            {projectDescription.length}/2500
          </Text>

          <Text style={styles.label}>Technologies Used <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              styles.textarea,
              (errors.technologies || (touched.technologies && !technologies.trim())) && styles.inputError,
              technologies.trim() && styles.inputValid
            ]}
            value={technologies}
            onChangeText={(text) => handleInputChange('technologies', text, setTechnologies)}
            onBlur={() => handleInputBlur('technologies')}
            multiline
            scrollEnabled
          />
          {(errors.technologies || (touched.technologies && !technologies.trim())) && (
            <Text style={styles.errorText}>Please enter technologies used</Text>
          )}
          <Text style={styles.charCounter}>
            {technologies.length}/2500
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
            <Text style={styles.errorText}>Please enter key responsibilities</Text>
          )}
          <Text style={styles.charCounter}>
            {responsibilities.length}/2500
          </Text>

          <Text style={styles.label}>Team Size <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={[
              styles.input,
              (errors.teamSize || (touched.teamSize && !teamSize.trim())) && styles.inputError,
              teamSize.trim() && styles.inputValid
            ]} 
            value={teamSize} 
            onChangeText={(text) => handleInputChange('teamSize', text, setTeamSize)}
            onBlur={() => handleInputBlur('teamSize')}
          />
          {(errors.teamSize || (touched.teamSize && !teamSize.trim())) && (
            <Text style={styles.errorText}>Please enter team size</Text>
          )}

          <Text style={styles.label}>Achievements/Results (Optional)</Text>
          <TextInput
            style={styles.textarea}
            value={achievements}
            onChangeText={setAchievements}
            multiline
            scrollEnabled
          />
          <Text style={styles.charCounter}>
            {achievements.length}/2500
          </Text>

          <Text style={styles.label}>Project URL (Optional)</Text>
          <TextInput 
            style={styles.input} 
            value={projectLink} 
            onChangeText={(text) => handleInputChange('projectLink', text, setProjectLink)}
            placeholder="https://example.com" 
            keyboardType="url"
            autoCapitalize="none"
          />

          <View style={styles.actionRow}>
            {mode === 'edit' && project?.id && (
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
            {modalType === 'back' ? 'Undo Changes ?' : modalType === 'remove' ? 'Remove Project ?' : 'Save Changes ?'}
          </Text>
          <Text style={styles.sheetDesc}>
            {modalType === 'back'
              ? 'Are you sure you want to change what you entered?'
              : modalType === 'remove'
              ? 'Are you sure you want to delete this project?'
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
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