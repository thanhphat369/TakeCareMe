import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Descriptions,
  Tabs,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  FireOutlined,
  DashboardOutlined,
  MonitorOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { mockHealthRecords, mockElderly } from '../data/mockData';
import { HealthRecord } from '../types';
import VitalSignsMonitor from './VitalSignsMonitor';

const { Option } = Select;

const HealthRecords: React.FC = () => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(mockHealthRecords);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      date: record.date ? new Date(record.date) : null,
    });
  };

  const handleDelete = (id: string) => {
    setHealthRecords(healthRecords.filter(item => item.id !== id));
    message.success('Xóa thành công');
  };

  const handleView = (record: HealthRecord) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newRecord: HealthRecord = {
        ...values,
        id: editingRecord?.id || Date.now().toString(),
        date: values.date.toDate(),
      };

      if (editingRecord) {
        setHealthRecords(healthRecords.map(item => 
          item.id === editingRecord.id ? newRecord : item
        ));
        message.success('Cập nhật thành công');
      } else {
        setHealthRecords([...healthRecords, newRecord]);
        message.success('Thêm mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { status: 'normal', color: 'green', text: 'Bình thường' };
    if (systolic < 130 && diastolic < 80) return { status: 'elevated', color: 'orange', text: 'Cao nhẹ' };
    if (systolic < 140 && diastolic < 90) return { status: 'stage1', color: 'orange', text: 'Tăng huyết áp giai đoạn 1' };
    if (systolic < 180 && diastolic < 120) return { status: 'stage2', color: 'red', text: 'Tăng huyết áp giai đoạn 2' };
    return { status: 'crisis', color: 'red', text: 'Khủng hoảng tăng huyết áp' };
  };

  const getBMICategory = (weight: number, height: number) => {
    const bmi = weight / Math.pow(height / 100, 2);
    if (bmi < 18.5) return { category: 'underweight', color: 'blue', text: 'Thiếu cân' };
    if (bmi < 25) return { category: 'normal', color: 'green', text: 'Bình thường' };
    if (bmi < 30) return { category: 'overweight', color: 'orange', text: 'Thừa cân' };
    return { category: 'obese', color: 'red', text: 'Béo phì' };
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: HealthRecord, b: HealthRecord) => 
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderlyId',
      key: 'elderlyId',
      render: (elderlyId: string) => {
        const elderly = mockElderly.find(e => e.id === elderlyId);
        return elderly ? elderly.fullName : 'Không xác định';
      },
    },
    {
      title: 'Huyết áp',
      key: 'bloodPressure',
      render: (_: any, record: HealthRecord) => {
        const bpStatus = getBloodPressureStatus(record.bloodPressure.systolic, record.bloodPressure.diastolic);
        return (
          <div>
            <div className="font-medium">
              {record.bloodPressure.systolic}/{record.bloodPressure.diastolic} mmHg
            </div>
            <Tag color={bpStatus.color} className="text-xs">
              {bpStatus.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Nhịp tim',
      dataIndex: 'heartRate',
      key: 'heartRate',
      render: (heartRate: number) => (
        <div className="flex items-center">
          <HeartOutlined className="mr-1 text-red-500" />
          {heartRate} bpm
        </div>
      ),
    },
    {
      title: 'Nhiệt độ',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temperature: number) => (
        <div className="flex items-center">
          <FireOutlined className="mr-1 text-orange-500" />
          {temperature}°C
        </div>
      ),
    },
    {
      title: 'Cân nặng',
      key: 'weight',
      render: (_: any, record: HealthRecord) => {
        const bmi = getBMICategory(record.weight, record.height);
        return (
          <div>
            <div className="flex items-center">
              <DashboardOutlined className="mr-1 text-blue-500" />
              {record.weight} kg
            </div>
            <Tag color={bmi.color} className="text-xs">
              {bmi.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'symptoms',
      key: 'symptoms',
      render: (symptoms: string[]) => (
        <div className="flex flex-wrap gap-1">
          {symptoms.map((symptom, index) => (
            <Tag key={index} color="purple" className="text-xs">
              {symptom}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: HealthRecord) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: healthRecords.length,
    thisMonth: healthRecords.filter(record => {
      const recordDate = new Date(record.date);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear();
    }).length,
    highBP: healthRecords.filter(record => 
      record.bloodPressure.systolic >= 140 || record.bloodPressure.diastolic >= 90
    ).length,
    normalBP: healthRecords.filter(record => 
      record.bloodPressure.systolic < 120 && record.bloodPressure.diastolic < 80
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Theo dõi sức khỏe</h1>
          <p className="text-gray-600">Giám sát sinh hiệu và quản lý hồ sơ sức khỏe người cao tuổi</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          className="w-full sm:w-auto"
        >
          Thêm hồ sơ
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hồ sơ"
              value={stats.total}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#0ea5e9' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Huyết áp cao"
              value={stats.highBP}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Huyết áp bình thường"
              value={stats.normalBP}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Health Alerts */}
      {stats.highBP > 0 && (
        <Alert
          message="Cảnh báo sức khỏe"
          description={`Có ${stats.highBP} hồ sơ ghi nhận huyết áp cao. Vui lòng theo dõi và có biện pháp can thiệp kịp thời.`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      {/* Main Content with Tabs */}
      <Card>
        <Tabs defaultActiveKey="monitor" items={[
          {
            key: 'monitor',
            label: (
              <span>
                <MonitorOutlined />
                Theo dõi real-time
              </span>
            ),
            children: <VitalSignsMonitor />
          },
          {
            key: 'records',
            label: (
              <span>
                <HistoryOutlined />
                Lịch sử hồ sơ
              </span>
            ),
            children: (
              <Table
                columns={columns}
                dataSource={healthRecords}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} mục`,
                }}
                scroll={{ x: 800 }}
              />
            )
          }
        ]} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh sửa hồ sơ sức khỏe' : 'Thêm hồ sơ sức khỏe mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 70,
            temperature: 36.5,
            weight: 70,
            height: 170,
            symptoms: [],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="elderlyId"
                label="Người cao tuổi"
                rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
              >
                <Select>
                  {mockElderly.map(elderly => (
                    <Option key={elderly.id} value={elderly.id}>
                      {elderly.fullName} ({elderly.age} tuổi)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày khám"
                rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['bloodPressure', 'systolic']}
                label="Huyết áp tâm thu (mmHg)"
                rules={[{ required: true, message: 'Vui lòng nhập huyết áp tâm thu' }]}
              >
                <InputNumber min={50} max={300} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['bloodPressure', 'diastolic']}
                label="Huyết áp tâm trương (mmHg)"
                rules={[{ required: true, message: 'Vui lòng nhập huyết áp tâm trương' }]}
              >
                <InputNumber min={30} max={200} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="heartRate"
                label="Nhịp tim (bpm)"
                rules={[{ required: true, message: 'Vui lòng nhập nhịp tim' }]}
              >
                <InputNumber min={30} max={200} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="temperature"
                label="Nhiệt độ (°C)"
                rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ' }]}
              >
                <InputNumber min={30} max={45} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="weight"
                label="Cân nặng (kg)"
                rules={[{ required: true, message: 'Vui lòng nhập cân nặng' }]}
              >
                <InputNumber min={20} max={200} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="height"
                label="Chiều cao (cm)"
                rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}
              >
                <InputNumber min={100} max={250} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="Triệu chứng"
          >
            <Select
              mode="multiple"
              placeholder="Chọn triệu chứng"
              options={[
                { value: 'Mệt mỏi', label: 'Mệt mỏi' },
                { value: 'Đau đầu', label: 'Đau đầu' },
                { value: 'Chóng mặt', label: 'Chóng mặt' },
                { value: 'Khó thở', label: 'Khó thở' },
                { value: 'Đau ngực', label: 'Đau ngực' },
                { value: 'Buồn nôn', label: 'Buồn nôn' },
                { value: 'Sốt', label: 'Sốt' },
                { value: 'Ho', label: 'Ho' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="recordedBy"
            label="Người ghi nhận"
            rules={[{ required: true, message: 'Vui lòng nhập tên người ghi nhận' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết hồ sơ sức khỏe"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Ngày khám">
              {new Date(selectedRecord.date).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Người cao tuổi">
              {mockElderly.find(e => e.id === selectedRecord.elderlyId)?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Huyết áp">
              {selectedRecord.bloodPressure.systolic}/{selectedRecord.bloodPressure.diastolic} mmHg
              <Tag color={getBloodPressureStatus(selectedRecord.bloodPressure.systolic, selectedRecord.bloodPressure.diastolic).color} className="ml-2">
                {getBloodPressureStatus(selectedRecord.bloodPressure.systolic, selectedRecord.bloodPressure.diastolic).text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nhịp tim">
              {selectedRecord.heartRate} bpm
            </Descriptions.Item>
            <Descriptions.Item label="Nhiệt độ">
              {selectedRecord.temperature}°C
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng">
              {selectedRecord.weight} kg
            </Descriptions.Item>
            <Descriptions.Item label="Chiều cao">
              {selectedRecord.height} cm
            </Descriptions.Item>
            <Descriptions.Item label="Triệu chứng">
              {selectedRecord.symptoms.map((symptom, index) => (
                <Tag key={index} color="purple" className="mr-1">
                  {symptom}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedRecord.notes}
            </Descriptions.Item>
            <Descriptions.Item label="Người ghi nhận">
              {selectedRecord.recordedBy}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default HealthRecords;
