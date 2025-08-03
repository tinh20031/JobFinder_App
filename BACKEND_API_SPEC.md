# 🔧 Backend API Specification - Google Login

## 📋 API Endpoint

### POST /api/auth/login-google

**URL:** `https://job-finder-kjt2.onrender.com/api/auth/login-google`

**Method:** `POST`

**Content-Type:** `application/json`

## 📤 Request Body

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRkNTMwMTIwNGZjMWQ2YTBkNjhjNzgzYTM1Y2M5YzEwYjI1ZTFmNGEiLCJ0eXAiOiJKV1QifQ..."
}
```

### Parameters:
- `googleToken` (string, required): Google ID token hoặc server auth code

## 📥 Response

### Success Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "candidate",
  "user": {
    "id": "123",
    "email": "dinhdqqe170202@fpt.edu.vn",
    "fullName": "Đặng Quốc Đình (K17 QN)",
    "profileImage": "https://lh3.googleusercontent.com/a/ACg8ocLnoBb1iQK4JMMAGYAy2QeHBFIbLPecZ4jinevbFnA4TrcihmeO=s96-c"
  }
}
```

### Error Response (400/401/500)

```json
{
  "message": "Invalid Google token",
  "error": "Token verification failed"
}
```

## 🔧 Implementation Steps

### 1. Install Google Auth Library

```bash
# Node.js
npm install google-auth-library

# .NET
dotnet add package Google.Apis.Auth
```

### 2. Verify Google Token

#### Node.js Example:
```javascript
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}
```

#### .NET Example:
```csharp
using Google.Apis.Auth.OAuth2;

public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleToken(string token)
{
    try
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { "731625050594-b2rbilibdjn4hbjd05kt5pujgb57jqee.apps.googleusercontent.com" }
        };
        
        var payload = await GoogleJsonWebSignature.ValidateAsync(token, settings);
        return payload;
    }
    catch (Exception ex)
    {
        throw new Exception("Invalid Google token");
    }
}
```

### 3. Create or Update User

```javascript
async function handleGoogleLogin(googleToken) {
  // 1. Verify Google token
  const googleUser = await verifyGoogleToken(googleToken);
  
  // 2. Find or create user
  let user = await User.findOne({ email: googleUser.email });
  
  if (!user) {
    // Create new user
    user = new User({
      email: googleUser.email,
      fullName: googleUser.name,
      profileImage: googleUser.picture,
      googleId: googleUser.userId,
      role: 'candidate'
    });
    await user.save();
  }
  
  // 3. Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // 4. Return response
  return {
    token,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage
    }
  };
}
```

## ⚠️ Important Notes

### 1. Google Client ID
- **Web Client ID:** `731625050594-b2rbilibdjn4hbjd05kt5pujgb57jqee.apps.googleusercontent.com`
- **Server Client ID:** `731625050594-b2rbilibdjn4hbjd05kt5pujgb57jqee.apps.googleusercontent.com`

### 2. Token Types
- **ID Token:** JWT token from Google (preferred)
- **Server Auth Code:** Authorization code (fallback)

### 3. Error Handling
- Handle invalid tokens
- Handle expired tokens
- Handle network errors
- Return appropriate HTTP status codes

### 4. Security
- Always verify Google tokens server-side
- Use HTTPS only
- Validate email domain if needed
- Rate limiting for login attempts

## 🧪 Testing

### Test with curl:
```bash
curl -X POST https://job-finder-kjt2.onrender.com/api/auth/login-google \
  -H "Content-Type: application/json" \
  -d '{"googleToken":"test-token"}'
```

### Expected Response:
- **405 Method Not Allowed** (current - needs implementation)
- **200 OK** (after implementation)

## 📞 Contact

**Frontend Developer:** Ready to test once backend is implemented
**Backend Developer:** Please implement this endpoint and contact frontend developer for testing 