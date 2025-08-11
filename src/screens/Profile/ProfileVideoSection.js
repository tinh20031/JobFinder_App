import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Linking,
  PermissionsAndroid
} from 'react-native';
import Modal from 'react-native-modal';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import videoService from '../../services/videoService';
import profileService from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper functions for video format handling
const isVideoFormatSupported = (file) => {
  const supportedFormats = [
    'video/mp4',
    'video/avi', 
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv'
  ];
  
  const supportedExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  
  const fileType = file.type || file.mimeType || '';
  const fileName = file.name || file.fileName || '';
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  // Kiểm tra cả MIME type và file extension
  return supportedFormats.includes(fileType) || supportedExtensions.includes(fileExtension);
};

const isMP4Format = (file) => {
  const fileType = file.type || file.mimeType || '';
  const fileName = file.name || file.fileName || '';
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  return fileType.includes('mp4') || fileExtension === 'mp4';
};

const getVideoFormatInfo = (file) => {
  const fileType = file.type || file.mimeType || '';
  const fileName = file.name || file.fileName || '';
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  return {
    mimeType: fileType,
    extension: fileExtension,
    isMP4: isMP4Format(file),
    isSupported: isVideoFormatSupported(file)
  };
};

const ProfileVideoSection = ({ navigation }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState('');
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [uploadStage, setUploadStage] = useState('idle'); // 'idle', 'uploading', 'processing', 'completed'
  const [processingMessage, setProcessingMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateProfileId, setCandidateProfileId] = useState(null);

  useEffect(() => {
    fetchVideoData();
  }, []);

  const fetchVideoData = async () => {
    setLoading(true);
    try {
      // Get candidate profile ID
      const profile = await profileService.getCandidateProfile();
      setCandidateProfileId(profile.candidateProfileId);
      
      // Get video URL
      let video = await videoService.getProfileVideo();
      
      // Fallback: thử lấy từ profile nếu videoService không trả về
      if (!video) {
        video = profile.videoUrl;
      }
      
      setVideoUrl(video);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
        copyTo: 'cachesDirectory',
      });

      if (result && result[0]) {
        // Sử dụng helper function để kiểm tra format
        const file = result[0];
        const formatInfo = getVideoFormatInfo(file);
        
        if (!formatInfo.isSupported) {
          Alert.alert(
            'Unsupported Video Format',
            `The file "${file.name}" has an unsupported format (${formatInfo.extension?.toUpperCase()}).\n\nSupported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV\n\nPlease select a video with a supported format.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Learn More', 
                onPress: () => {
                  Alert.alert(
                    'Video Format Requirements',
                    'For best compatibility, we recommend:\n\n• MP4 (H.264 codec)\n• Maximum file size: 50MB\n• Resolution: 720p or lower\n• Duration: 1-5 minutes\n\nYou can use free online converters like:\n• Online Video Converter\n• CloudConvert\n• Convertio'
                  );
                }
              }
            ]
          );
          return;
        }

        // Cảnh báo nếu không phải MP4 format
        if (!formatInfo.isMP4) {
          Alert.alert(
            'Format Warning',
            `Your selected video is in ${formatInfo.extension?.toUpperCase()} format. While this is supported, MP4 (H.264) is recommended for best compatibility and smaller file sizes.\n\nWould you like to continue or select an MP4 video instead?`,
            [
              { text: 'Select MP4 Video', style: 'cancel' },
              { text: 'Continue Anyway', onPress: () => uploadVideo(file) }
            ]
          );
          return;
        }
        
        await uploadVideo(file);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick video file');
      }
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to camera to record videos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const handleRecordVideo = async () => {
    try {
      // Request camera permission first
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to record video.');
        return;
      }
      
      // Device-specific camera options
      const cameraOptions = {
        mediaType: 'video',
        videoQuality: 'high',
        saveToPhotos: false,
        includeBase64: false,
        presentationStyle: 'fullScreen',
      };

      // Platform-specific optimizations
      if (Platform.OS === 'android') {
        // Android specific options - tối ưu cho Redmi K20 Pro và các thiết bị Android khác
        Object.assign(cameraOptions, {
          android: {
            videoQuality: 'high',
            videoCodec: 'h264',
            format: 'mp4',
            maxDuration: 300, // 5 phút max
            maxFileSize: 50 * 1024 * 1024, // 50MB max
            // Thêm các options để đảm bảo format MP4 trên Android
            recordingHint: 'Recording in MP4 format...',
            // Tối ưu cho Redmi K20 Pro
            cameraType: 'back',
            // Đảm bảo sử dụng H.264 codec
            videoBitrate: 2000000, // 2Mbps
            videoFrameRate: 30,
          }
        });
      } else {
        // iOS specific options
        Object.assign(cameraOptions, {
          ios: {
            videoQuality: 'high',
            videoCodec: 'h264',
            format: 'mp4',
            maxDuration: 300,
            maxFileSize: 50 * 1024 * 1024,
          }
        });
      }
      
      const result = await launchCamera(cameraOptions);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Camera Error', result.errorMessage || 'Failed to open camera');
        return;
      }

      if (result.assets && result.assets[0]) {
        const videoFile = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'video/mp4',
          name: result.assets[0].fileName || 'recorded-video.mp4',
          size: result.assets[0].fileSize,
        };
        
        // Kiểm tra format ngay sau khi record
        const formatInfo = getVideoFormatInfo(videoFile);
        
        if (!formatInfo.isMP4) {
          // Nếu không phải MP4, hiển thị cảnh báo và gợi ý
          Alert.alert(
            'Video Format Warning',
            `Your device recorded video in ${formatInfo.extension?.toUpperCase()} format instead of MP4.\n\nThis commonly happens on some Android devices (like Redmi, Xiaomi, etc.) that default to other formats.\n\nFor best compatibility, we recommend:\n• MP4 (H.264 codec)\n• Maximum file size: 50MB\n• Resolution: 720p or lower\n\nWould you like to continue with the current format or try recording again?`,
            [
              { text: 'Try Again', style: 'cancel' },
              { text: 'Continue Anyway', onPress: () => uploadVideo(videoFile) }
            ]
          );
          return;
        }
        
        await uploadVideo(videoFile);
      } else {
        Alert.alert('Error', 'No video was recorded');
      }
    } catch (error) {
      if (error.code === 'E_PICKER_CANCELLED') {
        // User cancelled, do nothing
      } else if (error.code === 'E_NO_CAMERA_PERMISSION') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in your device settings to record video.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert('Camera Error', 'Failed to open camera: ' + error.message);
      }
    }
  };

  const cancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setUploading(false);
      setUploadProgress(0);
      setEstimatedTimeLeft('');
      setUploadStage('idle');
      setProcessingMessage('');
      setAbortController(null);
    }
  };

  const uploadVideo = async (file) => {
    if (!candidateProfileId) {
      Alert.alert('Error', 'Profile not loaded. Please try again.');
      return;
    }

    // Sử dụng helper function để kiểm tra format
    const formatInfo = getVideoFormatInfo(file);
    
    if (!formatInfo.isSupported) {
      Alert.alert(
        'Unsupported Video Format',
        `The video format "${formatInfo.mimeType || formatInfo.extension}" is not supported.\n\nSupported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV\n\nPlease convert your video to a supported format before uploading.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Learn More', 
            onPress: () => {
              Alert.alert(
                'Video Format Requirements',
                'For best compatibility, we recommend:\n\n• MP4 (H.264 codec)\n\nYou can use free online converters like:\n• Online Video Converter\n• CloudConvert\n• Convertio'
              );
            }
          }
        ]
      );
      return;
    }

    // Cảnh báo nếu không phải MP4 format
    if (!formatInfo.isMP4) {
      Alert.alert(
        'Format Warning',
        `Your video is in ${formatInfo.extension?.toUpperCase()} format. While this is supported, MP4 (H.264) is recommended for best compatibility and smaller file sizes.\n\nWould you like to continue or try recording again in MP4 format?`,
        [
          { text: 'Try Again', style: 'cancel' },
          { text: 'Continue Anyway', onPress: () => uploadVideo(file) }
        ]
      );
      return;
    }

    

    setUploading(true);
    setUploadProgress(0);
    setUploadStartTime(Date.now());
    setUploadStage('uploading');
    setProcessingMessage('');
    
    // Tạo AbortController để có thể hủy upload
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      // Progress callback function để nhận progress thật từ XMLHttpRequest
      const handleProgress = (progress, estimatedTimeLeft) => {
        // Validation: Đảm bảo progress hợp lệ
        if (typeof progress !== 'number' || isNaN(progress)) {
          return;
        }
        
        // Đảm bảo progress không vượt quá 100% và không âm
        const safeProgress = Math.max(0, Math.min(progress, 100));
        
        // Chỉ update nếu progress hợp lệ
        if (safeProgress >= 0 && safeProgress <= 100) {
          setUploadProgress(safeProgress);
          setEstimatedTimeLeft(estimatedTimeLeft || '');
          
          // Đảm bảo stage đúng với progress
          if (safeProgress < 100) {
            setUploadStage('uploading');
            setProcessingMessage('');
          } else if (safeProgress === 100) {
            setUploadStage('processing');
            setProcessingMessage('Server is processing video...');
          }
          

        }
      };

      // Chuyển sang stage processing trước khi gọi API
      setUploadStage('processing');
      setProcessingMessage('Processing video on server...');
      
      const url = await videoService.uploadProfileVideo(
        file, 
        candidateProfileId, 
        controller.signal,
        handleProgress
      );
      
      // Upload và processing hoàn thành
      setUploadProgress(100);
      setEstimatedTimeLeft('Completed!');
      setUploadStage('completed');
      setProcessingMessage('Video has been processed successfully!');
      
      setTimeout(() => {
        setVideoUrl(url);
        setUploading(false);
        setUploadProgress(0);
        setEstimatedTimeLeft('');
        setUploadStage('idle');
        setProcessingMessage('');
        setAbortController(null);
        Alert.alert('Success', 'Video uploaded successfully!');
        setShowOptions(false);
      }, 1000);
      
    } catch (error) {
      if (error.message && error.message.includes('cancelled')) {
        Alert.alert('Upload Cancelled', 'Video upload has been cancelled.');
      } else {
        // Xử lý lỗi cụ thể
        let errorMessage = 'Failed to upload video';
        if (error.message) {
          if (error.message.includes('unsupported video format')) {
            errorMessage = 'Video format is not supported. Please use MP4, AVI, MOV, WMV, FLV, WEBM, or MKV format.';
          } else if (error.message.includes('network')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Upload timeout. Please check your internet connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }
        
        Alert.alert('Upload Failed', errorMessage, [
          { text: 'OK', style: 'default' },
          { 
            text: 'Try Again', 
            onPress: () => {
              // Có thể thêm logic retry ở đây
            }
          }
        ]);
      }
      
      setUploading(false);
      setUploadProgress(0);
      setEstimatedTimeLeft('');
      setUploadStage('idle');
      setProcessingMessage('');
      setAbortController(null);
    }
  };

  const handleDeleteVideo = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteVideo = async () => {
    try {
      // Note: You might need to implement a delete endpoint in your API
      // For now, we'll just clear the local state
      setVideoUrl(null);
      setShowDeleteModal(false);
      Alert.alert('Success', 'Video removed from profile');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete video');
    }
  };

  const renderVideoPreview = () => {
    if (!videoUrl) return null;

    return (
      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.videoWrapper}
          onPress={() => {
            setShowVideoModal(true);
          }}
        >
          <Icon name="video" size={40} color="#2563eb" />
          <Text style={styles.videoText}>Profile Video</Text>
          <Text style={styles.videoSubtext}>Tap to view</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteVideo}
        >
          <MaterialIcons name="delete" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="video-outline" size={48} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No Profile Video</Text>
      <Text style={styles.emptySubtitle}>
        Add a video introduction to make your profile stand out{'\n'}
        <Text style={styles.formatHint}>
          Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV
        </Text>
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Icon name="video" size={22} color="#2563eb" style={{ marginRight: 10 }} />
          <Text style={styles.title}>Profile Introduction Video</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="video" size={22} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Profile Introduction Video</Text>
      </View>
      <View style={styles.separator} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      ) : videoUrl ? (
        renderVideoPreview()
      ) : (
        renderEmptyState()
      )}
      
              {uploading && (
          <View style={styles.uploadTipContainer}>
            <Text style={styles.uploadTip}>
              Upload may take a few minutes for large videos. Please ensure you have a stable internet connection.
            </Text>
            <Text style={styles.uploadFormatInfo}>
              Recording in MP4 (H.264) format for best compatibility
            </Text>
            
            {/* Progress Bar với thời gian dự kiến */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {Math.min(uploadProgress, 100)}%
                </Text>
                <Text style={styles.timeLeftText}>
                  {estimatedTimeLeft}
                </Text>
              </View>
              

            </View>
            
            {/* Nút Hủy Upload */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelUpload}
            >
              <MaterialIcons name="close" size={16} color="#dc2626" />
              <Text style={styles.cancelButtonText}>Cancel Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowOptions(true)}
        disabled={uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.addButtonText}>
                {uploadProgress < 100 ? `Uploading... ${Math.min(uploadProgress, 100)}%` : 'Processing...'}
              </Text>
          </View>
        ) : (
          <>
            <MaterialIcons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>
              {videoUrl ? 'Change Video' : 'Add Video'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Add Profile Video Modal */}
      <Modal
        isVisible={showOptions}
        onBackdropPress={() => setShowOptions(false)}
        style={styles.addVideoModal}
        backdropOpacity={0.6}
      >
        <View style={styles.addVideoSheet}>
          <View style={styles.addVideoSheetHandle} />
          <Text style={styles.addVideoSheetTitle}>Add Profile Video</Text>
          
          <View style={styles.addVideoOptionsContainer}>
            <TouchableOpacity
              style={styles.addVideoOptionButton}
              onPress={() => {
                setShowOptions(false);
                handleUploadVideo();
              }}
            >
              <Icon name="upload" size={32} color="#2563eb" />
              <Text style={styles.addVideoOptionTitle}>Upload Video</Text>
              <Text style={styles.addVideoOptionSubtitle}>Choose from your device</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addVideoOptionButton}
              onPress={() => {
                setShowOptions(false);
                handleRecordVideo();
              }}
            >
              <Icon name="video-plus" size={32} color="#2563eb" />
              <Text style={styles.addVideoOptionTitle}>Record Video</Text>
              <Text style={styles.addVideoOptionSubtitle}>Record a new video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Video URL Modal */}
      <Modal
        isVisible={showVideoModal}
        onBackdropPress={() => setShowVideoModal(false)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Video URL</Text>
          
          <View style={styles.urlContainer}>
            <Text style={styles.urlText} numberOfLines={3}>
              {videoUrl}
            </Text>
            <Text style={styles.urlHint}>Long press to copy</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.sheetBtn}
            onPress={async () => {
              try {
                // Kiểm tra URL có hợp lệ không
                if (!videoUrl || !videoUrl.startsWith('http')) {
                  Alert.alert('Error', 'Invalid video URL');
                  return;
                }
                
                const supported = await Linking.canOpenURL(videoUrl);
                
                if (supported) {
                  await Linking.openURL(videoUrl);
                } else {
                  // Thử mở trong browser với fallback
                  const browserUrl = videoUrl.startsWith('https://res.cloudinary.com') 
                    ? videoUrl 
                    : `https://${videoUrl.replace('http://', '')}`;
                  
                  await Linking.openURL(browserUrl);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to open video: ' + error.message);
              }
            }}
          >
            <Text style={styles.sheetBtnText}>Open in Browser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sheetBtnUndo}
            onPress={() => setShowVideoModal(false)}
          >
            <Text style={styles.sheetBtnUndoText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => setShowDeleteModal(false)}
        style={styles.modal}
        backdropOpacity={0.6}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Delete Video ?
          </Text>
          <Text style={styles.sheetDesc}>
            Are you sure you want to delete your profile video?
          </Text>
          <TouchableOpacity 
            style={styles.sheetBtn} 
            onPress={confirmDeleteVideo}
          >
            <Text style={styles.sheetBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sheetBtnUndo} 
            onPress={() => setShowDeleteModal(false)}
          >
            <Text style={styles.sheetBtnUndoText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#99aac5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#150b3d',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginTop: 12,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  videoWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  videoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  videoSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadTip: {
    fontSize: 12,
    color: '#0c4a6e',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  uploadFormatInfo: {
    fontSize: 11,
    color: '#0369a1',
    fontFamily: 'Poppins-Medium',
    fontStyle: 'italic',
  },
  uploadTipContainer: {
    marginTop: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
    // Thêm transition effect
    transition: 'width 0.3s ease-out',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'Poppins-SemiBold',
  },
  timeLeftText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },


  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  // Modal styles
  modal: { 
    justifyContent: 'flex-end', 
    margin: 0 
  },
  sheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    alignItems: 'center' 
  },
  sheetHandle: { 
    width: 34, 
    height: 4, 
    backgroundColor: '#ccc', 
    borderRadius: 2, 
    marginBottom: 16 
  },
  sheetTitle: { 
    fontSize: 18, 
    color: '#150b3d', 
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  sheetDesc: { 
    color: '#514a6b', 
    fontSize: 14, 
    marginBottom: 24, 
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 12,
  },
  sheetBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  sheetBtnUndo: {
    width: '100%',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 0,
  },
  sheetBtnUndoText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  urlContainer: {
    width: '100%',
    marginBottom: 24,
  },
  urlText: {
    fontSize: 14,
    color: '#514a6b',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  urlHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
  // Add Profile Video Modal Styles (separate from delete modal)
  addVideoModal: { 
    justifyContent: 'flex-end', 
    margin: 0 
  },
  addVideoSheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    alignItems: 'center' 
  },
  addVideoSheetHandle: { 
    width: 34, 
    height: 4, 
    backgroundColor: '#ccc', 
    borderRadius: 2, 
    marginBottom: 16 
  },
  addVideoSheetTitle: { 
    fontSize: 18, 
    color: '#150b3d', 
    marginBottom: 24,
    fontFamily: 'Poppins-Bold',
  },
  addVideoOptionsContainer: {
    width: '100%',
    gap: 16,
  },
  addVideoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addVideoOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 16,
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  addVideoOptionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 16,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 16,
    flex: 1,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 16,
    flex: 1,
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    maxWidth: SCREEN_WIDTH - 40,
    maxHeight: '80%',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  videoModalCloseButton: {
    padding: 4,
  },
  videoModalBody: {
    padding: 20,
  },
  videoUrlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  videoPreviewContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  videoPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  videoPreviewSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  videoModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  videoModalButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  videoModalButtonSecondary: {
    backgroundColor: '#f1f5f9',
  },
  videoModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoModalButtonTextSecondary: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  formatHint: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
  },
});

export default ProfileVideoSection; 
