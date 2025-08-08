import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import applicationService from '../services/applicationService';
import { useToast } from 'react-native-toast-notifications'; // Giả sử bạn sử dụng thư viện toast

// Thay SuccessModalContext thành GenericModalContext
const GenericModalContext = createContext({ show: () => {}, hide: () => {} });
export const useGenericModal = () => useContext(GenericModalContext);

export const GenericModalProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success'); // 'success' | 'error'
  const show = ({
    title = 'Applied Successfully!',
    message = 'Your application has been submitted successfully. We will contact you as soon as possible.',
    type = 'success',
  }) => {
    setTitle(title);
    setMessage(message);
    setType(type);
    setVisible(true);
  };
  const hide = () => setVisible(false);
  return (
    <GenericModalContext.Provider value={{ show, hide }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <View style={styles.successOverlay}>
          <View style={[styles.successBox, type === 'error' && { borderColor: '#d32f2f', borderWidth: 2 }] }>
            <Text style={[styles.successTitle, type === 'error' && { color: '#d32f2f' }]}>{title}</Text>
            <Text style={styles.successMessage}>{message}</Text>
            <TouchableOpacity style={[styles.successBtn, type === 'error' && { backgroundColor: '#d32f2f' }]} onPress={hide}>
              <Text style={styles.successBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GenericModalContext.Provider>
  );
};

const requestStoragePermission = async () => {
  try {
    if (Platform.OS === 'android') {
      let permission = null;
      if (Platform.Version >= 33 && PERMISSIONS.ANDROID.READ_MEDIA_DOCUMENTS) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_DOCUMENTS;
      } else if (PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE) {
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      if (!permission) {
        console.error('No valid storage permission found for this Android version.');
        return false;
      }

      const result = await request(permission, {
        title: 'Storage Permission',
        message: 'This app needs access to your storage to upload CV files.',
        buttonPositive: 'Grant',
        buttonNegative: 'Deny',
      });
      return result === RESULTS.GRANTED;
    }
    return true; // iOS tự xử lý quyền
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

const JobApplyModal = ({ visible, onClose, jobId, onApplied, cvList = [], isSubmitting, onSubmittingChange }) => {
  const [selectedCV, setSelectedCV] = useState(null);
  const [uploadingCV, setUploadingCV] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const toast = useToast();
  const { show: showGenericModal } = useGenericModal();

  // Reset error khi mở lại modal
  useEffect(() => {
    if (!visible) {
      setLoading(false); // Reset loading mỗi khi modal đóng
    }
    if (visible) setError('');
  }, [visible]);

  // Kiểm tra thay đổi để cảnh báo khi đóng modal
  useEffect(() => {
    setHasUnsavedChanges(!!coverLetter || !!uploadingCV || !!selectedCV);
  }, [coverLetter, uploadingCV, selectedCV]);

  const handlePickCV = useCallback(async () => {
    setError('');
    try {
      const res = await DocumentPicker.pickSingle({
        type: 'application/pdf',
        presentationStyle: 'fullScreen',
      });
      if (res.size && res.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        showGenericModal({
          title: 'File Too Large',
          message: 'File size must be less than 5MB.',
          type: 'error',
        });
        return;
      }
      setUploadingCV(res);
      setSelectedCV(null);
      setHasUnsavedChanges(true);
      setError(''); // Reset error when file is picked successfully
      // Không hiện popup khi chọn file thành công
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setError('Failed to pick file');
        showGenericModal({
          title: 'File Selection Error',
          message: 'Error selecting file.',
          type: 'error',
        });
      }
    }
  }, []);

  const handleRemoveCV = useCallback(() => {
    setUploadingCV(null);
    setSelectedCV(null);
    setHasUnsavedChanges(!!coverLetter);
    // Không hiện popup khi xóa file
  }, [coverLetter]);

  const handleSelectExistingCV = useCallback((cv) => {
    setSelectedCV(cv);
    setUploadingCV(null);
    setHasUnsavedChanges(true);
    // Không hiện popup khi chọn CV
  }, []);

  const handleApply = useCallback(async () => {
    if (!uploadingCV && !selectedCV) {
      setError('Please select or upload a CV.');
      return;
    }
    if (!coverLetter.trim()) {
      setError('Please enter a cover letter.');
      return;
    }
    setLoading(true);
    setError('');
    if (onSubmittingChange) onSubmittingChange(true); // Đánh dấu đang submit
    onClose(); // Đóng modal ngay lập tức
    const formData = new FormData();
    if (uploadingCV) {
      formData.append('CvFile', {
        uri: Platform.OS === 'ios' ? uploadingCV.uri.replace('file://', '') : uploadingCV.uri,
        type: uploadingCV.type || 'application/pdf',
        name: uploadingCV.name || 'cv.pdf',
      });
    }
    if (selectedCV) {
      formData.append('CvId', selectedCV.id);
    }
    formData.append('CoverLetter', coverLetter.trim());
    formData.append('JobId', jobId);
    applicationService.apply(jobId, formData)
      .then(() => {
        setLoading(false);
        if (onSubmittingChange) onSubmittingChange(false); // Cho phép ấn lại khi có kết quả
        showGenericModal({
          title: 'Submitted Successfully!',
          message: 'Your CV has been submitted successfully. We will contact you as soon as possible.',
          type: 'success',
        });
        if (onApplied) onApplied();
      })
      .catch((e) => {
        setLoading(false);
        if (onSubmittingChange) onSubmittingChange(false); // Cho phép ấn lại khi có kết quả
        showGenericModal({
          title: 'Submission Failed',
          message: e.message || 'Failed to submit application. Please try again.',
          type: 'error',
        });
      });
  }, [uploadingCV, selectedCV, coverLetter, jobId, onApplied, onClose, showGenericModal, onSubmittingChange]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Close',
            style: 'destructive',
            onPress: () => {
              setCoverLetter('');
              setUploadingCV(null);
              setSelectedCV(null);
              setError('');
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const renderCVItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.radioRow, selectedCV?.id === item.id && styles.selectedCV]}
      onPress={() => handleSelectExistingCV(item)}
    >
      <View
        style={[
          styles.radioCircle,
          selectedCV?.id === item.id && { backgroundColor: '#1976d2', borderColor: '#1976d2' },
        ]}
      />
      <Text style={styles.radioLabel}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 24, android: 0 })}
      >
        <View style={styles.overlay}>
          <View style={styles.modalWrap}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Apply for Job</Text>

          {/* Existing CV List */}
          {cvList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Choose Existing CV</Text>
              <FlatList
                data={cvList}
                renderItem={renderCVItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.cvList}
              />
            </View>
          )}

          {/* Upload New CV */}
          <View style={[styles.section, styles.uploadSection]}>
            <TouchableOpacity style={styles.radioRow}>
              <View style={[styles.radioCircle, { backgroundColor: uploadingCV ? '#1976d2' : '#fff' }]} />
              <Text style={styles.radioLabel}>Upload a New CV</Text>
            </TouchableOpacity>
            <View style={styles.uploadBtnContainer}>
              <TouchableOpacity style={styles.uploadBtn} onPress={handlePickCV}>
                <Text style={styles.uploadBtnText}>Choose File</Text>
                <Text style={styles.uploadFileName}>
                  {uploadingCV ? uploadingCV.name : 'No file chosen'}
                </Text>
              </TouchableOpacity>
              {uploadingCV && (
                <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveCV}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.uploadNote}>Please upload a .pdf file, maximum 5MB.</Text>
          </View>

          {/* Cover Letter */}
          <View style={styles.section}>
            <Text style={styles.coverLabel}>Cover Letter</Text>
            <TextInput
              style={styles.coverInput}
              placeholder="Write your cover letter here..."
              value={coverLetter}
              onChangeText={(text) => {
                setCoverLetter(text);
                setHasUnsavedChanges(true);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.applyBtn, loading && styles.applyBtnDisabled]}
            onPress={handleApply}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.applyBtnText}>Submit Application</Text>
            )}
          </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrap: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: 24,
    color: '#222',
    fontFamily: 'Poppins-Regular',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    backgroundColor: '#f7fafd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  uploadSection: {
    borderColor: '#1976d2',
    borderWidth: 1,
    backgroundColor: '#f5faff',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectedCV: {
    backgroundColor: '#eaf1fb',
    borderRadius: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#1976d2',
    marginRight: 10,
  },
  radioLabel: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Poppins-SemiBold',
  },
  uploadBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf1fb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  uploadBtnText: {
    color: '#1976d2',
    fontSize: 15,
    marginRight: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  uploadFileName: {
    color: '#444',
    fontSize: 14,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  removeBtn: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  removeBtnText: {
    color: '#d32f2f',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  uploadNote: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  coverLabel: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  coverInput: {
    backgroundColor: '#f2f6fa',
    borderRadius: 8,
    minHeight: 100,
    padding: 12,
    fontSize: 15,
    color: '#222',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  applyBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#90caf9',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  cvList: {
    maxHeight: 150,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  successBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: 300,
    elevation: 10,
  },
  successTitle: {
    fontSize: 20,
    color: '#1976d2',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  successMessage: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  successBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  successBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default JobApplyModal;