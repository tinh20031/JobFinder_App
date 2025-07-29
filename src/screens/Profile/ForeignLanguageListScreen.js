import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ForeignLanguageListScreen({ navigation, route }) {
  const { languages: initialLanguages } = route.params || {};
  const [languages, setLanguages] = useState(initialLanguages || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialLanguages) {
      loadLanguages();
    }
  }, [initialLanguages]);

  const loadLanguages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const languagesData = await profileService.getForeignLanguageList(token);
      setLanguages(languagesData);
    } catch (error) {
      console.log('Load languages error:', error);
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
    Alert.alert(
      `Remove ${languageName} ?`,
      `Are you sure you want to delete this ${languageName} language?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await profileService.deleteForeignLanguage(languageId, token);
              
              // Update local state
              setLanguages(prevLanguages => 
                prevLanguages.filter(lang => lang.foreignLanguageId !== languageId)
              );
              
              Alert.alert('Success', 'Language removed successfully!');
            } catch (error) {
              console.log('Remove language error:', error);
              Alert.alert('Error', 'Failed to remove language. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderLanguageItem = ({ item }) => (
    <View style={styles.languageCard}>
      <View style={styles.languageInfo}>
        <View style={styles.languageHeader}>
          <Text style={styles.languageName}>{item.languageName}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level: {item.languageLevel || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditLanguage(item)}
        >
          <Icon name="edit" size={20} color="#130160" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteLanguage(item.foreignLanguageId, item.languageName)}
        >
          <Icon name="delete" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#150b3d" />
      </TouchableOpacity>
      
      <Text style={styles.header}>Language ({languages.length})</Text>
      
      {languages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="translate" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No languages added yet</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddLanguage}>
            <Text style={styles.addButtonText}>Add Your First Language</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={languages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.foreignLanguageId.toString()}
            style={styles.languagesList}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity style={styles.changeButton} onPress={handleAddLanguage}>
            <Text style={styles.changeButtonText}>CHANGE</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#150b3d',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
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
  addButton: {
    backgroundColor: '#130160',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  addButtonText: {
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
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#150b3d',
    marginRight: 8,
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
  changeButton: {
    backgroundColor: '#130160',
    borderRadius: 8,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  changeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.84,
  },
}); 