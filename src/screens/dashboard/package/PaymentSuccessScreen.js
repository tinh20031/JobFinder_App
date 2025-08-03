import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import PackageService from './PackageService';
import { colors } from '../../../constants/colors';


const PaymentSuccessScreen = ({ navigation, route }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin từ route params
  const { orderCode, type = 'candidate' } = route.params || {};

  useEffect(() => {
    if (orderCode) {
      checkPaymentStatus();
    } else {
      setError('Missing or invalid order code!');
      setLoading(false);
    }
  }, [orderCode, type]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const paymentStatus = await PackageService.checkPaymentStatus(orderCode, type);
      setStatus(paymentStatus);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError('Unable to check payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToPackage = () => {
    navigation.navigate('Package');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount) return '0 VND';
    return `${amount.toLocaleString()} VND`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking payment status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={60} color={colors.error} />
          <Text style={styles.errorTitle}>Payment Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.returnButton} 
            onPress={handleReturnToPackage}
          >
            <Text style={styles.returnButtonText}>Return to Package</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!status) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="info-circle" size={60} color={colors.warning} />
          <Text style={styles.errorTitle}>No Payment Data</Text>
          <Text style={styles.errorText}>No payment status data available!</Text>
          <TouchableOpacity 
            style={styles.returnButton} 
            onPress={handleReturnToPackage}
          >
            <Text style={styles.returnButtonText}>Return to Package</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPaymentSuccessful = String(status.status).toLowerCase() === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <Icon name="check-circle" size={80} color={colors.success} />
            </View>
            <Text style={styles.headerTitle}>Your order is completed!</Text>
            <Text style={styles.headerSubtitle}>
              Thank you. Your order has been received.
            </Text>
          </View>
          {/* Order Information */}
          <View style={styles.orderInfoContainer}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            
            <View style={styles.orderInfoList}>
              <View style={styles.orderInfoItem}>
                <View style={styles.orderInfoLabel}>
                  <Icon name="hashtag" size={16} color={colors.gray} />
                  <Text style={styles.orderInfoLabelText}>Order Number</Text>
                </View>
                <Text style={styles.orderInfoValue}>{status.orderCode}</Text>
              </View>

              <View style={styles.orderInfoItem}>
                <View style={styles.orderInfoLabel}>
                  <Icon name="calendar" size={16} color={colors.gray} />
                  <Text style={styles.orderInfoLabelText}>Date</Text>
                </View>
                <Text style={styles.orderInfoValue}>
                  {formatDate(status.updatedAt)}
                </Text>
              </View>

              <View style={styles.orderInfoItem}>
                <View style={styles.orderInfoLabel}>
                  <Icon name="money-bill" size={16} color={colors.gray} />
                  <Text style={styles.orderInfoLabelText}>Total</Text>
                </View>
                <Text style={styles.orderInfoValue}>
                  {formatAmount(status.amount)}
                </Text>
              </View>

              <View style={styles.orderInfoItem}>
                <View style={styles.orderInfoLabel}>
                  <Icon name="info-circle" size={16} color={colors.gray} />
                  <Text style={styles.orderInfoLabelText}>Status</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  isPaymentSuccessful ? styles.statusSuccess : styles.statusPending
                ]}>
                  <Icon 
                    name={isPaymentSuccessful ? "check" : "clock-o"} 
                    size={14} 
                    color="white" 
                  />
                  <Text style={styles.statusText}>{status.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Order Details */}
          <View style={styles.orderDetailsContainer}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            
            <View style={styles.orderTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Product</Text>
                <Text style={styles.tableHeaderText}>Subtotal</Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Subscription Package</Text>
                <Text style={styles.tableCell}>
                  {formatAmount(status.amount)}
                </Text>
              </View>
              
              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterLabel}>Total</Text>
                <Text style={styles.tableFooterAmount}>
                  {formatAmount(status.amount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Status Message */}
          <View style={styles.statusMessageContainer}>
            {isPaymentSuccessful ? (
              <View style={styles.successMessage}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.successMessageText}>
                  Payment successful! Your package has been activated.
                </Text>
              </View>
            ) : (
              <View style={styles.errorMessage}>
                <Icon name="exclamation-triangle" size={20} color={colors.error} />
                <Text style={styles.errorMessageText}>
                  Payment not completed or failed.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleReturnToPackage}
            >
              <Icon name="arrow-left" size={16} color="white" />
              <Text style={styles.primaryButtonText}>
                Return to My Package
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => navigation.navigate('Package')}
            >
              <Icon name="shopping-bag" size={16} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>
                View My Package
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#1f2937',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  successIcon: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  orderInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderInfoList: {
    gap: 15,
  },
  orderInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderInfoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderInfoLabelText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  orderInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusSuccess: {
    backgroundColor: colors.success,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  orderDetailsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTable: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tableHeaderText: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tableCell: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#4b5563',
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  tableFooterLabel: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tableFooterAmount: {
    flex: 1,
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'right',
  },
  statusMessageContainer: {
    marginBottom: 30,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successMessageText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.success,
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorMessageText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
  actionButtons: {
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  returnButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen; 