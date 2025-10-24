// Test script để kiểm tra kết nối với backend
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');

  try {
    // 1. Test health check
    console.log('1. Testing health check...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('⚠️ Health endpoint not available, trying other endpoints...');
    }

    // 2. Test authentication endpoint
    console.log('\n2. Testing authentication endpoint...');
    try {
      const authResponse = await axios.get(`${API_BASE}/api/auth/profile`);
      console.log('❌ Auth endpoint accessible without token (should be protected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('⚠️ Auth endpoint error:', error.response?.status);
      }
    }

    // 3. Test elders endpoint
    console.log('\n3. Testing elders endpoint...');
    try {
      const eldersResponse = await axios.get(`${API_BASE}/api/elders`);
      console.log('❌ Elders endpoint accessible without token (should be protected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Elders endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('⚠️ Elders endpoint error:', error.response?.status);
      }
    }

    // 4. Test medications endpoint
    console.log('\n4. Testing medications endpoint...');
    try {
      const medsResponse = await axios.get(`${API_BASE}/api/medications`);
      console.log('❌ Medications endpoint accessible without token (should be protected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Medications endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('⚠️ Medications endpoint error:', error.response?.status);
      }
    }

    // 5. Test prescriptions endpoint
    console.log('\n5. Testing prescriptions endpoint...');
    try {
      const prescResponse = await axios.get(`${API_BASE}/api/prescriptions`);
      console.log('❌ Prescriptions endpoint accessible without token (should be protected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Prescriptions endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('⚠️ Prescriptions endpoint error:', error.response?.status);
      }
    }

    console.log('\n🎉 Backend connection test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the frontend: cd Frontend && npm start');
    console.log('2. Login with valid credentials');
    console.log('3. Test the prescription management feature');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd Backend && npm run start:dev');
    console.log('2. Check if port 3000 is available');
    console.log('3. Check backend logs for errors');
  }
}

// Chạy test
testBackendConnection();

