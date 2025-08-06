import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../constants/api";

const API_URL = `${BASE_URL}/api/UserFavoriteJob`;

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getUserFavorites = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    console.log('Getting user favorites for user:', userId);
    console.log('API URL:', `${API_URL}/user/${userId}`);
    
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers,
    });
    
    console.log('Get favorites response status:', response.status);
    console.log('Get favorites response ok:', response.ok);
    
    if (!response.ok) {
      console.log('Get favorites failed with status:', response.status);
      throw new Error(`Failed to get user favorites: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Get favorites response data:', data);
    return data;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
};

export const isJobFavorite = async (userId, jobId) => {
  try {
    const headers = await getAuthHeaders();
    console.log('Checking favorite status for user:', userId, 'job:', jobId);
    console.log('API URL:', `${API_URL}/${userId}/${jobId}`);
    
    const response = await fetch(`${API_URL}/${userId}/${jobId}`, {
      method: 'GET',
      headers,
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      console.log('Response not ok, status:', response.status);
      // If 404, job is not favorited
      if (response.status === 404) {
        return false;
      }
      throw new Error(`Failed to check favorite status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Favorite check response:', data);
    
    // Handle different response types
    if (typeof data === 'boolean') {
      return data;
    } else if (data && typeof data === 'object') {
      // If response is an object, check for a boolean property
      return data.isFavorite || data.favorited || false;
    } else {
      // If we get any response, assume it's favorited
      return true;
    }
  } catch (error) {
    console.error('Error checking favorite status:', error);
    // Return false if there's an error (assume not favorited)
    return false;
  }
};

export const addFavoriteJob = async (userId, jobId) => {
  try {
    const headers = await getAuthHeaders();
    console.log('Adding favorite job for user:', userId, 'job:', jobId);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ UserId: userId, JobId: jobId }),
    });
    
    console.log('Add favorite response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to add favorite job: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Add favorite response:', data);
    return data;
  } catch (error) {
    console.error('Error adding favorite job:', error);
    throw error;
  }
};

export const removeFavoriteJob = async (userId, jobId) => {
  try {
    const headers = await getAuthHeaders();
    console.log('Removing favorite job for user:', userId, 'job:', jobId);
    
    const response = await fetch(`${API_URL}/${userId}/${jobId}`, {
      method: 'DELETE',
      headers,
    });
    
    console.log('Remove favorite response status:', response.status);
    
    // If 404, job is not in favorites (which is what we want)
    if (response.status === 404) {
      console.log('Remove favorite response: Job not in favorites (404)');
      return { success: true }; // Return success object for consistency
    }
    
    if (!response.ok) {
      throw new Error(`Failed to remove favorite job: ${response.status}`);
    }
    
    // For 204 No Content, don't try to parse JSON
    if (response.status === 204) {
      console.log('Remove favorite response: No content (204)');
      return { success: true }; // Return success object for consistency
    }
    
    // For other successful responses, parse JSON
    const data = await response.json();
    console.log('Remove favorite response:', data);
    return data;
  } catch (error) {
    console.error('Error removing favorite job:', error);
    throw error;
  }
}; 