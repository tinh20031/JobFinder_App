import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import { cvMatchingService } from '../services/cvMatchingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CvMatchingModal = ({ visible, onClose, jobId, jobTitle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tryMatchRemaining, setTryMatchRemaining] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



  // Fetch try match remaining when modal opens
  useEffect(() => {
    if (visible) {
      fetchTryMatchRemaining();
    }
  }, [visible]);

  // Check authentication when modal opens
  useEffect(() => {
    if (visible) {
      checkAuthentication();
    }
  }, [visible]);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };



  const fetchTryMatchRemaining = async () => {
    try {
      // TODO: Implement subscription check
      // const res = await cvMatchingService.getMySubscription();
      // if (res?.isSubscribed && res?.subscription?.remainingTryMatches !== undefined) {
      //   setTryMatchRemaining(res.subscription.remainingTryMatches);
      // } else if (res?.freePackage?.remainingFreeMatches !== undefined) {
      //   setTryMatchRemaining(res.freePackage.remainingFreeMatches);
      // } else {
      //   setTryMatchRemaining(null);
      // }
    } catch {
      setTryMatchRemaining(null);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: 'application/pdf',
        presentationStyle: 'fullScreen',
      });
      
             if (result.size && result.size > 5 * 1024 * 1024) {
         setErrorMessage('File size must be less than 5MB.');
         setShowErrorModal(true);
         return;
       }
      
      setSelectedFile(result);
         } catch (err) {
       if (!DocumentPicker.isCancel(err)) {
         setErrorMessage('Failed to pick file. Please try again.');
         setShowErrorModal(true);
       }
     }
  };

  const handleTryMatch = async () => {
    // Check remaining attempts
    if (tryMatchRemaining !== null && tryMatchRemaining <= 0) {
      Alert.alert(
        'Out of Try-match Attempts',
        'You have used up all your try-match attempts. Would you like to upgrade your package to continue using try-match?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Package', onPress: () => {
            // TODO: Navigate to packages page
            onClose();
          }}
        ]
      );
      return;
    }

         if (!isAuthenticated) {
       setErrorMessage('Please login to use this feature');
       setShowErrorModal(true);
       return;
     }

     if (!selectedFile) {
       setErrorMessage('Please upload a PDF CV file.');
       setShowErrorModal(true);
       return;
     }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('JobId', jobId);
      formData.append('CvFile', {
        uri: Platform.OS === 'ios' ? selectedFile.uri.replace('file://', '') : selectedFile.uri,
        type: selectedFile.type || 'application/pdf',
        name: selectedFile.name || 'cv.pdf',
      });

      const response = await cvMatchingService.tryMatch(formData);
      
                           if (response.success) {
         setShowSuccessModal(true);
       } else {
         setErrorMessage(response.errorMessage || 'An error occurred, please try again.');
         setShowErrorModal(true);
       }
     } catch (error) {
       setErrorMessage(error.message || 'An error occurred, please try again.');
       setShowErrorModal(true);
     } finally {
      setIsLoading(false);
    }
  };



  const renderModalContent = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.authContent}>
          <MaterialIcons name="lock" size={48} color="#2563eb" />
          <Text style={styles.authTitle}>Try CV Match</Text>
          <Text style={styles.authDesc}>Please login to use the CV Match feature.</Text>
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <MaterialIcons name="search" size={32} color="#fff" />
          </View>
          <Text style={styles.introTitle}>Try CV Match</Text>
          <Text style={styles.introDesc}>
            Upload a PDF to check how well it matches this job.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload your CV</Text>
          
                     <TouchableOpacity style={styles.uploadArea} onPress={handleFilePick}>
             <MaterialIcons name="cloud-upload" size={32} color="#2563eb" />
             <Text style={styles.uploadText}>Click to select PDF file</Text>
             <Text style={styles.uploadSubtext}>Or tap here to browse</Text>
             
             {selectedFile && (
               <View style={styles.selectedFileContainer}>
                 <MaterialIcons name="description" size={16} color="#28a745" />
                 <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                 <TouchableOpacity 
                   style={styles.removeBtn}
                   onPress={() => setSelectedFile(null)}
                 >
                   <MaterialIcons name="close" size={16} color="#dc3545" />
                 </TouchableOpacity>
               </View>
             )}
           </TouchableOpacity>

           <View style={styles.buttonContainer}>
             <TouchableOpacity
            style={[
              styles.analyzeBtn,
              (isLoading || !selectedFile) && styles.analyzeBtnDisabled
            ]}
            onPress={handleTryMatch}
            disabled={isLoading || !selectedFile}
          >
                         {isLoading ? (
               <View style={styles.btnContent}>
                 <ActivityIndicator size="small" color="#fff" />
                 <Text style={styles.analyzeBtnText}>Analyzing...</Text>
               </View>
             ) : (
               <View style={styles.btnContent}>
                 <MaterialIcons name="search" size={20} color="#fff" />
                 <Text style={styles.analyzeBtnText}>Analyze</Text>
               </View>
             )}
           </TouchableOpacity>
           </View>
         </View>
      </ScrollView>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Try CV Match</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {renderModalContent()}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Your request is being processed.{'\n'}The result will appear in your try-match history.
            </Text>
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                onClose();
              }}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
                 </View>
       </Modal>

       {/* Error Modal */}
       <Modal
         visible={showErrorModal}
         animationType="fade"
         transparent={true}
         statusBarTranslucent={true}
         onRequestClose={() => setShowErrorModal(false)}
       >
         <View style={styles.errorModalOverlay}>
           <View style={styles.errorModalContainer}>
             <View style={styles.errorIconContainer}>
               <MaterialIcons name="error" size={64} color="#EF4444" />
             </View>
             <Text style={styles.errorTitle}>Error!</Text>
             <Text style={styles.errorMessage}>
               {errorMessage}
             </Text>
             <TouchableOpacity 
               style={styles.errorButton}
               onPress={() => setShowErrorModal(false)}
             >
               <Text style={styles.errorButtonText}>OK</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
     </>
   );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  authContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  authDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 32,
  },

  uploadArea: {
    borderWidth: 2,
    borderColor: '#b3b8d0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8faff',
    marginTop: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#888',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  selectedFileName: {
    fontSize: 14,
    color: '#28a745',
    flex: 1,
  },
  removeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  analyzeBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeBtnDisabled: {
    backgroundColor: '#ccc',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
    analyzeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  successModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 1000,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  successButton: {
    backgroundColor: '#1967D2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 1000,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  errorButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

 });

export default CvMatchingModal; 