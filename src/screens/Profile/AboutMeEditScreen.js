import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import profileService from '../../services/profileService';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AboutMeEditScreen({ route, navigation }) {
  const { aboutMe } = route.params;
  const [value, setValue] = useState(aboutMe?.aboutMeDescription || '');
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState(null); // 'back' | 'save' | null
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!value.trim()) {
      setError('About me description is required.');
      return false;
    }
    if (value.trim().length < 10) {
      setError('About me description must be at least 10 characters.');
      return false;
    }
    if (value.trim().length > 2500) {
      setError('About me description must be less than 2500 characters.');
      return false;
    }
    setError('');
    return true;
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
      setSaving(true);
      try {
        // Check if aboutMe exists and has content
        if (aboutMe && aboutMe.aboutMeDescription) {
          await profileService.updateAboutMe(null, value);
        } else {
          await profileService.createAboutMe(value);
        }
        navigation.goBack();
      } catch (e) {
        console.error('AboutMeEditScreen - Save error:', e);
        Alert.alert('Error', 'Failed to save About Me' + (e && e.message ? ('\n' + e.message) : ''));
      }
      setSaving(false);
    }
  };



  // Modal content
  const modalTitle = modalType === 'back' ? 'Undo Changes ?' : 'Save Changes ?';
  const modalDesc = modalType === 'back'
    ? 'Are you sure you want to change what you entered?'
    : 'Are you sure you want to save what you entered?';
  const mainBtnText = modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>About Me</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tips section */}
          <View style={styles.tipsContainer}>
            <Icon name="lightbulb-outline" size={20} color="#ffc107" style={{ marginRight: 8 }} />
            <Text style={styles.tipsText}>
              <Text style={styles.tipsBold}>Tips:</Text> Summarize your professional experience, highlight your skills and your strengths.
            </Text>
          </View>
          
          <TextInput
            style={[
              styles.textarea,
              touched && !value.trim() && styles.inputError,
              value.trim() && touched && !error && styles.inputSuccess
            ]}
            multiline
            placeholder="Write something about yourself..."
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (touched) {
                // Clear error when user starts typing
                if (text.trim() && text.trim().length >= 10 && text.trim().length <= 2500) {
                  setError('');
                }
              }
            }}
            onBlur={() => setTouched(true)}
            scrollEnabled={true}
          />
          
          {/* Character count */}
          <Text style={styles.charCount}>
            {value.replace(/<[^>]+>/g, "").length}/2500 characters
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Save Button - Inside the form */}
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave} 
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom sheet confirm */}
      <Modal
        isVisible={modalType !== null}
        onBackdropPress={() => setModalType(null)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{modalTitle}</Text>
          <Text style={styles.sheetDesc}>{modalDesc}</Text>
          <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleModalMainAction}>
            <Text style={styles.sheetBtnUndoText}>{mainBtnText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
            <Text style={styles.sheetBtnText}>CONTINUE FILLING</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', alignItems: 'center', paddingTop: 24 },
  header: { fontSize: 20, color: '#150b3d', marginTop: 8, marginBottom: 16, alignSelf: 'center', fontFamily: 'Poppins-Bold' },
  scrollView: { flex: 1 },
  form: { width: SCREEN_WIDTH - 36, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, alignSelf: 'center', borderWidth: 1, borderColor: '#eee' },

  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff9e6',
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  tipsText: { 
    fontSize: 15, 
    color: '#222', 
    flex: 1,
    fontFamily: 'Poppins-Regular'
  },
  tipsBold: { 
    fontFamily: 'Poppins-Bold'
  },
  charCount: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
  },
  textarea: { minHeight: 200, maxHeight: 350, backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 14, color: '#514a6b', borderWidth: 1, borderColor: '#ddd', textAlignVertical: 'top', fontFamily: 'Poppins-Regular' },
  required: {
    color: '#e60023',
    fontFamily: 'Poppins-Regular',
  },
  inputError: {
    borderColor: '#e60023',
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  errorText: {
    color: '#e60023',
    marginTop: 4,
    fontSize: 13,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  saveBtn: { width: '100%', height: 50, backgroundColor: '#2563eb', borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#99aac5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 5, marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, letterSpacing: 0.84, fontFamily: 'Poppins-Bold' },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontSize: 18, color: '#150b3d', marginBottom: 12, fontFamily: 'Poppins-Bold' },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center', fontFamily: 'Poppins-Regular' },
  sheetBtn: { width: '100%', backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 0 },
  sheetBtnText: { color: '#2563eb', fontSize: 16, fontFamily: 'Poppins-Bold' },
  sheetBtnUndo: { width: '100%', backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 12 },
  sheetBtnUndoText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' }
}); 