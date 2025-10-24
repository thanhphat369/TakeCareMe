const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testPrescriptionAPI() {
  try {
    console.log('🧪 Testing Prescription API...\n');

    // Test data
    const testPrescription = {
      elderId: 1,
      prescribedBy: 1,
      diagnosis: 'Cảm cúm nhẹ',
      notes: 'Nghỉ ngơi, uống nhiều nước',
      prescriptionDate: '2024-01-15',
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      medications: [
        {
          name: 'Paracetamol',
          dose: '500mg',
          frequency: '3 lần/ngày',
          time: '08:00 - 20:00',
          notes: 'Sau ăn'
        },
        {
          name: 'Vitamin C',
          dose: '1000mg',
          frequency: '1 lần/ngày',
          time: '09:00',
          notes: 'Tăng cường sức đề kháng'
        }
      ]
    };

    // 1. Test tạo đơn thuốc mới
    console.log('1. Creating new prescription...');
    const createResponse = await axios.post(`${API_BASE}/api/prescriptions`, testPrescription);
    console.log('✅ Prescription created:', createResponse.data);
    const prescriptionId = createResponse.data.prescriptionId;

    // 2. Test lấy tất cả đơn thuốc
    console.log('\n2. Fetching all prescriptions...');
    const getAllResponse = await axios.get(`${API_BASE}/api/prescriptions`);
    console.log('✅ All prescriptions:', getAllResponse.data.length, 'items');

    // 3. Test lấy đơn thuốc theo Elder ID
    console.log('\n3. Fetching prescriptions by elder...');
    const getByElderResponse = await axios.get(`${API_BASE}/api/prescriptions/elder/1`);
    console.log('✅ Prescriptions for elder 1:', getByElderResponse.data.length, 'items');

    // 4. Test lấy đơn thuốc theo ID
    console.log('\n4. Fetching prescription by ID...');
    const getByIdResponse = await axios.get(`${API_BASE}/api/prescriptions/${prescriptionId}`);
    console.log('✅ Prescription details:', getByIdResponse.data);

    // 5. Test cập nhật đơn thuốc
    console.log('\n5. Updating prescription...');
    const updateData = {
      diagnosis: 'Cảm cúm nhẹ - đã cải thiện',
      notes: 'Tiếp tục điều trị, theo dõi triệu chứng',
      medications: [
        {
          name: 'Paracetamol',
          dose: '500mg',
          frequency: '2 lần/ngày',
          time: '08:00 - 20:00',
          notes: 'Giảm liều'
        }
      ]
    };
    const updateResponse = await axios.put(`${API_BASE}/api/prescriptions/${prescriptionId}`, updateData);
    console.log('✅ Prescription updated:', updateResponse.data);

    // 6. Test xóa đơn thuốc
    console.log('\n6. Deleting prescription...');
    await axios.delete(`${API_BASE}/api/prescriptions/${prescriptionId}`);
    console.log('✅ Prescription deleted successfully');

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Chạy test
testPrescriptionAPI();

