import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../services/profileService';
import Modal from 'react-native-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock language suggestions with flags
const LANGUAGE_SUGGESTIONS = [
  { name: 'Arabic', flag: '🇸🇦' },
  { name: 'Indonesian', flag: '🇮🇩' },
  { name: 'Malaysian', flag: '🇲🇾' },
  { name: 'English', flag: '🇬🇧' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Hindi', flag: '🇮🇳' },
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Korean', flag: '🇰🇷' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'Portuguese', flag: '🇵🇹' },
  { name: 'Russian', flag: '🇷🇺' },
  { name: 'Vietnamese', flag: '🇻🇳' },
];

export default function AddLanguageScreen({ navigation, route }) {
  const { language: editLanguage, mode, selectedLanguage: searchSelectedLanguage } = route.params || {};
  const [selectedLanguage, setSelectedLanguage] = useState(
    editLanguage?.languageName || searchSelectedLanguage?.name || ''
  );
  const [languageLevel, setLanguageLevel] = useState(editLanguage?.languageLevel || '');
  const [saving, setSaving] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const handleLanguagePress = () => {
    navigation.navigate('SearchLanguageScreen', { selectedLanguage: { name: selectedLanguage } });
  };

  const handleSave = async () => {
    if (!selectedLanguage || !languageLevel) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const languageData = {
        languageName: selectedLanguage,
        languageLevel: languageLevel,
      };

      if (mode === 'edit' && editLanguage?.foreignLanguageId) {
        await profileService.updateForeignLanguage(editLanguage.foreignLanguageId, languageData, token);
      } else {
        await profileService.createForeignLanguage(languageData, token);
      }
      
      Alert.alert('Success', 'Language saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Save language error:', error);
      Alert.alert('Error', 'Failed to save language. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderLevelOption = (level) => (
    <TouchableOpacity 
      key={level}
      style={[
        styles.levelOption,
        languageLevel === level && styles.selectedLevel
      ]}
      onPress={() => {
        setLanguageLevel(level);
        setShowLevelPicker(false);
      }}
    >
      <Text style={[
        styles.levelOptionText,
        languageLevel === level && styles.selectedLevelText
      ]}>
        {level}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>
      <Text style={styles.header}>Add Language</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Language</Text>
        <View style={styles.languageInputContainer}>
          <TextInput
            style={styles.languageInput}
            value={selectedLanguage}
            onChangeText={setSelectedLanguage}
            placeholder="Search language"
            placeholderTextColor="#514a6b"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleLanguagePress}
          >
            <Icon name="search" size={20} color="#514a6b" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Level</Text>
        <TouchableOpacity 
          style={styles.levelInput}
          onPress={() => setShowLevelPicker(true)}
        >
          <Text style={styles.levelInputText}>
            {languageLevel ? languageLevel : 'Choose your skill level'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#514a6b" />
        </TouchableOpacity>

        <Text style={styles.hintText}>
          Proficiency level: Basic, Intermediate, Advanced, Fluent
        </Text>

        <TouchableOpacity 
          style={[styles.saveBtn, (!selectedLanguage || !languageLevel) && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving || !selectedLanguage || !languageLevel}
        >
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* Level Picker Modal */}
      <Modal
        isVisible={showLevelPicker}
        onBackdropPress={() => {
          setShowLevelPicker(false);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Select Level
          </Text>
          <View style={styles.levelOptions}>
            {['Basic', 'Intermediate', 'Advanced', 'Fluent'].map((level) => renderLevelOption(level))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8f8', 
    alignItems: 'center', 
    paddingTop: 24 
  },
  backBtn: { 
    position: 'absolute', 
    top: 30, 
    left: 20, 
    zIndex: 10, 
    width: 36, 
    height: 36, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  header: { 
    fontWeight: 'bold', 
    fontSize: 20, 
    color: '#150b3d', 
    marginTop: 24, 
    marginBottom: 16 
  },
  form: { 
    width: SCREEN_WIDTH - 36, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    elevation: 2 
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#150b3d',
    marginBottom: 8,
    marginTop: 16,
  },
  languageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  languageInput: {
    flex: 1,
    fontSize: 16,
    color: '#150b3d',
    paddingVertical: 12,
  },
  searchButton: {
    padding: 8,
  },
  levelInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  levelInputText: {
    fontSize: 16,
    color: '#150b3d',
  },
  hintText: {
    fontSize: 12,
    color: '#514a6b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  saveBtn: {
    backgroundColor: '#130160',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 120,
    left: 18,
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  flagText: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#150b3d',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetHandle: {
    width: 34,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 16,
    alignSelf: 'center',
  },
  sheetTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#150b3d',
    marginBottom: 20,
    textAlign: 'center',
  },
  levelOptions: {
    width: '100%',
  },
  levelOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  selectedLevel: {
    backgroundColor: '#FF6B35',
  },
  levelOptionText: {
    fontSize: 16,
    color: '#150b3d',
  },
  selectedLevelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 