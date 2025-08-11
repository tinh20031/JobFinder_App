import { authService } from './authService';
import { BASE_URL } from '../constants/api';

const API_BASE_URL = `${BASE_URL}/api`;

const videoService = {
  /**
   * Upload candidate profile video with real-time progress tracking
   * @param {Object} file - Video file object from react-native-document-picker
   * @param {number} candidateProfileId - Candidate profile ID
   * @param {AbortSignal} signal - Optional AbortSignal for cancelling upload
   * @param {Function} onProgress - Progress callback function (progress, estimatedTimeLeft)
   * @returns {Promise<string>} - Returns uploaded video URL
   */
  async uploadProfileVideo(file, candidateProfileId, signal = null, onProgress = null) {
    if (!file || !candidateProfileId) {
      throw new Error("Missing file or candidateProfileId");
    }

    const token = await authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const startTime = Date.now();
      
      // Setup progress tracking
      if (onProgress) {
        let lastProgress = 0; // Track progress cuối cùng để tránh duplicate
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && event.total > 0) {
            // Đảm bảo progress không vượt quá 100%
            let progress = (event.loaded / event.total) * 100;
            progress = Math.min(progress, 100); // Giới hạn tối đa 100%
            
            // Chỉ update nếu progress thực sự thay đổi và không giảm
            if (progress >= lastProgress && progress <= 100) {
              lastProgress = progress;
              
              // Tính thời gian thật dựa trên tốc độ upload
              const elapsed = Date.now() - startTime;
              let estimatedTimeLeft = '';
              
              if (elapsed > 0 && event.loaded > 0) {
                const bytesPerMs = event.loaded / elapsed;
                const remainingBytes = Math.max(0, event.total - event.loaded);
                const remainingMs = remainingBytes / bytesPerMs;
                const secondsLeft = Math.ceil(remainingMs / 1000);
                
                              if (secondsLeft > 0) {
                estimatedTimeLeft = `About ${secondsLeft}s remaining...`;
              } else {
                estimatedTimeLeft = 'Completed...';
              }
              }
              
              onProgress(Math.floor(progress), estimatedTimeLeft);
            }
          }
        });
      }

      // Setup response handling
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.url);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      // Đảm bảo progress luôn là 100% khi hoàn thành
      xhr.addEventListener('loadend', () => {
        if (onProgress) {
          onProgress(100, 'Completed!');
        }
      });

      // Setup error handling
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled by user.'));
      });

      // Setup timeout
      xhr.timeout = 300000; // 5 phút
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout. Please check your internet connection and try again.'));
      });

      // Setup abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'video/mp4',
        name: file.name || 'profile-video.mp4'
      });

      // Open and send request
      xhr.open('POST', `${API_BASE_URL}/Video/upload-video?candidateProfileId=${candidateProfileId}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      // Note: Don't set Content-Type header for FormData, let browser set it automatically
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data'); // Remove this line
      
      xhr.send(formData);
    });
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