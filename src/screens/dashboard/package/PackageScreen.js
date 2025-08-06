import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import PackageService from './PackageService';
import { colors } from '../../../constants/colors';
import HeaderDetail from '../../../components/HeaderDetail';

const { width } = Dimensions.get('window');

const PackageScreen = ({ navigation }) => {
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Lấy thông tin user
  const userId = '1'; // Thay bằng userId thực tế từ auth

  // Hàm cập nhật lại thông tin gói
  const refreshSubscription = async () => {
    setLoading(true);
    try {
      const sub = await PackageService.getMySubscription();
      setMySubscription(sub);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setMySubscription(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  // Lấy thông tin download quota
  const [downloadQuota, setDownloadQuota] = useState({
    downloadRemaining: 0,
    maxDownloads: 0,
    downloadCount: 0
  });

  useEffect(() => {
    const loadDownloadQuota = async () => {
      try {
        const quota = await PackageService.getDownloadQuota(userId);
        setDownloadQuota(quota);
      } catch (error) {
        console.error('Error loading download quota:', error);
      }
    };
    
    loadDownloadQuota();
  }, [userId]);

  const { downloadRemaining, maxDownloads, downloadCount } = downloadQuota;

  // Helper function để tính phần trăm progress
  const getProgressPercentage = (used, total) => {
    if (total === Infinity || total === 'Unlimited') return 100;
    if (total === 0) return 0;
    return Math.min(100, ((total - used) / total) * 100);
  };

  // Xử lý khi click vào button mua package
  const handleBuyPackageClick = () => {
    // Kiểm tra nếu user có gói hiện tại và chưa sử dụng hết
    if (mySubscription?.isSubscribed && mySubscription.subscription) {
      const currentPackage = mySubscription.subscription;
      const remainingTryMatches = currentPackage.remainingTryMatches || 0;
      const remainingDownloads = downloadRemaining;
      
      if (remainingTryMatches > 0 || (remainingDownloads !== 'Unlimited' && remainingDownloads > 0)) {
        const message = `You have not used up all of your current ${currentPackage.packageName} package.\n\n` +
          `- Remaining Try Matches: ${remainingTryMatches}\n` +
          `- Remaining CV Downloads: ${remainingDownloads}\n\n` +
          `Are you sure you want to purchase a new package?`;
        
        setConfirmMessage(message);
        setShowConfirmModal(true);
        return;
      }
    }
    
    // Nếu không có gói hiện tại hoặc đã sử dụng hết, chuyển thẳng đến trang buy
    navigation.navigate('BuyPackage');
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    navigation.navigate('BuyPackage');
  };

  const handleCancelPurchase = () => {
    setShowConfirmModal(false);
  };

  const renderPackageInfo = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your package information...</Text>
        </View>
      );
    }

    if (!mySubscription) {
      return (
        <View style={styles.noSubscriptionContainer}>
          <Icon name="shopping-bag" size={60} color={colors.gray} />
          <Text style={styles.noSubscriptionTitle}>Welcome to Packages</Text>
          <Text style={styles.noSubscriptionText}>
            Choose the perfect plan to unlock premium features and boost your job search experience.
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color={colors.success} />
              <Text style={styles.benefitText}>Advanced job matching</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color={colors.success} />
              <Text style={styles.benefitText}>Unlimited CV downloads</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color={colors.success} />
              <Text style={styles.benefitText}>Priority support</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.packageInfoContainer}>
        {mySubscription.isSubscribed ? (
          <View style={styles.premiumPackage}>
            <View style={styles.packageHeader}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>
                  {mySubscription.subscription?.packageName || 'Premium'}
                </Text>
                <View style={styles.statusBadge}>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.statusText}>
                    {mySubscription.subscription?.packageName || 'Active Subscription'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.packageStats}>
              {/* Try-Match Credits */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, styles.tryMatchIcon]}>
                    <Icon name="refresh" size={20} color="white" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statTitle}>Try-Match Credits</Text>
                    <Text style={styles.statDescription}>Find your perfect job matches</Text>
                  </View>
                </View>
                <View style={styles.statContent}>
                  {(() => {
                    const remaining = mySubscription.subscription?.remainingTryMatches;
                    const limit = mySubscription.subscription?.tryMatchLimit;
                    if (remaining !== undefined && limit !== undefined) {
                      const total = remaining > limit ? remaining : limit;
                      const percentage = getProgressPercentage(total - remaining, total);
                      return (
                        <>
                          <View style={styles.statNumbers}>
                            <Text style={styles.currentNumber}>{remaining}</Text>
                            <Text style={styles.divider}>/</Text>
                            <Text style={styles.totalNumber}>
                              {total === Infinity ? 'Unlimited' : total}
                            </Text>
                          </View>
                          {total !== Infinity && (
                            <View style={styles.progressBar}>
                              <View 
                                style={[styles.progressFill, { width: `${percentage}%` }]} 
                              />
                            </View>
                          )}
                        </>
                      );
                    } else if (remaining !== undefined) {
                      return (
                        <View style={styles.statNumbers}>
                          <Text style={styles.currentNumber}>{remaining}</Text>
                        </View>
                      );
                    } else {
                      return <Text style={styles.currentNumber}>-</Text>;
                    }
                  })()}
                </View>
              </View>

              {/* CV Downloads */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, styles.downloadIcon]}>
                    <Icon name="download" size={20} color="white" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statTitle}>CV Downloads</Text>
                    <Text style={styles.statDescription}>Download candidate profiles</Text>
                  </View>
                </View>
                <View style={styles.statContent}>
                  <View style={styles.statNumbers}>
                    <Text style={styles.currentNumber}>{downloadRemaining}</Text>
                    {maxDownloads !== Infinity && (
                      <>
                        <Text style={styles.divider}>/</Text>
                        <Text style={styles.totalNumber}>{maxDownloads}</Text>
                      </>
                    )}
                  </View>
                  {maxDownloads !== Infinity && (
                    <View style={styles.progressBar}>
                      <View 
                        style={[styles.progressFill, { width: `${getProgressPercentage(downloadCount, maxDownloads)}%` }]} 
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ) : mySubscription.freePackage ? (
          <View style={styles.freePackage}>
            <View style={styles.packageHeader}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>
                  {mySubscription.freePackage.name}
                </Text>
                <View style={[styles.statusBadge, styles.freeBadge]}>
                  <Icon name="star" size={16} color={colors.gray} />
                  <Text style={styles.freeStatusText}>
                    {mySubscription.freePackage.name ? `${mySubscription.freePackage.name} Plan` : 'Free Plan'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.packageStats}>
              {/* Free Try-Match */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, styles.freeTryMatchIcon]}>
                    <Icon name="refresh" size={20} color="white" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statTitle}>Free Try-Match</Text>
                    <Text style={styles.statDescription}>Limited job matching</Text>
                  </View>
                </View>
                <View style={styles.statContent}>
                  {(() => {
                    const remaining = mySubscription.freePackage?.remainingFreeMatches;
                    const limit = mySubscription.freePackage?.tryMatchLimit;
                    if (remaining !== undefined && limit !== undefined) {
                      const percentage = getProgressPercentage(limit - remaining, limit);
                      return (
                        <>
                          <View style={styles.statNumbers}>
                            <Text style={styles.currentNumber}>{remaining}</Text>
                            <Text style={styles.divider}>/</Text>
                            <Text style={styles.totalNumber}>
                              {limit === Infinity ? 'Unlimited' : limit}
                            </Text>
                          </View>
                          {limit !== Infinity && (
                            <View style={styles.progressBar}>
                              <View 
                                style={[styles.progressFill, { width: `${percentage}%` }]} 
                              />
                            </View>
                          )}
                        </>
                      );
                    } else if (limit !== undefined) {
                      return (
                        <View style={styles.statNumbers}>
                          <Text style={styles.currentNumber}>{limit}</Text>
                        </View>
                      );
                    } else {
                      return <Text style={styles.currentNumber}>-</Text>;
                    }
                  })()}
                </View>
              </View>

              {/* CV Downloads */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, styles.freeDownloadIcon]}>
                    <Icon name="download" size={20} color="white" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statTitle}>CV Downloads</Text>
                    <Text style={styles.statDescription}>Basic download access</Text>
                  </View>
                </View>
                <View style={styles.statContent}>
                  <View style={styles.statNumbers}>
                    <Text style={styles.currentNumber}>{downloadRemaining}</Text>
                    <Text style={styles.divider}>/</Text>
                    <Text style={styles.totalNumber}>{maxDownloads}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${getProgressPercentage(downloadCount, maxDownloads)}%` }]} 
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noPackageContainer}>
            <Icon name="inbox" size={60} color={colors.gray} />
            <Text style={styles.noPackageTitle}>No Package Information</Text>
            <Text style={styles.noPackageText}>
              Unable to load your package details at this time.
            </Text>
          </View>
        )}
        
        <View style={styles.packageActions}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleBuyPackageClick}
          >
            <Icon 
              name={mySubscription?.isSubscribed ? "arrow-up" : "shopping-cart"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.primaryButtonText}>
              {mySubscription?.isSubscribed ? 'Upgrade Package' : 'Buy Package'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderDetail />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>My Package</Text>
          {renderPackageInfo()}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPurchase}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm package purchase</Text>
              <TouchableOpacity onPress={handleCancelPurchase}>
                <Icon name="times" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.warningIcon}>
                <Icon name="exclamation-triangle" size={48} color={colors.warning} />
              </View>
              <Text style={styles.modalMessage}>{confirmMessage}</Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelPurchase}
              >
                <Icon name="times" size={16} color={colors.gray} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmPurchase}
              >
                <Icon name="check" size={16} color="white" />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 60,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
  },
  noSubscriptionContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noSubscriptionTitle: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 12,
    color: '#1f2937',
    fontFamily: 'Poppins-Bold',
  },
  noSubscriptionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  benefitsList: {
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#4b5563',
    fontFamily: 'Poppins-Regular',
  },
  packageInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumPackage: {
    backgroundColor: '#f8faff',
    borderWidth: 2,
    borderColor: '#e0edff',
  },
  freePackage: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  packageHeader: {
    padding: 30,
    paddingBottom: 25,
  },
  packageInfo: {
    alignItems: 'center',
  },
  packageName: {
    fontSize: 28,
    marginBottom: 12,
    color: '#1f2937',
    fontFamily: 'Poppins-Bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#059669',
    fontFamily: 'Poppins-SemiBold',
  },
  freeBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  freeStatusText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#4b5563',
    fontFamily: 'Poppins-SemiBold',
  },
  packageStats: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tryMatchIcon: {
    backgroundColor: '#667eea',
  },
  downloadIcon: {
    backgroundColor: '#06b6d4',
  },
  freeTryMatchIcon: {
    backgroundColor: '#6b7280',
  },
  freeDownloadIcon: {
    backgroundColor: '#6b7280',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 18,
    marginBottom: 6,
    color: '#1f2937',
    fontFamily: 'Poppins-SemiBold',
  },
  statDescription: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
  },
  statContent: {
    alignItems: 'center',
  },
  statNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  currentNumber: {
    fontSize: 32,
    color: '#1f2937',
    fontFamily: 'Poppins-Bold',
  },
  divider: {
    fontSize: 20,
    color: '#d1d5db',
    marginHorizontal: 8,
    fontFamily: 'Poppins-Medium',
  },
  totalNumber: {
    fontSize: 18,
    color: '#6b7280',
    fontFamily: 'Poppins-SemiBold',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  noPackageContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noPackageTitle: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 12,
    color: '#1f2937',
    fontFamily: 'Poppins-Bold',
  },
  noPackageText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  packageActions: {
    padding: 30,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
});

export default PackageScreen; 