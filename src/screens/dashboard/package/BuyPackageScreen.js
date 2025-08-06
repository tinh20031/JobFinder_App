import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import PackageService from './PackageService';
import { colors } from '../../../constants/colors';
import HeaderDetail from '../../../components/HeaderDetail';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 20;
const CARD_HEIGHT = height * 0.5; // Giảm chiều cao card từ 0.65 xuống 0.5

const BuyPackageScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnimations = useRef([]).current;

  useEffect(() => {
    fetchPackages();
    // Start entrance animations
    Animated.parallel([
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Initialize card animations
    if (packages && packages.length > 0) {
      cardAnimations.current = packages.map(() => ({
        fade: new Animated.Value(0),
        slide: new Animated.Value(30),
        scale: new Animated.Value(0.8),
      }));
      
      // Animate cards entrance with stagger
      cardAnimations.current.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.parallel([
            Animated.timing(anim.fade, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim.slide, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [packages]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const packagesData = await PackageService.getSubscriptionPackages();
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Alert.alert('Error', 'Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    // Không cho phép chọn gói free
    if (pkg.name?.toLowerCase().includes('free')) {
      Alert.alert('Info', 'This is your current free plan. Please select a paid package to upgrade.');
      return;
    }
    
    setSelectedPackage(pkg);
    // Add selection animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a package first.');
      return;
    }

    try {
      setProcessing(true);
      
      // Tạo thanh toán
      const paymentResponse = await PackageService.createPayment(selectedPackage.subscriptionTypeId);
      
      if (paymentResponse && paymentResponse.checkoutUrl) {
        // Chuyển hướng đến WebView để thanh toán
        navigation.navigate('PaymentWebView', {
          paymentUrl: paymentResponse.checkoutUrl,
          packageName: selectedPackage.name,
          orderCode: paymentResponse.orderCode,
          amount: selectedPackage.price
        });
      } else {
        Alert.alert('Error', 'Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Failed to create payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPackageCard = ({ item: pkg, index }) => {
    const isSelected = selectedPackage?.subscriptionTypeId === pkg.subscriptionTypeId;
    const isPopular = pkg.name?.toLowerCase().includes('premium');
    const isFree = pkg.name?.toLowerCase().includes('free');
    
    // Get animation values for this card with proper null checks
    const cardAnim = cardAnimations.current && cardAnimations.current[index];
    
    return (
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardAnim?.fade || 1,
              transform: [
                { translateY: cardAnim?.slide || 0 },
                { scale: cardAnim?.scale || 1 },
              ],
            }
          ]}
        >
                      <TouchableOpacity
              style={[
                styles.packageCard,
                isSelected && styles.selectedPackage,
                isPopular && styles.popularPackage,
              ]}
              onPress={() => handlePackageSelect(pkg)}
              activeOpacity={isFree ? 1 : 0.9}
              disabled={isFree}
            >
            {isPopular && (
              <Animated.View 
                style={[
                  styles.popularBadge,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }
                ]}
              >
                <Icon name="star" size={12} color="white" />
                <Text style={styles.popularText}>Most Popular</Text>
              </Animated.View>
            )}
            
            {isFree && (
              <Animated.View 
                style={[
                  styles.currentPlanBadge,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }
                ]}
              >
                <Icon name="check" size={12} color="white" />
                <Text style={styles.currentPlanText}>Current Plan</Text>
              </Animated.View>
            )}
            
            <View style={styles.packageHeader}>
              <View style={styles.packageIconContainer}>
                <Icon 
                  name={isFree ? "gift" : isPopular ? "diamond" : "star"} 
                  size={24} 
                  color={isPopular ? "#f59e0b" : colors.primary} 
                />
              </View>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packageSubtitle}>
                {pkg.description}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.packagePrice}>
                  {pkg.price ? `${pkg.price.toLocaleString()} VND` : 'Free'}
                </Text>
                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                  <Text style={styles.originalPrice}>
                    {pkg.originalPrice.toLocaleString()} VND
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.packageFeatures}>
              {/* Try-Match Feature */}
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Icon name="refresh" size={12} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>Try-match</Text>
                  <Text style={styles.featureValue}>
                    {pkg.tryMatchLimit}
                  </Text>
                </View>
              </View>

              {/* CV Download Feature */}
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Icon name="download" size={12} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>Download CV</Text>
                  <Text style={styles.featureValue}>
                    {pkg.cvDownloadLimit || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Remove Watermark Feature */}
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, isFree && styles.disabledIcon]}>
                  <Icon name="check" size={12} color={isFree ? colors.gray : colors.success} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>Remove watermark</Text>
                  <Text style={[styles.featureValue, isFree && styles.disabledFeature]}>
                    {isFree ? 'No' : 'Yes'}
                  </Text>
                </View>
              </View>
            </View>

            {isSelected && (
              <Animated.View 
                style={[
                  styles.selectedIndicator,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  }
                ]}
              >
                <Icon name="check-circle" size={20} color={colors.success} />
              </Animated.View>
            )}

                          <View
                style={[
                  styles.updateButton,
                  isSelected && styles.updateButtonSelected,
                ]}
              >
                             <Icon 
                 name={isFree ? "check" : "arrow-up"} 
                 size={14} 
                 color={isFree ? "#6b7280" : "white"} 
               />
              <Text style={[
                styles.updateButtonText,
                isSelected && styles.updateButtonTextSelected,
              ]}>
                {isFree ? 'Current Plan' : `Update to ${pkg.name}`}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      
      // Add swipe animation effect with proper null checks
      if (cardAnimations.current && cardAnimations.current[newIndex]) {
        Animated.sequence([
          Animated.timing(cardAnimations.current[newIndex].scale, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnimations.current[newIndex].scale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const renderPagination = () => {
    return (
      <Animated.View 
        style={[
          styles.paginationContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {packages && packages.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
              {
                transform: [
                  {
                    scale: index === currentIndex ? 
                      Animated.add(1, Animated.multiply(scaleAnim, 0.1)) : 1
                  }
                ]
              }
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderDetail />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.pageTitle}>Choose Your Package</Text>
          <Text style={styles.pageSubtitle}>
            Select the perfect plan that fits your needs 
          </Text>
          
          {/* Package Carousel */}
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={packages}
              renderItem={renderPackageCard}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              contentContainerStyle={styles.carouselContent}
            />
            {renderPagination()}
          </View>

          {/* Purchase Section */}
          <Animated.View 
            style={[
              styles.purchaseSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {selectedPackage && (
              <View style={styles.selectedPackageInfo}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={styles.selectedPackageTitle}>
                  Selected: {selectedPackage.name}
                </Text>
                <Text style={styles.selectedPackagePrice}>
                  {selectedPackage.price ? `${selectedPackage.price.toLocaleString()} VND` : 'Free'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                !selectedPackage && styles.purchaseButtonDisabled
              ]}
              onPress={handlePurchase}
              disabled={!selectedPackage || processing}
              activeOpacity={0.8}
            >
              {processing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="credit-card" size={16} color="white" />
                  <Text style={styles.purchaseButtonText}>
                    {selectedPackage ? 'Purchase Package' : 'Select a Package'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#374151',
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
  },
  cardWrapper: {
    // This style is for the Animated.View that wraps the card
    // It's not directly applied to the TouchableOpacity
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
  },
  selectedPackage: {
    borderColor: colors.primary,
    backgroundColor: '#f8faff',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  popularPackage: {
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.15,
  },

  popularBadge: {
    position: 'absolute',
    top: 4,
    right: 15,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: 4,
    right: 15,
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6b7280',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  currentPlanText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  packageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000000',
  },
  packageSubtitle: {
    fontSize: 12,
    color: '#000000',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'center',
  },
  packagePrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
  originalPrice: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  packageFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  disabledIcon: {
    backgroundColor: '#e5e7eb',
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 1,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  disabledFeature: {
    color: '#000000',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButtonSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
  },

  updateButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  updateButtonTextSelected: {
    color: 'white',
  },


  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  purchaseSection: {
    marginTop: 10,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedPackageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8faff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedPackageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  selectedPackagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BuyPackageScreen; 