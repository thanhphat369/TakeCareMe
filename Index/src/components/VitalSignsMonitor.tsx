import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Alert, 
  Button, 
  Badge,
  Space,
  Tag,
  Timeline,
  Avatar
} from 'antd';
import {
  HeartOutlined,
  FireOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';

interface VitalSign {
  id: string;
  elderlyId: string;
  elderlyName: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  recordedBy: string;
}

const VitalSignsMonitor: React.FC = () => {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([
    {
      id: '1',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      bloodPressure: { systolic: 140, diastolic: 90 },
      heartRate: 85,
      temperature: 36.8,
      oxygenSaturation: 98,
      timestamp: new Date().toISOString(),
      status: 'warning',
      recordedBy: 'Điều dưỡng Trần Thị Y tá'
    },
    {
      id: '2',
      elderlyId: '2',
      elderlyName: 'Cụ Trần Thị B',
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 72,
      temperature: 36.5,
      oxygenSaturation: 99,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'normal',
      recordedBy: 'Điều dưỡng Phạm Văn Hỗ trợ'
    },
    {
      id: '3',
      elderlyId: '3',
      elderlyName: 'Cụ Lê Văn C',
      bloodPressure: { systolic: 180, diastolic: 110 },
      heartRate: 95,
      temperature: 37.2,
      oxygenSaturation: 95,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'critical',
      recordedBy: 'Điều dưỡng Nguyễn Văn D'
    }
  ]);

  const [isRealTime, setIsRealTime] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setVitalSigns(prev => prev.map(vital => ({
        ...vital,
        heartRate: vital.heartRate + Math.floor(Math.random() * 6) - 3,
        temperature: vital.temperature + (Math.random() * 0.4 - 0.2),
        timestamp: new Date().toISOString()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { status: 'normal', color: 'green', text: 'Bình thường' };
    if (systolic < 130 && diastolic < 80) return { status: 'elevated', color: 'orange', text: 'Cao nhẹ' };
    if (systolic < 140 && diastolic < 90) return { status: 'stage1', color: 'orange', text: 'Tăng huyết áp giai đoạn 1' };
    if (systolic < 180 && diastolic < 120) return { status: 'stage2', color: 'red', text: 'Tăng huyết áp giai đoạn 2' };
    return { status: 'crisis', color: 'red', text: 'Khủng hoảng tăng huyết áp' };
  };

  const getHeartRateStatus = (heartRate: number) => {
    if (heartRate < 60) return { status: 'low', color: 'blue', text: 'Chậm' };
    if (heartRate > 100) return { status: 'high', color: 'red', text: 'Nhanh' };
    return { status: 'normal', color: 'green', text: 'Bình thường' };
  };

  const getTemperatureStatus = (temperature: number) => {
    if (temperature < 36.0) return { status: 'low', color: 'blue', text: 'Thấp' };
    if (temperature > 37.5) return { status: 'high', color: 'red', text: 'Sốt' };
    return { status: 'normal', color: 'green', text: 'Bình thường' };
  };

  const getOxygenStatus = (oxygen: number) => {
    if (oxygen < 95) return { status: 'low', color: 'red', text: 'Thiếu oxy' };
    if (oxygen < 97) return { status: 'warning', color: 'orange', text: 'Cảnh báo' };
    return { status: 'normal', color: 'green', text: 'Bình thường' };
  };

  const getOverallStatus = (vital: VitalSign) => {
    const bpStatus = getBloodPressureStatus(vital.bloodPressure.systolic, vital.bloodPressure.diastolic);
    const hrStatus = getHeartRateStatus(vital.heartRate);
    const tempStatus = getTemperatureStatus(vital.temperature);
    const oxyStatus = getOxygenStatus(vital.oxygenSaturation);

    if (bpStatus.status === 'crisis' || tempStatus.status === 'high' || oxyStatus.status === 'low') {
      return { status: 'critical', color: 'red', text: 'Khẩn cấp' };
    }
    if (bpStatus.status === 'stage2' || hrStatus.status === 'high' || oxyStatus.status === 'warning') {
      return { status: 'warning', color: 'orange', text: 'Cảnh báo' };
    }
    return { status: 'normal', color: 'green', text: 'Bình thường' };
  };

  const criticalVitals = vitalSigns.filter(v => getOverallStatus(v).status === 'critical');
  const warningVitals = vitalSigns.filter(v => getOverallStatus(v).status === 'warning');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Theo dõi sinh hiệu</h1>
          <p className="text-gray-600">Giám sát sinh hiệu real-time của người cao tuổi</p>
        </div>
        <Space>
          <Button 
            type={isRealTime ? 'primary' : 'default'}
            onClick={() => setIsRealTime(!isRealTime)}
          >
            {isRealTime ? 'Tắt' : 'Bật'} Real-time
          </Button>
        </Space>
      </div>

      {/* Critical Alerts */}
      {criticalVitals.length > 0 && (
        <Alert
          message="Cảnh báo khẩn cấp"
          description={`Có ${criticalVitals.length} người cao tuổi có sinh hiệu bất thường cần can thiệp ngay!`}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          action={
            <Button size="small" danger>
              Xem chi tiết
            </Button>
          }
        />
      )}

      {warningVitals.length > 0 && (
        <Alert
          message="Cảnh báo"
          description={`Có ${warningVitals.length} người cao tuổi có sinh hiệu cần theo dõi`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      {/* Vital Signs Grid */}
      <Row gutter={[16, 16]}>
        {vitalSigns.map(vital => {
          const overallStatus = getOverallStatus(vital);
          const bpStatus = getBloodPressureStatus(vital.bloodPressure.systolic, vital.bloodPressure.diastolic);
          const hrStatus = getHeartRateStatus(vital.heartRate);
          const tempStatus = getTemperatureStatus(vital.temperature);
          const oxyStatus = getOxygenStatus(vital.oxygenSaturation);

          return (
            <Col xs={24} sm={12} lg={8} key={vital.id}>
              <Card 
                className={`border-2 ${
                  overallStatus.status === 'critical' ? 'border-red-500' : 
                  overallStatus.status === 'warning' ? 'border-orange-500' : 
                  'border-green-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{vital.elderlyName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(vital.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <Badge 
                    status={overallStatus.status === 'critical' ? 'error' : 
                           overallStatus.status === 'warning' ? 'warning' : 'success'}
                    text={overallStatus.text}
                  />
                </div>

                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-center mb-1">
                        <HeartOutlined className="text-red-500 mr-1" />
                        <span className="text-xs text-gray-600">Huyết áp</span>
                      </div>
                      <div className="font-bold text-lg">
                        {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                      </div>
                      <div className="text-xs text-gray-500">mmHg</div>
                      <Tag color={bpStatus.color} className="text-xs mt-1">
                        {bpStatus.text}
                      </Tag>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-center mb-1">
                        <HeartOutlined className="text-red-500 mr-1" />
                        <span className="text-xs text-gray-600">Nhịp tim</span>
                      </div>
                      <div className="font-bold text-lg">{vital.heartRate}</div>
                      <div className="text-xs text-gray-500">bpm</div>
                      <Tag color={hrStatus.color} className="text-xs mt-1">
                        {hrStatus.text}
                      </Tag>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-center mb-1">
                        <FireOutlined className="text-orange-500 mr-1" />
                        <span className="text-xs text-gray-600">Nhiệt độ</span>
                      </div>
                      <div className="font-bold text-lg">{vital.temperature.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">°C</div>
                      <Tag color={tempStatus.color} className="text-xs mt-1">
                        {tempStatus.text}
                      </Tag>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-center mb-1">
                        <DashboardOutlined className="text-blue-500 mr-1" />
                        <span className="text-xs text-gray-600">SpO2</span>
                      </div>
                      <div className="font-bold text-lg">{vital.oxygenSaturation}</div>
                      <div className="text-xs text-gray-500">%</div>
                      <Tag color={oxyStatus.color} className="text-xs mt-1">
                        {oxyStatus.text}
                      </Tag>
                    </div>
                  </Col>
                </Row>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <UserOutlined className="mr-1" />
                      {vital.recordedBy}
                    </div>
                    <div className="flex items-center">
                      <ClockCircleOutlined className="mr-1" />
                      {new Date(vital.timestamp).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng số người"
              value={vitalSigns.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Bình thường"
              value={vitalSigns.filter(v => getOverallStatus(v).status === 'normal').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Cảnh báo"
              value={warningVitals.length}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={criticalVitals.length}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Timeline */}
      <Card title="Hoạt động gần đây">
        <Timeline>
          {vitalSigns
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map(vital => {
              const overallStatus = getOverallStatus(vital);
              return (
                <Timeline.Item
                  key={vital.id}
                  dot={
                    <Avatar 
                      size="small" 
                      style={{ 
                        backgroundColor: overallStatus.color === 'red' ? '#ff4d4f' : 
                                        overallStatus.color === 'orange' ? '#fa8c16' : '#52c41a'
                      }}
                    >
                      {overallStatus.status === 'critical' ? <ExclamationCircleOutlined /> :
                       overallStatus.status === 'warning' ? <ClockCircleOutlined /> :
                       <CheckCircleOutlined />}
                    </Avatar>
                  }
                >
                  <div>
                    <div className="font-medium">
                      {vital.elderlyName} - {overallStatus.text}
                    </div>
                    <div className="text-sm text-gray-500">
                      Huyết áp: {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg • 
                      Nhịp tim: {vital.heartRate} bpm • 
                      Nhiệt độ: {vital.temperature.toFixed(1)}°C • 
                      SpO2: {vital.oxygenSaturation}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(vital.timestamp).toLocaleString('vi-VN')} • {vital.recordedBy}
                    </div>
                  </div>
                </Timeline.Item>
              );
            })}
        </Timeline>
      </Card>
    </div>
  );
};

export default VitalSignsMonitor;
