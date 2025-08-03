# 🔧 Khắc phục lỗi Google Sign-In DEVELOPER_ERROR

## 📋 Thông tin cần thiết

### SHA-1 Fingerprint (Debug)
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### Package Name
```
com.jobfinderapp
```

### Web Client ID
```
731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com
```

## 🚀 Các bước khắc phục

### 1. Cập nhật Google Cloud Console

1. **Truy cập Google Cloud Console**
   - Link: https://console.cloud.google.com/
   - Chọn project của bạn

2. **Vào Credentials**
   - Menu: APIs & Services > Credentials
   - Tìm OAuth 2.0 Client ID cho Android

3. **Cập nhật SHA-1 Fingerprint**
   - Click vào Android OAuth 2.0 Client ID
   - Thêm SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Package name: `com.jobfinderapp`
   - Save changes

4. **Kiểm tra Web Client ID**
   - Đảm bảo Web Client ID đúng: `731625050594-bvpbp4hjumhotnk1qft6d18qtdleql7l.apps.googleusercontent.com`
   - Authorized origins: `https://job-finder-kjt2.onrender.com`

### 2. Kiểm tra Backend API

1. **Test API endpoint**
   ```bash
   curl -X POST https://job-finder-kjt2.onrender.com/api/auth/login-google \
     -H "Content-Type: application/json" \
     -d '{"googleToken":"test"}'
   ```

2. **Đảm bảo server hoạt động**
   - Kiểm tra server status
   - Kiểm tra CORS configuration

### 3. Clean và Rebuild

```bash
# Clean project
cd android && ./gradlew clean && cd ..
npx react-native clean

# Rebuild
npx react-native run-android
```

### 4. Test trên thiết bị thật

- **Không test trên emulator** cho Google Sign-In
- **Sử dụng thiết bị thật** có Google Play Services
- **Đảm bảo có internet connection**

## 🔍 Debug Steps

### 1. Kiểm tra logs
```javascript
// Trong googleAuthService.js đã có console.log chi tiết
console.log('Google Sign-In Config:', config);
console.log('Starting Google Sign-In...');
console.log('Google Play Services available');
```

### 2. Kiểm tra cấu hình
```javascript
// Kiểm tra config được load đúng không
import { GOOGLE_CONFIG } from '../constants/googleConfig';
console.log('Google Config:', GOOGLE_CONFIG);
```

### 3. Test từng bước
```javascript
// Test Google Play Services
await GoogleSignin.hasPlayServices();

// Test sign in
const userInfo = await GoogleSignin.signIn();
console.log('User Info:', userInfo);
```

## ⚠️ Lưu ý quan trọng

1. **Thời gian chờ**: Sau khi cập nhật Google Cloud Console, có thể mất 5-10 phút để thay đổi có hiệu lực

2. **SHA-1 Fingerprint**: Phải chính xác từng ký tự

3. **Package Name**: Phải khớp với `applicationId` trong `build.gradle`

4. **Web Client ID**: Phải đúng và có quyền truy cập

5. **Google Play Services**: Thiết bị phải có Google Play Services

## 🆘 Nếu vẫn lỗi

1. **Kiểm tra lại tất cả thông tin trên**
2. **Restart app hoàn toàn**
3. **Clear app data**
4. **Test trên thiết bị khác**
5. **Kiểm tra Google Cloud Console logs**

## 📞 Support

Nếu vẫn gặp vấn đề, hãy cung cấp:
- Logs chi tiết từ console
- Screenshot lỗi
- Thông tin thiết bị
- Google Cloud Console configuration 