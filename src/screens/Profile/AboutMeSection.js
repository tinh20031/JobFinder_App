import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import profileService from '../../services/profileService';

export default function AboutMeSection({ aboutMe, loading, onAdd }) {
  const navigation = useNavigation();
  const [token, setToken] = useState(null);

  React.useEffect(() => {
    async function fetchToken() {
      const t = await profileService.getToken();
      setToken(t);
    }
    fetchToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="account-circle-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
        <Text style={styles.title}>About Me</Text>
        {aboutMe && (aboutMe.aboutMeId || aboutMe.id) && (
          <TouchableOpacity
            onPress={() => {
              if (navigation.getParent) {
                const parentNav = navigation.getParent();
                if (parentNav && parentNav.navigate) {
                  console.log('Navigating to AboutMeEdit with data:', aboutMe);
                  parentNav.navigate('AboutMeEdit', { aboutMe, token });
                }
              }
            }}
          >
            <Icon name="pencil" size={20} color="#ff9228" />
          </TouchableOpacity>
        )}
        {!aboutMe && onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={18} color="#ff9228" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.content}>{aboutMe?.aboutMeDescription || 'Add something about yourself...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontWeight: 'bold', fontSize: 16, color: '#150b3d', flex: 1 },
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
  content: { color: '#514a6b', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, minHeight: 60, marginBottom: 10 },
  saveBtn: { backgroundColor: '#ff9228', borderRadius: 8, padding: 10, alignItems: 'center' }
}); 