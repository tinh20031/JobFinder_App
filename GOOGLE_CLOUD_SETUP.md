# 🔧 Cấu hình Google Cloud Console cho Google Sign-In

## 📋 Thông tin cần thiết

### SHA-1 Fingerprint
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### Package Name
```
com.jobfinderapp
```

### Web Client ID
```
731625050594-b2rbilibdjn4hbjd05kt5pujgb57jqee.apps.googleusercontent.com
```

## 🚀 Các bước cấu hình

### 1. Enable Google Sign-In API

1. **Truy cập**: https://console.cloud.google.com/
2. **Chọn project** của bạn
3. **Vào APIs & Services > Library**
4. **Tìm "Google Sign-In API"**
5. **Click "Enable"**

### 2. Cấu hình OAuth Consent Screen

1. **Vào APIs & Services > OAuth consent screen**
2. **Chọn User Type**: External
3. **Điền thông tin**:
   - App name: JobFinder
   - User support email: [your-email]
   - Developer contact information: [your-email]
4. **Click "Save and Continue"**
5. **Scopes**: Chọn email, profile
6. **Test users**: Thêm email test của bạn
7. **Click "Save and Continue"**

### 3. Tạo OAuth 2.0 Client IDs

#### A. Android Client ID
1. **Vào APIs & Services > Credentials**
2. **Click "CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"**
3. **Application type**: Android
4. **Package name**: `com.jobfinderapp`
5. **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
6. **Click "CREATE"**

#### B. Web Client ID
1. **Click "CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"**
2. **Application type**: Web application
3. **Name**: JobFinder Web Client
4. **Authorized JavaScript origins**:
   - `https://job-finder-kjt2.onrender.com`
   - `http://localhost:3000`
5. **Authorized redirect URIs**:
   - `https://job-finder-kjt2.onrender.com`
   - `http://localhost:3000`
6. **Click "CREATE"**

### 4. Kiểm tra cấu hình

#### A. Kiểm tra Android Client ID
- Package name: `com.jobfinderapp`
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

#### B. Kiểm tra Web Client ID
- Client ID: `731625050594-b2rbilibdjn4hbjd05kt5pujgb57jqee.apps.googleusercontent.com`
- Authorized origins: `https://job-finder-kjt2.onrender.com`

## ⚠️ Lưu ý quan trọng

1. **Thời gian chờ**: 5-10 phút sau khi cấu hình
2. **Test users**: Thêm email của bạn vào test users
3. **Publishing status**: Có thể để ở "Testing"
4. **Scopes**: Đảm bảo có email và profile

## 🔍 Debug steps

### 1. Kiểm tra logs
```
🔧 Google Sign-In Config: {...}
🚀 Starting Google Sign-In...
✅ Google Play Services available
✅ Google Sign-In successful: {...}
❌ No ID token received from Google
```

### 2. Kiểm tra userInfo object
Thêm log để xem userInfo:
```javascript
console.log('UserInfo object:', userInfo);
console.log('UserInfo keys:', Object.keys(userInfo));
```

### 3. Test trên thiết bị thật
- Không test trên emulator
- Đảm bảo có Google Play Services
- Đảm bảo có internet connection

## 🆘 Nếu vẫn lỗi

1. **Kiểm tra OAuth consent screen** đã publish chưa
2. **Thêm email vào test users**
3. **Kiểm tra scopes** có email và profile
4. **Đợi thêm 10-15 phút** để thay đổi có hiệu lực
5. **Clear app data** và test lại 