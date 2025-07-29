import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ForeignLanguageSection({ navigation }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const languagesData = await profileService.getForeignLanguageList(token);
      setLanguages(languagesData);
    } catch (error) {
      console.log('Load languages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = () => {
    navigation.navigate('ForeignLanguageListScreen', { languages }); // Đúng logic: sang trang list language
  };

  const handleEditLanguages = () => {
    navigation.navigate('ForeignLanguageListScreen', { languages });
  };

  const renderLanguageItem = ({ item }) => (
    <View key={item.foreignLanguageId} style={styles.languageTag}>
      <Text style={styles.languageTagText}>{item.languageName}</Text>
    </View>
  );

  const handleDeleteLanguage = async (languageId) => {
    Alert.alert(
      'Remove Language',
      'Are you sure you want to remove this language?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await profileService.deleteForeignLanguage(languageId, token);
              setLanguages(prev => prev.filter(lang => lang.foreignLanguageId !== languageId));
              Alert.alert('Success', 'Language removed successfully!');
            } catch (error) {
              console.log('Delete language error:', error);
              Alert.alert('Error', 'Failed to remove language. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="translate" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Language</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddLanguage}>
          <Icon name="plus" size={18} color="#ff9228" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      
      {languages.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No foreign language added yet.</Text>
      ) : (
        <View style={styles.languagesContainer}>
          {languages.map((item) => renderLanguageItem({ item }))}
        </View>
      )}
      
      {languages.length > 0 && (
        <TouchableOpacity style={styles.seeMoreButton} onPress={handleEditLanguages}>
          <Text style={styles.seeMoreText}>See more</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    elevation: 2 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  title: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#150b3d', 
    flex: 1 
  },
  addBtn: {
    backgroundColor: '#fff6f2',
    borderRadius: 20,
    padding: 4,
    marginLeft: 8,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  separator: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginBottom: 12 
  },
  emptyText: { 
    color: '#aaa', 
    fontStyle: 'italic', 
    textAlign: 'center', 
    marginVertical: 12 
  },
  languagesList: {
    maxHeight: 200,
  },
  seeMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  seeMoreText: {
    color: '#130160',
    fontSize: 14,
    fontWeight: '500',
  },
  languageTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  languageTagText: {
    fontSize: 14,
    color: '#150b3d',
    fontWeight: '500',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
}); 