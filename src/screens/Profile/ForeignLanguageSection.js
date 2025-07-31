import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
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
        // Handle error silently
      } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = () => {
    navigation.navigate('ForeignLanguageListScreen', { languages }); // Đúng logic: sang trang list language
  };

  const renderLanguageItem = ({ item }) => (
    <View key={item.foreignLanguageId} style={styles.languageTag}>
                  <Icon name="translate" size={14} color="#2563eb" style={{ marginRight: 6 }} />
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
              Alert.alert('Error', 'Failed to remove language. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading languages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="translate" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Languages</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddLanguage}>
          <Icon name="plus" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      
      {languages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="translate" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No languages added yet.</Text>
          <Text style={styles.emptySubtext}>Add your language skills to expand your opportunities</Text>
        </View>
      ) : (
        <View style={styles.languagesContainer}>
          {languages.map((item) => renderLanguageItem({ item }))}
        </View>
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
    elevation: 2,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
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
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    padding: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  separator: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginBottom: 16 
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: { 
    color: '#666', 
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  languagesList: {
    maxHeight: 200,
  },
  languageTag: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageTagText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
}); 