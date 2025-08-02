import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import profileService from '../../services/profileService';
import { getLanguageFlag } from '../../constants/languages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


export default function ForeignLanguageListScreen({ navigation, route }) {
  const { languages: initialLanguages } = route.params || {};
  const [languages, setLanguages] = useState(initialLanguages || []);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState(null);

  useEffect(() => {
    if (!initialLanguages) {
      loadLanguages();
    }
  }, [initialLanguages]);

  // Reload data when screen is focused (after adding/editing language)
  useFocusEffect(
    React.useCallback(() => {
      loadLanguages();
    }, [])
  );

  const loadLanguages = async () => {
    try {
      const languagesData = await profileService.getForeignLanguageList();
      setLanguages(languagesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load languages.');
    }
  };

  const handleAddLanguage = () => {
    navigation.navigate('AddLanguageScreen');
  };

  const handleEditLanguage = (language) => {
    navigation.navigate('AddLanguageScreen', { language, mode: 'edit' });
  };

  const handleDeleteLanguage = async (languageId, languageName) => {
    setLanguageToDelete({ id: languageId, name: languageName });
    setModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!languageToDelete) return;
    
    setModalVisible(false);
    setLoading(true);
    
            try {
      await profileService.deleteForeignLanguage(languageToDelete.id);
              
              // Update local state
              setLanguages(prevLanguages => 
        prevLanguages.filter(lang => lang.id !== languageToDelete.id)
              );
              
      setLanguageToDelete(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove language. Please try again.');
    } finally {
      setLoading(false);
          }
  };

  const handleDeleteCancel = () => {
    setModalVisible(false);
    setLanguageToDelete(null);
  };

  const handleSave = () => {
    // Navigate back to profile screen
    navigation.navigate('ProfileScreen');
  };

  const handleAddFromBottom = () => {
    navigation.navigate('AddLanguageScreen');
  };

  const getLanguageFlagLocal = (languageName) => {
    return getLanguageFlag(languageName);
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.languageCard}
      onPress={() => handleEditLanguage(item)}
    >
      <View style={styles.languageInfo}>
        <View style={styles.languageHeader}>
          <Text style={styles.flagText}>{getLanguageFlag(item.languageName)}</Text>
          <Text style={styles.languageName}>{item.languageName}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level: {item.languageLevel || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteLanguage(item.id || item.foreignLanguageId, item.languageName)}
        >
          <Icon name="delete" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Language</Text>
      </View>
      
      {languages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="translate" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No languages added yet</Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={handleAddLanguage}>
            <Text style={styles.addFirstButtonText}>Add Your First Language</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={languages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => (item.id || item.foreignLanguageId).toString()}
            style={styles.languagesList}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity style={styles.saveButton} onPress={handleAddFromBottom}>
            <Text style={styles.saveButtonText}>ADD LANGUAGE</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal xác nhận xóa ngôn ngữ */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={handleDeleteCancel}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Language ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete the "{languageToDelete?.name}" language?
          </Text>
          <TouchableOpacity style={styles.sheetBtn} onPress={handleDeleteConfirm}>
            <Text style={styles.sheetBtnText}>
              {loading ? 'DELETING...' : 'DELETE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtnUndo} onPress={handleDeleteCancel}>
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
    paddingTop: 24,
  },

  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    width: '100%',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#150b3d',
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languagesList: {
    flex: 1,
    paddingHorizontal: 18,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  languageInfo: {
    flex: 1,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flagText: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#150b3d',
  },
  levelInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  levelText: {
    fontSize: 14,
    color: '#514a6b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  saveButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -107.5,
    width: 215,
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
  modal: { 
    justifyContent: 'flex-end', 
    margin: 0 
  },
  sheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    alignItems: 'center' 
  },
  sheetHandle: { 
    width: 34, 
    height: 4, 
    backgroundColor: '#ccc', 
    borderRadius: 2, 
    marginBottom: 16 
  },
  sheetTitle: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#150b3d', 
    marginBottom: 12 
  },
  sheetDesc: { 
    color: '#514a6b', 
    fontSize: 14, 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
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
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 0,
  },
  sheetBtnUndoText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 