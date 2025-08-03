const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Getting SHA-1 fingerprints for Google Sign-In...\n');

try {
  // Debug keystore path
  const debugKeystorePath = path.join(__dirname, 'android/app/debug.keystore');
  
  if (!fs.existsSync(debugKeystorePath)) {
    console.error('❌ Debug keystore not found at:', debugKeystorePath);
    console.log('Please run: cd android && ./gradlew signingReport');
    process.exit(1);
  }

  // Get SHA-1 for debug keystore
  console.log('📱 Debug SHA-1:');
  const debugSha1 = execSync(
    `keytool -list -v -keystore "${debugKeystorePath}" -alias androiddebugkey -storepass android -keypass android`,
    { encoding: 'utf8' }
  );
  
  const debugSha1Match = debugSha1.match(/SHA1: ([A-F0-9:]+)/i);
  if (debugSha1Match) {
    console.log('✅ Debug SHA-1:', debugSha1Match[1]);
  } else {
    console.log('❌ Could not extract SHA-1 from debug keystore');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Navigate to APIs & Services > Credentials');
  console.log('3. Edit your Android OAuth 2.0 Client ID');
  console.log('4. Add the SHA-1 fingerprint above');
  console.log('5. Save the changes');
  console.log('\n⚠️  Note: You may need to wait a few minutes for changes to take effect');

} catch (error) {
  console.error('❌ Error getting SHA-1:', error.message);
  console.log('\n🔧 Alternative method:');
  console.log('Run this command manually:');
  console.log('keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android');
} 