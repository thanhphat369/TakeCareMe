import React, { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Divider, Steps } from 'antd';
import { DatabaseOutlined, CheckCircleOutlined, CloseCircleOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface DebugConnectionProps {
  onBack: () => void;
}

const DebugConnection: React.FC<DebugConnectionProps> = ({ onBack }) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const runDebugTests = async () => {
    setLoading(true);
    setTestResults([]);
    setCurrentStep(0);

    const results: any[] = [];

    try {
      // Test 1: Kiểm tra kết nối Backend
      setCurrentStep(1);
      console.log('🔍 Test 1: Kiểm tra kết nối Backend...');
      
      const backendUrl = 'http://localhost:3000';
      const backendResponse = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      results.push({
        step: 1,
        test: 'Backend Connection',
        status: backendResponse.ok ? 'success' : 'error',
        message: backendResponse.ok ? 'Backend đang chạy' : `Backend không phản hồi (${backendResponse.status})`,
        details: `URL: ${backendUrl}, Status: ${backendResponse.status}`,
        timestamp: new Date().toLocaleTimeString()
      });

      // Test 2: Kiểm tra API register endpoint
      setCurrentStep(2);
      console.log('🔍 Test 2: Kiểm tra API register endpoint...');
      
      const registerUrl = 'http://localhost:3000/api/auth/register';
      const testUser = {
        fullName: 'Debug Test User',
        email: `debug${Date.now()}@test.com`,
        phone: '0123456789',
        password: '123456',
        role: 'Family',
      };

      const registerResponse = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      });

      const registerData = await registerResponse.json();
      
      results.push({
        step: 2,
        test: 'API Register Endpoint',
        status: registerResponse.ok ? 'success' : 'error',
        message: registerResponse.ok ? 'API register hoạt động bình thường' : registerData.message || 'API register không hoạt động',
        details: registerResponse.ok ? `User ID: ${registerData.userId}` : `Error: ${registerData.message}`,
        timestamp: new Date().toLocaleTimeString()
      });

      // Test 3: Kiểm tra database connection
      setCurrentStep(3);
      console.log('🔍 Test 3: Kiểm tra database connection...');
      
      if (registerResponse.ok) {
        // Test đăng nhập để kiểm tra database
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
          step: 3,
          test: 'Database Connection',
          status: loginResponse.ok ? 'success' : 'error',
          message: loginResponse.ok ? 'Database kết nối thành công' : 'Database không kết nối được',
          details: loginResponse.ok ? `Token: ${loginData.accessToken?.substring(0, 20)}...` : `Error: ${loginData.message}`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        results.push({
          step: 3,
          test: 'Database Connection',
          status: 'error',
          message: 'Không thể test database vì API register thất bại',
          details: 'Cần sửa lỗi API register trước',
          timestamp: new Date().toLocaleTimeString()
        });
      }

    } catch (error: any) {
      results.push({
        step: currentStep,
        test: 'Network Error',
        status: 'error',
        message: 'Lỗi kết nối mạng',
        details: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setTestResults(results);
    setLoading(false);
    setCurrentStep(0);
  };

  const getStepStatus = (step: number) => {
    if (currentStep > step) return 'finish';
    if (currentStep === step) return 'process';
    return 'wait';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <div className="text-center mb-6">
          <BugOutlined className="text-4xl text-red-600 mb-2" />
          <Title level={2}>Debug Kết Nối API</Title>
          <Text type="secondary">Kiểm tra và khắc phục lỗi đăng ký tài khoản</Text>
        </div>

        <Alert
          message="Debug Mode"
          description="Chế độ debug để tìm và khắc phục lỗi đăng ký tài khoản"
          type="warning"
          showIcon
          className="mb-6"
        />

        <Steps current={currentStep} className="mb-6">
          <Step title="Backend Connection" status={getStepStatus(1)} />
          <Step title="API Register" status={getStepStatus(2)} />
          <Step title="Database" status={getStepStatus(3)} />
        </Steps>

        <div className="text-center mb-6">
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={runDebugTests}
            icon={<BugOutlined />}
            className="mr-4"
          >
            {loading ? 'Đang debug...' : 'Bắt đầu Debug'}
          </Button>
          
          <Button onClick={onBack} size="large">
            Quay lại
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <Divider>Kết quả Debug</Divider>
            
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
                    <Text type="secondary">({result.timestamp})</Text>
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

            {testResults.some(r => r.status === 'error') && (
              <Alert
                message="Khuyến nghị khắc phục"
                description={
                  <div>
                    <Paragraph>
                      <strong>Nếu Backend không chạy:</strong>
                    </Paragraph>
                    <ul>
                      <li>Kiểm tra: <code>cd backend && npm run start:dev</code></li>
                      <li>Kiểm tra port 3000 có bị chiếm không</li>
                      <li>Kiểm tra log Backend có lỗi gì</li>
                    </ul>
                    
                    <Paragraph>
                      <strong>Nếu API register lỗi:</strong>
                    </Paragraph>
                    <ul>
                      <li>Kiểm tra database connection trong Backend</li>
                      <li>Kiểm tra file .env có đúng không</li>
                      <li>Kiểm tra SQL Server có chạy không</li>
                    </ul>
                    
                    <Paragraph>
                      <strong>Nếu Database lỗi:</strong>
                    </Paragraph>
                    <ul>
                      <li>Kiểm tra SQL Server service</li>
                      <li>Kiểm tra connection string</li>
                      <li>Kiểm tra database có tồn tại không</li>
                    </ul>
                  </div>
                }
                type="warning"
                showIcon
              />
            )}
          </div>
        )}

        <Divider />

        <div className="text-center text-xs text-gray-500">
          <p>Backend API: <code>http://localhost:3000</code></p>
          <p>Register Endpoint: <code>http://localhost:3000/api/auth/register</code></p>
          <p>Database: <code>SQL Server - TakeCareMeDB</code></p>
        </div>
      </Card>
    </div>
  );
};

export default DebugConnection;


