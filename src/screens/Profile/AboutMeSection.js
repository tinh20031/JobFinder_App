import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import profileService from '../../services/profileService';
import LinearGradient from 'react-native-linear-gradient';

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9228" />
          <Text style={styles.loadingText}>Loading about me...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#fff', '#f8f9ff']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Icon name="account-circle-outline" size={22} color="#ff9228" style={{ marginRight: 10 }} />
          <Text style={styles.title}>About Me</Text>
          {aboutMe && (aboutMe.aboutMeId || aboutMe.id) && (
            <TouchableOpacity
              style={styles.editBtn}
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
              <Icon name="pencil" size={18} color="#ff9228" />
            </TouchableOpacity>
          )}
          {!aboutMe && onAdd && (
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Icon name="plus" size={18} color="#ff9228" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.separator} />
        
        {aboutMe?.aboutMeDescription ? (
          <View style={styles.contentContainer}>
            <Text style={styles.content}>{aboutMe.aboutMeDescription}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyContainer} onPress={onAdd}>
            <Icon name="plus-circle-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>Add something about yourself...</Text>
            <Text style={styles.emptySubtext}>Tell employers about your background, skills, and goals</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({ 
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 16, 
    elevation: 2,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  gradientBackground: {
    padding: 20,
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
  editBtn: {
    backgroundColor: '#fff6f2',
    borderRadius: 20,
    padding: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#fff6f2',
    borderRadius: 20,
    padding: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff9228',
  },
  content: { 
    color: '#514a6b', 
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8eaff',
    borderStyle: 'dashed',
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
  input: { 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderRadius: 8, 
    padding: 10, 
    minHeight: 60, 
    marginBottom: 10 
  },
  saveBtn: { 
    backgroundColor: '#ff9228', 
    borderRadius: 8, 
    padding: 10, 
    alignItems: 'center' 
  }
}); 