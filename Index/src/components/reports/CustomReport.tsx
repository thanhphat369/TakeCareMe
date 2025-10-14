import React, { useState } from 'react';
import { Card, Form, Select, DatePicker, Button, Row, Col, Table, Statistic, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { mockElderly, mockCaregivers, mockAppointments, mockHealthRecords } from '../../data/mockData';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CustomReport: React.FC = () => {
  const [form] = Form.useForm();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = (values: any) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const { reportType, dateRange, elderlyId, caregiverId } = values;
      
      let filteredData = {
        elderly: mockElderly,
        caregivers: mockCaregivers,
        appointments: mockAppointments,
        healthRecords: mockHealthRecords,
      };

      // Filter by date range
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].toDate();
        const endDate = dateRange[1].toDate();
        
        filteredData.appointments = mockAppointments.filter(apt => {
          const aptDate = new Date(apt.start);
          return aptDate >= startDate && aptDate <= endDate;
        });
        
        filteredData.healthRecords = mockHealthRecords.filter(hr => {
          const hrDate = new Date(hr.date);
          return hrDate >= startDate && hrDate <= endDate;
        });
      }

      // Filter by elderly
      if (elderlyId && elderlyId !== 'all') {
        filteredData.appointments = filteredData.appointments.filter(apt => apt.elderlyId === elderlyId);
        filteredData.healthRecords = filteredData.healthRecords.filter(hr => hr.elderlyId === elderlyId);
      }

      // Filter by caregiver
      if (caregiverId && caregiverId !== 'all') {
        filteredData.appointments = filteredData.appointments.filter(apt => apt.caregiverId === caregiverId);
      }

      setReportData({
        ...filteredData,
        reportType,
        generatedAt: new Date(),
      });
      
      setLoading(false);
      message.success('Báo cáo đã được tạo thành công');
    }, 1000);
  };

  const handleExport = () => {
    if (reportData) {
      // Simulate export functionality
      message.success('Đang xuất báo cáo...');
    }
  };

  const getReportSummary = () => {
    if (!reportData) return null;

    const { appointments, healthRecords, elderly, caregivers } = reportData;
    
    return {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter((apt: any) => apt.status === 'completed').length,
      totalHealthRecords: healthRecords.length,
      totalElderly: elderly.length,
      totalCaregivers: caregivers.length,
      averageAppointmentsPerDay: appointments.length / 7, // Assuming 7 days
    };
  };

  const getAppointmentColumns = () => [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderlyId',
      key: 'elderlyId',
      render: (elderlyId: string) => {
        const elderly = mockElderly.find(e => e.id === elderlyId);
        return elderly ? elderly.name : 'Không xác định';
      },
    },
    {
      title: 'Người chăm sóc',
      dataIndex: 'caregiverId',
      key: 'caregiverId',
      render: (caregiverId: string) => {
        const caregiver = mockCaregivers.find(c => c.id === caregiverId);
        return caregiver ? caregiver.name : 'Không xác định';
      },
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          checkup: 'Khám sức khỏe',
          medication: 'Uống thuốc',
          exercise: 'Tập thể dục',
          social: 'Hoạt động xã hội',
          emergency: 'Khẩn cấp',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          scheduled: 'Đã lên lịch',
          'in-progress': 'Đang thực hiện',
          completed: 'Hoàn thành',
          cancelled: 'Đã hủy',
        };
        return statusMap[status as keyof typeof statusMap] || status;
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start',
      key: 'start',
      render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  const getHealthRecordColumns = () => [
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderlyId',
      key: 'elderlyId',
      render: (elderlyId: string) => {
        const elderly = mockElderly.find(e => e.id === elderlyId);
        return elderly ? elderly.name : 'Không xác định';
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Huyết áp',
      key: 'bloodPressure',
      render: (_: any, record: any) => 
        `${record.bloodPressure.systolic}/${record.bloodPressure.diastolic} mmHg`,
    },
    {
      title: 'Nhịp tim',
      dataIndex: 'heartRate',
      key: 'heartRate',
      render: (heartRate: number) => `${heartRate} bpm`,
    },
    {
      title: 'Nhiệt độ',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temperature: number) => `${temperature}°C`,
    },
    {
      title: 'Cân nặng',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight} kg`,
    },
  ];

  const summary = getReportSummary();

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card title="Tạo báo cáo tùy chỉnh" size="small">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateReport}
          initialValues={{
            reportType: 'appointments',
            elderlyId: 'all',
            caregiverId: 'all',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="reportType"
                label="Loại báo cáo"
                rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo' }]}
              >
                <Select>
                  <Option value="appointments">Cuộc hẹn</Option>
                  <Option value="health">Hồ sơ sức khỏe</Option>
                  <Option value="elderly">Người cao tuổi</Option>
                  <Option value="caregivers">Người chăm sóc</Option>
                  <Option value="comprehensive">Tổng hợp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dateRange"
                label="Khoảng thời gian"
              >
                <RangePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="elderlyId"
                label="Người cao tuổi"
              >
                <Select>
                  <Option value="all">Tất cả</Option>
                  {mockElderly.map(elderly => (
                    <Option key={elderly.id} value={elderly.id}>
                      {elderly.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="caregiverId"
                label="Người chăm sóc"
              >
                <Select>
                  <Option value="all">Tất cả</Option>
                  {mockCaregivers.map(caregiver => (
                    <Option key={caregiver.id} value={caregiver.id}>
                      {caregiver.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label=" ">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  Tạo báo cáo
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Report Results */}
      {reportData && summary && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <Card title="Tóm tắt báo cáo" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng cuộc hẹn"
                  value={summary.totalAppointments}
                  valueStyle={{ color: '#0ea5e9' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Đã hoàn thành"
                  value={summary.completedAppointments}
                  valueStyle={{ color: '#10b981' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Hồ sơ sức khỏe"
                  value={summary.totalHealthRecords}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Người cao tuổi"
                  value={summary.totalElderly}
                  valueStyle={{ color: '#8b5cf6' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Detailed Data */}
          {reportData.reportType === 'appointments' && (
            <Card title="Chi tiết cuộc hẹn" size="small">
              <Table
                columns={getAppointmentColumns()}
                dataSource={reportData.appointments}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </Card>
          )}

          {reportData.reportType === 'health' && (
            <Card title="Chi tiết hồ sơ sức khỏe" size="small">
              <Table
                columns={getHealthRecordColumns()}
                dataSource={reportData.healthRecords}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </Card>
          )}

          {reportData.reportType === 'comprehensive' && (
            <div className="space-y-4">
              <Card title="Cuộc hẹn" size="small">
                <Table
                  columns={getAppointmentColumns()}
                  dataSource={reportData.appointments}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
              
              <Card title="Hồ sơ sức khỏe" size="small">
                <Table
                  columns={getHealthRecordColumns()}
                  dataSource={reportData.healthRecords}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </div>
          )}

          {/* Export Button */}
          <Card size="small">
            <div className="text-center">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                size="large"
              >
                Xuất báo cáo Excel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomReport;
