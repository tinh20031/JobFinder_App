import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderDetail from '../../../components/HeaderDetail';
import { colors } from '../../../constants/colors';

const PaymentWebView = ({ route, navigation }) => {
  const { paymentUrl, packageName } = route.params;
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState) => {
    // Kiểm tra URL để xử lý callback từ PayOS
    const { url } = navState;
    
    console.log('🔍 PaymentWebView URL:', url);
    console.log('🔍 Route params:', route.params);
    
    // Nếu URL chứa success callback
    if (url.includes('success') || url.includes('payment_success')) {
      // Chuyển thẳng đến trang success chi tiết
      navigation.navigate('PaymentSuccess', { 
        orderCode: route.params.orderCode,
        type: route.params.type || 'candidate'
      });
    }
    
    // Nếu URL chứa failure callback
    if (url.includes('failure') || url.includes('payment_failed')) {
      // Chuyển về trang trước khi thanh toán thất bại
      navigation.goBack();
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel the payment?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => navigation.goBack()
        }
      ]
    );
    return true;
  };

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <HeaderDetail />
      <SafeAreaView style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <WebView
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
});

export default PaymentWebView; 