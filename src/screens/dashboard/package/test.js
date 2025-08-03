// Test file cho Package System
import PackageService from './PackageService';

// Test function để kiểm tra các chức năng
export const testPackageSystem = async () => {
  console.log('=== Testing Package System ===');
  
  try {
    // Test 1: Lấy danh sách packages
    console.log('1. Testing getSubscriptionPackages...');
    const packages = await PackageService.getSubscriptionPackages();
    console.log('Packages:', packages);
    
    // Test 2: Lấy thông tin subscription hiện tại
    console.log('2. Testing getMySubscription...');
    const subscription = await PackageService.getMySubscription();
    console.log('Subscription:', subscription);
    
    // Test 3: Test quota management
    console.log('3. Testing quota management...');
    const userId = 'test_user_123';
    
    // Reset quota
    await PackageService.resetDownloadQuota(userId);
    console.log('Reset quota completed');
    
    // Get quota
    const quota = await PackageService.getDownloadQuota(userId);
    console.log('Initial quota:', quota);
    
    // Update quota
    await PackageService.updateDownloadQuota(userId, 'Basic');
    const updatedQuota = await PackageService.getDownloadQuota(userId);
    console.log('Updated quota:', updatedQuota);
    
    // Use quota
    const canDownload = await PackageService.useDownloadQuota(userId);
    console.log('Can download:', canDownload);
    
    const finalQuota = await PackageService.getDownloadQuota(userId);
    console.log('Final quota:', finalQuota);
    
    console.log('=== Package System Test Completed ===');
    
  } catch (error) {
    console.error('Package System Test Error:', error);
  }
};

export default testPackageSystem; 