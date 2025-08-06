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

const ProfileVideoSection = ({ navigation }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
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
      console.error('Error fetching video data:', error);
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
        await uploadVideo(result[0]);
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
        console.error('Permission request error:', err);
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
      
      const result = await launchCamera({
        mediaType: 'video',
        videoQuality: 'medium',
        saveToPhotos: false,
        includeBase64: false,
        presentationStyle: 'fullScreen',
      });

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

  const uploadVideo = async (file) => {
    if (!candidateProfileId) {
      Alert.alert('Error', 'Profile not loaded. Please try again.');
      return;
    }

    // Kiểm tra kích thước file (giới hạn 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size && file.size > maxSize) {
      Alert.alert(
        'File Too Large',
        'Video file is too large. Please choose a video smaller than 50MB.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Compress Video', onPress: () => {
            Alert.alert('Info', 'Please compress your video before uploading.');
          }}
        ]
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress (vì fetch API không hỗ trợ progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const url = await videoService.uploadProfileVideo(file, candidateProfileId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setVideoUrl(url);
        setUploading(false);
        setUploadProgress(0);
        Alert.alert('Success', 'Video uploaded successfully!');
        setShowOptions(false);
      }, 500);
      
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      Alert.alert('Upload Failed', error.message || 'Failed to upload video');
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
        Add a video introduction to make your profile stand out
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
        <Text style={styles.uploadTip}>
          💡 Tip: Upload may take a few minutes for large videos. Please ensure you have a stable internet connection.
        </Text>
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
              Uploading... {uploadProgress}%
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
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
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
});

export default ProfileVideoSection; 