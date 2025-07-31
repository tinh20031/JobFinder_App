import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { LANGUAGE_SUGGESTIONS, searchLanguages } from '../../constants/languages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


export default function SearchLanguageScreen({ navigation, route }) {
  const { selectedLanguage } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGE_SUGGESTIONS);

  useFocusEffect(
    useCallback(() => {
      // Reset search when screen is focused
      setSearchText('');
      setFilteredLanguages(LANGUAGE_SUGGESTIONS);
    }, [])
  );

  const filterLanguages = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredLanguages(LANGUAGE_SUGGESTIONS);
      return;
    }

    const filtered = LANGUAGE_SUGGESTIONS.filter(lang => 
      lang.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredLanguages(filtered);
  }, [searchText]);

  useEffect(() => {
    filterLanguages();
  }, [filterLanguages]);

  const handleSelectLanguage = (language) => {
    navigation.navigate('AddLanguageScreen', { 
      selectedLanguage: language,
      mode: 'add'
    });
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.languageItem,
        selectedLanguage?.name === item.name && styles.selectedLanguageItem
      ]} 
      onPress={() => handleSelectLanguage(item)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.flagText}>{item.flag}</Text>
        <Text style={[
          styles.languageText,
          selectedLanguage?.name === item.name && styles.selectedLanguageText
        ]}>
          {item.name}
        </Text>
      </View>
      {selectedLanguage?.name === item.name && (
        <Icon name="check" size={20} color="#130160" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      
      <View style={styles.form}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#514a6b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search skills"
            placeholderTextColor="#514a6b"
          />
        </View>

        <FlatList
          data={filteredLanguages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.name}
          style={styles.languagesList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8f8', 
    alignItems: 'center'
  },


  form: { 
    width: SCREEN_WIDTH - 36, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    elevation: 2 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
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
  languagesList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedLanguageItem: {
    backgroundColor: '#d6cdfe',
    borderColor: '#130160',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 20,
    marginRight: 12,
  },
  languageText: {
    fontSize: 16,
    color: '#150b3d',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#130160',
    fontWeight: 'bold',
  },
}); 