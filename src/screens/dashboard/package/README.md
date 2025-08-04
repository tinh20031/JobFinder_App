# Package System for JobFinder Mobile App

## Tổng quan

Package System là hệ thống quản lý gói dịch vụ cho ứng viên (Candidate) trong ứng dụng JobFinder Mobile. Hệ thống này cho phép người dùng mua và quản lý các gói dịch vụ với các tính năng như Try-Match và CV Download.

## Cấu trúc thư mục

```
src/screens/dashboard/package/
├── PackageService.js          # Service để gọi API package
├── PackageScreen.js           # Màn hình chính hiển thị thông tin package
├── BuyPackageScreen.js        # Màn hình mua package
├── PaymentSuccessScreen.js    # Màn hình thành công thanh toán
├── index.js                   # Export tất cả components
└── README.md                  # Hướng dẫn sử dụng
```

## Các loại gói

### 1. Free Package
- **Try-Matches**: 1 lượt
- **CV Downloads**: 1 lượt
- **Giá**: Miễn phí

### 2. Basic Package
- **Try-Matches**: 3 lượt
- **CV Downloads**: 3 lượt
- **Giá**: Theo cấu hình từ backend

### 3. Premium Package
- **Try-Matches**: Không giới hạn
- **CV Downloads**: Không giới hạn
- **Giá**: Theo cấu hình từ backend

## Các màn hình chính

### 1. PackageScreen
**Chức năng:**
- Hiển thị thông tin gói hiện tại
- Hiển thị số lượt Try-Match còn lại
- Hiển thị số lượt Download CV còn lại
- Nút upgrade/buy package
- Modal xác nhận khi mua gói mới

**Props:**
```javascript
{
  navigation: Navigation object
}
```

### 2. BuyPackageScreen
**Chức năng:**
- Hiển thị danh sách các gói có sẵn
- So sánh tính năng giữa các gói
- Xử lý thanh toán qua API
- Chuyển hướng đến trang thanh toán

**Props:**
```javascript
{
  navigation: Navigation object
}
```

### 3. PaymentSuccessScreen
**Chức năng:**
- Kiểm tra trạng thái thanh toán
- Hiển thị thông tin đơn hàng
- Cập nhật gói cho user
- Chuyển hướng về trang package

**Props:**
```javascript
{
  navigation: Navigation object,
  route: {
    params: {
      orderCode: string,
      type: 'candidate' | 'company'
    }
  }
}
```

## PackageService

### Các phương thức chính:

#### 1. getSubscriptionPackages()
```javascript
// Lấy danh sách các gói có sẵn
const packages = await PackageService.getSubscriptionPackages();
```

#### 2. getMySubscription()
```javascript
// Lấy thông tin gói hiện tại của user
const subscription = await PackageService.getMySubscription();
```

#### 3. createPayment(subscriptionTypeId)
```javascript
// Tạo thanh toán cho gói mới
const payment = await PackageService.createPayment(packageId);
```

#### 4. checkPaymentStatus(orderCode, type)
```javascript
// Kiểm tra trạng thái thanh toán
const status = await PackageService.checkPaymentStatus(orderCode, 'candidate');
```

#### 5. Quản lý Download Quota
```javascript
// Lấy thông tin quota
const quota = PackageService.getDownloadQuota(userId);

// Cập nhật quota khi mua gói mới
PackageService.updateDownloadQuota(userId, packageName);

// Sử dụng 1 lượt download
const canDownload = PackageService.useDownloadQuota(userId);

// Reset quota về mặc định
PackageService.resetDownloadQuota(userId);
```

## Quản lý Quota Download CV

Hệ thống sử dụng AsyncStorage để quản lý quota download CV (đã được cài đặt sẵn trong package.json):

### Cấu trúc lưu trữ:
```javascript
const userId = 'user_id';
const keyMax = `cv_download_max_${userId}`;      // Tổng số lượt download
const keyCount = `cv_download_count_${userId}`;   // Số lượt đã sử dụng

// Sử dụng AsyncStorage thay vì localStorage
await AsyncStorage.setItem(keyMax, '3');
await AsyncStorage.getItem(keyMax);
```

### Logic cộng quota:
```javascript
function getQuotaByPackage(packageName) {
  if (packageName.toLowerCase() === 'free') return 1;
  if (packageName.toLowerCase() === 'basic') return 3;
  if (packageName.toLowerCase() === 'premium') return Infinity;
  return 0;
}
```

## API Endpoints

### 1. Lấy danh sách gói
```
GET /api/payment/packages
```

### 2. Lấy thông tin gói hiện tại
```
GET /api/payment/my-subscription
```

### 3. Tạo thanh toán
```
POST /api/payment/create-payment
Body: { subscriptionTypeId: string }
```

### 4. Kiểm tra trạng thái thanh toán
```
GET /api/payment/payment-status/{orderCode}
```

## Navigation

### Đã tích hợp vào AppNavigator.js:
```javascript
// Import trong AppNavigator.js
import { PackageScreen, BuyPackageScreen, PaymentSuccessScreen } from '../screens/dashboard/package';

// Routes đã được thêm
<Stack.Screen name="Package" component={PackageScreen} options={{ headerShown: false }} />
<Stack.Screen name="BuyPackage" component={BuyPackageScreen} options={{ headerShown: false }} />
<Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
```

### Đã tích hợp vào DashboardScreen.js:
```javascript
// Trong DashboardScreen.js
const handlePackagesPress = () => {
  navigation.navigate('Package');
};
```

### Navigation giữa các màn hình:
```javascript
// Chuyển đến màn hình mua package
navigation.navigate('BuyPackage');

// Chuyển đến màn hình thành công thanh toán
navigation.navigate('PaymentSuccess', {
  orderCode: 'SUB-123456',
  type: 'candidate'
});

// Quay lại màn hình package
navigation.navigate('Package');
```

## Styling

Hệ thống sử dụng file `src/constants/colors.js` để quản lý màu sắc:

```javascript
import { colors } from '../../constants/colors';

// Sử dụng colors
<View style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: colors.textPrimary }}>
    Package Information
  </Text>
</View>
```

## Error Handling

### Xử lý lỗi API:
```javascript
try {
  const packages = await PackageService.getSubscriptionPackages();
} catch (error) {
  console.error('Error fetching packages:', error);
  Alert.alert('Error', 'Failed to load packages. Please try again.');
}
```

### Xử lý lỗi thanh toán:
```javascript
try {
  const payment = await PackageService.createPayment(packageId);
} catch (error) {
  console.error('Error creating payment:', error);
  Alert.alert('Error', 'Failed to create payment. Please try again.');
}
```

## Testing

### Test PackageService:
```javascript
// Test lấy danh sách gói
const packages = await PackageService.getSubscriptionPackages();
console.log('Packages:', packages);

// Test lấy thông tin gói hiện tại
const subscription = await PackageService.getMySubscription();
console.log('Subscription:', subscription);

// Test quản lý quota
const quota = PackageService.getDownloadQuota('user123');
console.log('Quota:', quota);
```

## Best Practices

1. **Error Handling**: Luôn xử lý lỗi khi gọi API
2. **Loading States**: Hiển thị loading khi đang tải dữ liệu
3. **User Feedback**: Thông báo rõ ràng cho user về trạng thái
4. **Data Validation**: Kiểm tra dữ liệu trước khi sử dụng
5. **Memory Management**: Cleanup khi component unmount
6. **Performance**: Sử dụng React.memo cho components lớn
7. **Accessibility**: Thêm accessibility props cho các elements

## Troubleshooting

### Lỗi thường gặp:

1. **API không trả về dữ liệu**
   - Kiểm tra BASE_URL trong constants/api.ts
   - Kiểm tra token authentication
   - Kiểm tra network connection

2. **Quota không cập nhật**
   - Kiểm tra userId có đúng không
   - Kiểm tra localStorage có hoạt động không
   - Kiểm tra logic cập nhật quota

3. **Navigation không hoạt động**
   - Kiểm tra routes đã được đăng ký chưa
   - Kiểm tra navigation object có đúng không
   - Kiểm tra screen names có đúng không

## Future Enhancements

1. **Offline Support**: Cache dữ liệu package để sử dụng offline
2. **Push Notifications**: Thông báo khi gói sắp hết hạn
3. **Usage Analytics**: Theo dõi việc sử dụng các tính năng
4. **Auto-renewal**: Tự động gia hạn gói
5. **Package Comparison**: So sánh chi tiết hơn giữa các gói
6. **Usage History**: Lịch sử sử dụng các tính năng
7. **Custom Packages**: Gói tùy chỉnh theo nhu cầu 