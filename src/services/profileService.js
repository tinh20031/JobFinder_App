import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = BASE_URL + '/api';

async function getToken() {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

const profileService = {
  getCandidateProfile: async () => {
    const token = await getToken();
    if (!token) throw new Error('No authentication');
    const res = await fetch(`${API_URL}/CandidateProfile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch candidate profile');
    return await res.json();
  },

  updateCandidateProfile: async (formData) => {
    const token = await getToken();
    if (!token) throw new Error('No authentication');
    const res = await fetch(`${API_URL}/CandidateProfile/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update candidate profile');
    return res.status === 204 ? null : await res.json();
  },
};

export default profileService; 