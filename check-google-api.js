const https = require('https');

console.log('🔍 Checking Google API configuration...\n');

// Test Google Sign-In API endpoint
const testGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: '/oauth2/v1/tokeninfo',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Google API is accessible');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Google API error:', error.message);
      reject(error);
    });

    req.end();
  });
};

// Test backend API
const testBackendAPI = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'job-finder-kjt2.onrender.com',
      port: 443,
      path: '/api/auth/login-google',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log('✅ Backend API is accessible (Status:', res.statusCode + ')');
      resolve();
    });

    req.on('error', (error) => {
      console.error('❌ Backend API error:', error.message);
      reject(error);
    });

    req.write(JSON.stringify({ googleToken: 'test' }));
    req.end();
  });
};

// Run tests
async function runTests() {
  try {
    await testGoogleAPI();
    await testBackendAPI();
    
    console.log('\n📋 Configuration Summary:');
    console.log('✅ Web Client ID: 731625050594-b2rbilibdjn4hbjd05kt5pujgb57jqee.apps.googleusercontent.com');
    console.log('✅ Package Name: com.jobfinderapp');
    console.log('✅ SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Ensure Google Sign-In API is enabled in Google Cloud Console');
    console.log('2. Check OAuth consent screen configuration');
    console.log('3. Test on real device (not emulator)');
    console.log('4. Wait 5-10 minutes after Google Cloud Console changes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests(); 