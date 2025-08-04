import { BASE_URL } from '../../../constants/api.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PackageService {
  // Lấy danh sách các gói có sẵn
  static async getSubscriptionPackages() {
    try {
      console.log('🔍 Calling API: GET /payment/packages');
      console.log('📍 Full URL:', `${BASE_URL}/api/payment/packages`);
      
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${BASE_URL}/api/payment/packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Packages data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching subscription packages:', error);
      throw error;
    }
  }

  // Lấy thông tin gói hiện tại của user
  static async getMySubscription() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/payment/my-subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my subscription:', error);
      throw error;
    }
  }

  // Tạo thanh toán cho gói mới
  static async createPayment(subscriptionTypeId) {
    try {
      console.log('🔍 Calling API: POST /payment/create-payment');
      console.log('📍 Full URL:', `${BASE_URL}/api/payment/create-payment`);
      console.log('📦 Request body:', { subscriptionTypeId });
      
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${BASE_URL}/api/payment/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionTypeId }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Payment response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái thanh toán
  static async checkPaymentStatus(orderCode, type = 'candidate') {
    try {
      let code = orderCode;
      let endpoint = '';

      if (type === 'company') {
        // For company, strip COMPSUB- prefix if present
        if (code && code.startsWith('COMPSUB-')) {
          code = code.replace('COMPSUB-', '');
        }
        endpoint = `/companysubscription/payment-status/${code}`;
      } else {
        // For candidate, strip SUB- prefix if present
        if (code && code.startsWith('SUB-')) {
          code = code.replace('SUB-', '');
        }
        endpoint = `/payment/payment-status/${code}`;
      }

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  // Quản lý quota download CV (AsyncStorage)
  static async getDownloadQuota(userId) {
    const keyMax = `cv_download_max_${userId}`;
    const keyCount = `cv_download_count_${userId}`;
    
    const maxDownloadsStr = await AsyncStorage.getItem(keyMax);
    const downloadCountStr = await AsyncStorage.getItem(keyCount);
    
    const maxDownloads = maxDownloadsStr === 'Infinity' 
      ? Infinity 
      : parseInt(maxDownloadsStr || '0', 10);
    const downloadCount = parseInt(downloadCountStr || '0', 10);
    const downloadRemaining = maxDownloads === Infinity 
      ? 'Unlimited' 
      : Math.max(0, maxDownloads - downloadCount);

    return {
      maxDownloads,
      downloadCount,
      downloadRemaining,
      keyMax,
      keyCount
    };
  }

  // Cập nhật quota khi mua gói mới
  static async updateDownloadQuota(userId, packageName) {
    const { keyMax, keyCount } = await this.getDownloadQuota(userId);
    
    function getQuotaByPackage(packageName) {
      if (!packageName) return 0;
      if (packageName.toLowerCase() === 'free') return 1;
      if (packageName.toLowerCase() === 'basic') return 3;
      if (packageName.toLowerCase() === 'premium') return Infinity;
      return 0;
    }

    const add = getQuotaByPackage(packageName);
    const currentMaxStr = await AsyncStorage.getItem(keyMax);
    const currentMax = parseInt(currentMaxStr || '0', 10);
    await AsyncStorage.setItem(keyMax, (currentMax + add).toString());
    await AsyncStorage.setItem('cv_last_package_' + userId, packageName);
  }

  // Sử dụng 1 lượt download CV
  static async useDownloadQuota(userId) {
    const { keyCount, downloadRemaining } = await this.getDownloadQuota(userId);
    
    if (downloadRemaining === 'Unlimited' || downloadRemaining > 0) {
      const currentCountStr = await AsyncStorage.getItem(keyCount);
      const currentCount = parseInt(currentCountStr || '0', 10);
      await AsyncStorage.setItem(keyCount, (currentCount + 1).toString());
      return true;
    }
    
    return false;
  }

  // Reset quota về mặc định
  static async resetDownloadQuota(userId) {
    const keyMax = `cv_download_max_${userId}`;
    const keyCount = `cv_download_count_${userId}`;
    
    await AsyncStorage.setItem(keyMax, '1');
    await AsyncStorage.setItem(keyCount, '0');
    await AsyncStorage.setItem('cv_last_package_' + userId, 'Free');
  }
}

export default PackageService; 