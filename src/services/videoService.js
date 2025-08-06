import { authService } from './authService';
import { BASE_URL } from '../constants/api';

const API_BASE_URL = `${BASE_URL}/api`;

const videoService = {
  /**
   * Upload candidate profile video
   * @param {Object} file - Video file object from react-native-document-picker
   * @param {number} candidateProfileId - Candidate profile ID
   * @returns {Promise<string>} - Returns uploaded video URL
   */
  async uploadProfileVideo(file, candidateProfileId) {
    if (!file || !candidateProfileId) {
      throw new Error("Missing file or candidateProfileId");
    }

    const token = await authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'video/mp4',
      name: file.name || 'profile-video.mp4'
    });

    // Tạo AbortController để có thể cancel request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 phút timeout

    try {
      const response = await fetch(
        `${API_BASE_URL}/Video/upload-video?candidateProfileId=${candidateProfileId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  /**
   * Get candidate profile video URL
   * @returns {Promise<string|null>} - Returns video URL or null if not exists
   */
  async getProfileVideo() {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Lấy candidateProfileId trước
      const profileResponse = await fetch(`${API_BASE_URL}/CandidateProfile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`Failed to get profile: ${profileResponse.status}`);
      }

      const profile = await profileResponse.json();
      
      if (!profile.candidateProfileId) {
        throw new Error('No candidateProfileId found');
      }

      // Lấy video URL từ endpoint chi tiết
      const videoResponse = await fetch(`${API_BASE_URL}/CandidateProfile/${profile.candidateProfileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (videoResponse.ok) {
        const videoProfile = await videoResponse.json();
        return videoProfile.videoUrl || null;
      } else {
        // Fallback: thử lấy từ profile data
        return profile.videoUrl || null;
      }
      
    } catch (error) {
      console.error('Error getting profile video:', error);
      return null;
    }
  }
};

export default videoService; 