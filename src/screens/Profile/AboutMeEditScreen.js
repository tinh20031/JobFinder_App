import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
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

  const handleSave = () => {
    setModalType('save');
  };

  const handleBack = useCallback(() => {
    if (value !== (aboutMe?.aboutMeDescription || '')) {
      setModalType('back');
    } else {
      navigation.goBack();
    }
  }, [value, aboutMe, navigation]);

  const handleModalMainAction = async () => {
    if (modalType === 'back') {
      setModalType(null);
      navigation.goBack();
    } else if (modalType === 'save') {
      setModalType(null);
      setSaving(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('AboutMe object:', aboutMe);
        console.log('aboutMe?.aboutMeId:', aboutMe?.aboutMeId);
        console.log('aboutMe?.aboutMeId type:', typeof aboutMe?.aboutMeId);
        
        // Check if aboutMe exists and has an ID (could be aboutMeId or id)
        const aboutMeId = aboutMe?.aboutMeId || aboutMe?.id;
        console.log('AboutMe ID found:', aboutMeId);
        
        if (aboutMe && aboutMeId) {
          console.log('Calling updateAboutMe with ID:', aboutMeId);
          await profileService.updateAboutMe(aboutMeId, value, token);
        } else {
          console.log('Calling createAboutMe');
          const newAboutMe = await profileService.createAboutMe(value, token);
          console.log('New AboutMe created:', newAboutMe);
        }
        navigation.goBack();
      } catch (e) {
        Alert.alert('Error', 'Failed to save About Me' + (e && e.message ? ('\n' + e.message) : ''));
        if (e && e.message) {
          console.log('Save About Me error:', e.message, e);
        } else {
          console.log('Save About Me error:', e);
        }
      }
      setSaving(false);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  // Modal content
  const modalTitle = modalType === 'back' ? 'Undo Changes ?' : 'Save Changes ?';
  const modalDesc = modalType === 'back'
    ? 'Are you sure you want to change what you entered?'
    : 'Are you sure you want to save what you entered?';
  const mainBtnText = modalType === 'back' ? 'UNDO CHANGES' : 'SAVE CHANGES';

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>

      {/* About me card */}
      <View style={styles.card}>
        <Text style={styles.title}>About me</Text>
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Tell me about you."
          value={value}
          onChangeText={setValue}
          scrollEnabled={true}
        />
      </View>

      {/* Save button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>SAVE</Text>
      </TouchableOpacity>

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
          <TouchableOpacity style={styles.sheetBtn} onPress={() => setModalType(null)}>
            <Text style={styles.sheetBtnText}>CONTINUE FILLING</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleModalMainAction}>
            <Text style={styles.sheetBtnUndoText}>{mainBtnText}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', alignItems: 'center', justifyContent: 'flex-start' },
  backBtn: { position: 'absolute', top: 30, left: 20, zIndex: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  card: { width: SCREEN_WIDTH - 36, marginTop: 94, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  title: { fontWeight: '600', fontSize: 16, color: '#150b3d', marginBottom: 16 },
  textarea: { minHeight: 200, maxHeight: 350, backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 14, color: '#514a6b', borderWidth: 1, borderColor: '#eee', textAlignVertical: 'top' },
  saveBtn: { position: 'absolute', bottom: 100, left: '50%', marginLeft: -107.5, width: 215, height: 50, backgroundColor: '#130160', borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#99aac5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 5 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.84 },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 34, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 16 },
  sheetTitle: { fontWeight: 'bold', fontSize: 18, color: '#150b3d', marginBottom: 12 },
  sheetDesc: { color: '#514a6b', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  sheetBtn: { width: '100%', backgroundColor: '#130160', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 12 },
  sheetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sheetBtnUndo: { width: '100%', backgroundColor: '#d6cdfe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, marginBottom: 0 },
  sheetBtnUndoText: { color: '#130160', fontWeight: 'bold', fontSize: 16 }
}); 