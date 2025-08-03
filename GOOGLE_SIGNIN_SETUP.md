# Google Sign-In Setup Guide

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google Sign-In API

## Bước 2: Tạo OAuth 2.0 Client ID

### Cho Android:
1. Vào "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
2. Chọn "Android" làm Application type
3. Nhập package name của app (ví dụ: `com.jobfinderapp`)
4. Tạo SHA-1 fingerprint:
   ```bash
   # Cho debug
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Cho release
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```

### Cho iOS:
1. Chọn "iOS" làm Application type
2. Nhập Bundle ID của app

### Cho Web (cần thiết cho React Native):
1. Chọn "Web application" làm Application type
2. Thêm authorized origins:
   - `http://localhost:3000`
   - `https://your-domain.com`
3. Thêm authorized redirect URIs:
   - `http://localhost:3000`
   - `https://your-domain.com`

## Bước 3: Cập nhật cấu hình trong app

### Cập nhật `src/constants/googleConfig.js`:
```javascript
export const GOOGLE_CONFIG = {
  WEB_CLIENT_ID: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Thay bằng Web Client ID thực tế
  OFFLINE_ACCESS: true,
  FORCE_CODE_FOR_REFRESH_TOKEN: true,
};
```

### Cấu hình Android (android/app/build.gradle):
```gradle
android {
    defaultConfig {
        // ...
        manifestPlaceholders = [
            'appAuthRedirectScheme': 'com.jobfinderapp'
        ]
    }
}
```

### Cấu hình iOS (ios/JobFinderApp/Info.plist):
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.jobfinderapp</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.jobfinderapp</string>
        </array>
    </dict>
</array>
```

## Bước 4: Cài đặt dependencies

```bash
yarn add @react-native-google-signin/google-signin
```

## Bước 5: Link native modules

### Android:
```bash
npx react-native run-android
```

### iOS:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## Bước 6: Test

1. Chạy app trên thiết bị thật hoặc simulator
2. Nhấn "Log In via Gmail" button
3. Chọn tài khoản Google
4. Kiểm tra xem đăng nhập có thành công không

## Troubleshooting

### Lỗi "PLAY_SERVICES_NOT_AVAILABLE":
- Đảm bảo thiết bị có Google Play Services
- Cập nhật Google Play Services

### Lỗi "SIGN_IN_CANCELLED":
- User đã hủy quá trình đăng nhập
- Kiểm tra lại cấu hình OAuth

### Lỗi "DEVELOPER_ERROR":
- Kiểm tra SHA-1 fingerprint
- Đảm bảo package name đúng
- Kiểm tra Web Client ID

### Lỗi "NETWORK_ERROR":
- Kiểm tra kết nối internet
- Đảm bảo server API hoạt động

## Lưu ý quan trọng

1. **Web Client ID**: Phải sử dụng Web Client ID, không phải Android/iOS Client ID
2. **SHA-1 Fingerprint**: Phải chính xác cho cả debug và release
3. **Package Name**: Phải khớp với cấu hình trong Google Cloud Console
4. **Testing**: Nên test trên thiết bị thật thay vì simulator 