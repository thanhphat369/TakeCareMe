import React, { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Space, Tabs } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import HealthTrendChart from './charts/HealthTrendChart';
import AppointmentStatsChart from './charts/AppointmentStatsChart';
import CaregiverPerformanceChart from './charts/CaregiverPerformanceChart';
import ElderlyStatusChart from './charts/ElderlyStatusChart';
import MonthlyReport from './reports/MonthlyReport';
import WeeklyReport from './reports/WeeklyReport';
import CustomReport from './reports/CustomReport';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [selectedElderly, setSelectedElderly] = useState('all');
  const [selectedCaregiver, setSelectedCaregiver] = useState('all');

  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting report...');
  };

  const handlePrint = () => {
    // Handle print functionality
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Báo cáo & Thống kê</h1>
          <p className="text-gray-600">Xem và xuất báo cáo chi tiết về hệ thống</p>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất Excel
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In báo cáo
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khoảng thời gian
            </label>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              className="w-full"
            >
              <Option value="week">Tuần này</Option>
              <Option value="month">Tháng này</Option>
              <Option value="quarter">Quý này</Option>
              <Option value="year">Năm nay</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
          </Col>
          <Col span={6}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người cao tuổi
            </label>
            <Select
              value={selectedElderly}
              onChange={setSelectedElderly}
              className="w-full"
            >
              <Option value="all">Tất cả</Option>
              <Option value="1">Nguyễn Văn An</Option>
              <Option value="2">Trần Thị Bình</Option>
              <Option value="3">Lê Văn Cường</Option>
            </Select>
          </Col>
          <Col span={6}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người chăm sóc
            </label>
            <Select
              value={selectedCaregiver}
              onChange={setSelectedCaregiver}
              className="w-full"
            >
              <Option value="all">Tất cả</Option>
              <Option value="cg1">Nguyễn Thị Lan</Option>
              <Option value="cg2">Trần Văn Minh</Option>
              <Option value="cg3">Trần Thị Kim Muội</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button type="primary" className="w-full">
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Xu hướng sức khỏe" className="h-96">
            <HealthTrendChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê cuộc hẹn" className="h-96">
            <AppointmentStatsChart />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hiệu suất người chăm sóc" className="h-96">
            <CaregiverPerformanceChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Trạng thái người cao tuổi" className="h-96">
            <ElderlyStatusChart />
          </Card>
        </Col>
      </Row>

      {/* Detailed Reports */}
      <Card>
        <Tabs defaultActiveKey="monthly">
          <TabPane tab="Báo cáo tháng" key="monthly">
            <MonthlyReport />
          </TabPane>
          <TabPane tab="Báo cáo tuần" key="weekly">
            <WeeklyReport />
          </TabPane>
          <TabPane tab="Báo cáo tùy chỉnh" key="custom">
            <CustomReport />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Reports;
