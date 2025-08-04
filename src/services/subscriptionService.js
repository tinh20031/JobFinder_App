import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const subscriptionService = {
  /**
   * Lấy thông tin subscription của người dùng hiện tại
   * @returns {Promise<Object>} Thông tin subscription
   */
  async getMySubscription() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      console.log('🔍 Calling API: GET /payment/my-subscription');
      console.log('📍 Full URL:', `${BASE_URL}/api/payment/my-subscription`);
      
      const response = await fetch(`${BASE_URL}/api/payment/my-subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Lỗi HTTP! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Subscription data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },

  /**
   * Lấy số lượt try-match còn lại
   * @returns {Promise<number|null>} Số lượt còn lại hoặc null nếu không có thông tin
   */
  async getTryMatchRemaining() {
    try {
      const subscription = await this.getMySubscription();
      console.log('📊 Subscription data for try-match:', subscription);
      
      // Kiểm tra subscription package
      if (subscription?.isSubscribed && subscription?.subscription?.remainingTryMatches !== undefined) {
        console.log('✅ Found subscription remainingTryMatches:', subscription.subscription.remainingTryMatches);
        return subscription.subscription.remainingTryMatches;
      }
      
      // Kiểm tra free package
      if (subscription?.freePackage?.remainingFreeMatches !== undefined) {
        console.log('✅ Found free package remainingFreeMatches:', subscription.freePackage.remainingFreeMatches);
        return subscription.freePackage.remainingFreeMatches;
      }
      
      console.log('⚠️ No try-match remaining data found in subscription');
      return null;
    } catch (error) {
      console.error('Error getting try match remaining:', error);
      return null;
    }
  },

  /**
   * Kiểm tra xem người dùng có thể sử dụng try-match không
   * @returns {Promise<boolean>} true nếu có thể sử dụng, false nếu không
   */
  async canUseTryMatch() {
    try {
      const remaining = await this.getTryMatchRemaining();
      const canUse = remaining !== null && remaining > 0;
      console.log('🔍 Can use try-match:', canUse, 'Remaining:', remaining);
      return canUse;
    } catch (error) {
      console.error('Error checking try match availability:', error);
      return false;
    }
  },

  /**
   * Test method để kiểm tra API subscription
   * @returns {Promise<Object>} Kết quả test
   */
  async testSubscriptionAPI() {
    try {
      console.log('🧪 Testing subscription API...');
      const subscription = await this.getMySubscription();
      const remaining = await this.getTryMatchRemaining();
      const canUse = await this.canUseTryMatch();
      
      const result = {
        success: true,
        subscription,
        remaining,
        canUse,
        timestamp: new Date().toISOString()
      };
      
      console.log('🧪 Test result:', result);
      return result;
    } catch (error) {
      console.error('🧪 Test failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};

export default subscriptionService; 