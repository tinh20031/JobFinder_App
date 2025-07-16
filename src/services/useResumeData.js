import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/api';

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch {
    return '';
  }
};

export default function useResumeData() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setProfile({});
        setLoading(false);
        return;
      }
      const res = await fetch(`${BASE_URL}/api/CandidateProfile/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setProfile({});
      } else {
        const data = await res.json();
        setProfile(data || {});
      }
    } catch (e) {
      setProfile({});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, refetch: fetchProfile };
} 