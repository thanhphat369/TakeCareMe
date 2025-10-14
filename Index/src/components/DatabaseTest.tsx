import React, { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Divider } from 'antd';
import { DatabaseOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DatabaseTestProps {
  onBack: () => void;
}

const DatabaseTest: React.FC<DatabaseTestProps> = ({ onBack }) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    const results: any[] = [];

    try {

 
      // Test 2: Test đăng ký user mới
      console.log('🔍 Test 2: Test đăng ký user mới...');
      const testUser = {
        fullName: 'Test User ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        phone: '0123456789',
        password: '123456',
        role: 'Family',
      };

      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      });

      const registerData = await registerResponse.json();
      
      results.push({
        test: 'User Registration',
        status: registerResponse.ok ? 'success' : 'error',
        message: registerResponse.ok ? 'Đăng ký thành công - Dữ liệu đã lưu vào SQL Server' : registerData.message || 'Đăng ký thất bại',
        details: registerResponse.ok ? `User ID: ${registerData.userId}` : `Error: ${registerData.message}`
      });

      // Test 3: Test đăng nhập
      if (registerResponse.ok) {
        console.log('🔍 Test 3: Test đăng nhập...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        });

        const loginData = await loginResponse.json();
        
        results.push({
          test: 'User Login',
          status: loginResponse.ok ? 'success' : 'error',
          message: loginResponse.ok ? 'Đăng nhập thành công - JWT token được tạo' : 'Đăng nhập thất bại',
          details: loginResponse.ok ? `Token: ${loginData.accessToken?.substring(0, 20)}...` : `Error: ${loginData.message}`
        });
      }

    } catch (error: any) {
      results.push({
        test: 'Database Connection',
        status: 'error',
        message: 'Không thể kết nối đến database',
        details: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="text-center mb-6">
          <DatabaseOutlined className="text-4xl text-blue-600 mb-2" />
          <Title level={2}>Test Kết Nối Database</Title>
          <Text type="secondary">Kiểm tra tích hợp giữa Frontend, Backend và SQL Server</Text>
        </div>

        <Alert
          message="Kiểm tra tích hợp hệ thống"
          description="Test này sẽ kiểm tra kết nối giữa Frontend, Backend API và SQL Server database"
          type="info"
          showIcon
          className="mb-6"
        />

        <div className="text-center mb-6">
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={testDatabaseConnection}
            icon={<DatabaseOutlined />}
            className="mr-4"
          >
            {loading ? 'Đang test...' : 'Bắt đầu Test Database'}
          </Button>
          
          <Button onClick={onBack} size="large">
            Quay lại
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <Divider>Kết quả Test</Divider>
            
            {testResults.map((result, index) => (
              <Alert
                key={index}
                message={
                  <Space>
                    {result.status === 'success' ? (
                      <CheckCircleOutlined className="text-green-600" />
                    ) : (
                      <CloseCircleOutlined className="text-red-600" />
                    )}
                    <span className="font-semibold">{result.test}</span>
                  </Space>
                }
                description={
                  <div>
                    <div className="mb-2">{result.message}</div>
                    <div className="text-sm text-gray-600">
                      <strong>Chi tiết:</strong> {result.details}
                    </div>
                  </div>
                }
                type={result.status === 'success' ? 'success' : 'error'}
                showIcon={false}
              />
            ))}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <Title level={4}>Thông tin hệ thống:</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Frontend:</strong> React + TypeScript
                </div>
                <div>
                  <strong>Backend:</strong> NestJS + TypeORM
                </div>
                <div>
                  <strong>Database:</strong> SQL Server
                </div>
                <div>
                  <strong>API Endpoint:</strong> http://localhost:3000/api/auth/register
                </div>
              </div>
            </div>
          </div>
        )}

        <Divider />

        <div className="text-center text-xs text-gray-500">
          <p>Backend API: <code>http://localhost:3000</code></p>
          <p>Database: <code>SQL Server - TakeCareMeDB</code></p>
          <p>Table: <code>Users</code></p>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseTest;


