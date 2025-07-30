import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../services/profileService';
import Modal from 'react-native-modal';
import { LANGUAGE_SUGGESTIONS, searchLanguages } from '../../constants/languages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


export default function AddLanguageScreen({ navigation, route }) {
  const { language: editLanguage, mode, selectedLanguage: searchSelectedLanguage } = route.params || {};
  const [selectedLanguage, setSelectedLanguage] = useState(
    editLanguage?.languageName || searchSelectedLanguage?.name || ''
  );
  const [languageLevel, setLanguageLevel] = useState(editLanguage?.languageLevel || '');
  const [saving, setSaving] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGE_SUGGESTIONS);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filterLanguages = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredLanguages(LANGUAGE_SUGGESTIONS);
      console.log('No search text, showing all languages:', LANGUAGE_SUGGESTIONS.length);
      return;
    }
    const filtered = LANGUAGE_SUGGESTIONS.filter(lang => 
      lang.name.toLowerCase().includes(searchText.toLowerCase())
    );
    console.log('Filtered languages:', filtered.length, 'for search:', searchText);
    setFilteredLanguages(filtered);
  }, [searchText]);

  useEffect(() => {
    filterLanguages();
  }, [filterLanguages]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
    setShowLanguageDropdown(false);
    setSearchText('');
    setFilteredLanguages(LANGUAGE_SUGGESTIONS);
  };

  const handleLanguageInputPress = () => {
    console.log('Opening language dropdown, total languages:', LANGUAGE_SUGGESTIONS.length);
    setShowLanguageDropdown(true);
    setSearchText('');
    setFilteredLanguages(LANGUAGE_SUGGESTIONS);
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
      
      setShowSuccessModal(true);
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
            onPressIn={handleLanguageInputPress}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleLanguageInputPress}
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

      {/* Language Dropdown Modal */}
      <Modal
        isVisible={showLanguageDropdown}
        onBackdropPress={() => {
          setShowLanguageDropdown(false);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Select Language
          </Text>
          
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#514a6b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search language"
              placeholderTextColor="#514a6b"
            />
          </View>
          
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredLanguages}
              renderItem={({ item }) => {
                console.log('Rendering language item:', item.name);
                return (
                  <TouchableOpacity 
                    style={styles.suggestionItem} 
                    onPress={() => handleLanguageSelect(item)}
                  >
                    <Text style={styles.flagText}>{item.flag}</Text>
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.name}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#514a6b', fontSize: 16 }}>No languages found</Text>
                  <Text style={{ color: '#514a6b', fontSize: 14, marginTop: 8 }}>Total: {LANGUAGE_SUGGESTIONS.length}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        isVisible={showSuccessModal}
        onBackdropPress={() => {
          setShowSuccessModal(false);
        }}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Save Language ?
          </Text>
          <Text style={styles.sheetDesc}>
            Do you want to save language?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={() => {
              setShowSuccessModal(false);
              navigation.goBack();
            }}
          >
            <Text style={styles.sheetBtnText}>SAVE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => {
              setShowSuccessModal(false);
            }}
          >
            <Text style={styles.sheetBtnUndoText}>CANCEL</Text>
          </TouchableOpacity>
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
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
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
    backgroundColor: '#fff',
  },
  flagText: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#150b3d',
    fontWeight: '500',
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
    alignItems: 'center',
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 34,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 16,
  },
  sheetTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#150b3d',
    marginBottom: 12,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#150b3d',
    paddingVertical: 12,
  },
  sheetDesc: {
    color: '#514a6b',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#130160',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 12,
  },
  sheetBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sheetBtnUndo: {
    width: '100%',
    backgroundColor: '#d6cdfe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 0,
  },
  sheetBtnUndoText: {
    color: '#130160',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 