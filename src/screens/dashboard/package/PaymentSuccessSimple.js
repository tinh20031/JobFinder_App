import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../../constants/colors';
import HeaderDetail from '../../../components/HeaderDetail';

const { width, height } = Dimensions.get('window');

const PaymentSuccessSimple = ({ navigation, route }) => {
  const { packageName, amount } = route.params || {};
  
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleReturnToPackage = () => {
    navigation.navigate('Package');
  };

  const handleGoToDashboard = () => {
    navigation.navigate('MainTab');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderDetail title="Payment Success" />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View 
          style={[
            styles.successIconContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            }
          ]}
        >
          <View style={styles.successIcon}>
            <Icon name="check" size={60} color="white" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View 
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your {packageName || 'package'} has been activated successfully
          </Text>
        </Animated.View>

        {/* Package Details */}
        <Animated.View 
          style={[
            styles.detailsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Icon name="gift" size={20} color={colors.primary} />
              <Text style={styles.detailTitle}>Package Activated</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Package Name</Text>
              <Text style={styles.detailValue}>{packageName || 'Premium Package'}</Text>
            </View>
            
            {amount && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Amount Paid</Text>
                <Text style={styles.detailValue}>{amount.toLocaleString()} VND</Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Icon name="check-circle" size={14} color="white" />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Features List */}
        <Animated.View 
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.featuresTitle}>What you can do now:</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="refresh" size={16} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Try-Match CV</Text>
              <Text style={styles.featureDescription}>
                Use AI to match your CV with job opportunities
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="download" size={16} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Download CV</Text>
              <Text style={styles.featureDescription}>
                Download your CV without watermarks
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="star" size={16} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Premium Features</Text>
              <Text style={styles.featureDescription}>
                Access all premium features and tools
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.actionButtons,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleGoToDashboard}
            activeOpacity={0.8}
          >
            <Icon name="home" size={16} color="white" />
            <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleReturnToPackage}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={16} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Back to Packages</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
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
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
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
});

export default PaymentSuccessSimple; 