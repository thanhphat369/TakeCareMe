import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, Row, Col, Card, Statistic, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Elderly } from '../types';
import { fetchEldersController, createElderController, updateElderController, deleteElderController } from '../controllers/eldersController';
import ElderDetailModal from './modals/ElderlyDetailModal';

const { Option } = Select;

const ElderlyManagement: React.FC = () => {
  const [elders, setElders] = useState<Elderly[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingElder, setEditingElder] = useState<Elderly | null>(null);
  const [selectedElder, setSelectedElder] = useState<Elderly | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const loadElders = async () => {
    try {
      setLoading(true);
      setElders(await fetchEldersController());
    } catch {
      message.error('Không thể tải danh sách người cao tuổi');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadElders(); }, []);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      values.dob = values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null;
      editingElder
        ? await updateElderController(editingElder.id, values)
        : await createElderController(values);
      message.success(editingElder ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setIsModalVisible(false);
      loadElders();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lưu dữ liệu thất bại');
    }
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      render: (text: string, r: Elderly) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {r.id}</div>
        </div>
      ),
    },
    { title: 'Ngày sinh', dataIndex: 'dob', render: (d?: string) => (d ? dayjs(d).format('DD/MM/YYYY') : '-') },
    { title: 'Giới tính', dataIndex: 'gender', render: (g: string) => <Tag color={g === 'M' ? 'blue' : 'pink'}>{g === 'M' ? 'Nam' : 'Nữ'}</Tag> },
    { title: 'Tuổi', dataIndex: 'age' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address' },
    { title: 'Ghi chú', dataIndex: 'note' },
    {
      title: 'Hành động',
      render: (_: any, r: Elderly) => (
        <Space>
          <Button icon={<EyeOutlined />} type="text" onClick={() => { setSelectedElder(r); setIsDetailModalVisible(true); }} />
          <Button icon={<EditOutlined />} type="text" onClick={() => { setEditingElder(r); setIsModalVisible(true); form.setFieldsValue({ ...r, dob: r.dob ? dayjs(r.dob) : undefined }); }} />
          <Popconfirm title="Xóa người này?" onConfirm={() => deleteElderController(r.id).then(loadElders)} okText="Có" cancelText="Không">
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: elders.length,
    active: elders.filter(e => e.status === 'Active').length,
    inactive: elders.filter(e => e.status === 'Inactive').length,
  };

  return (
    <div className="space-y-6">
      {/* Header + Nút thêm */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Quản lý người cao tuổi</h1>
          <p className="text-gray-600">Theo dõi và quản lý thông tin sức khỏe người cao tuổi</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingElder(null); form.resetFields(); setIsModalVisible(true); }}>
          Thêm mới
        </Button>
      </div>

      {/* Thống kê */}
      <Row gutter={16}>
        <Col span={8}><Card><Statistic title="Tổng số" value={stats.total} prefix={<UserOutlined />} valueStyle={{ color: '#0ea5e9' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Đang hoạt động" value={stats.active} valueStyle={{ color: '#10b981' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Ngừng hoạt động" value={stats.inactive} valueStyle={{ color: '#ef4444' }} /></Card></Col>
      </Row>

      {/* Bảng dữ liệu */}
      <Card>
        <Table columns={columns} dataSource={elders} loading={loading} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }} />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal title={editingElder ? 'Chỉnh sửa thông tin' : 'Thêm người cao tuổi'} open={isModalVisible} onOk={handleModalOk} onCancel={() => setIsModalVisible(false)} width={700}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}><Select><Option value="M">Nam</Option><Option value="F">Nữ</Option></Select></Form.Item></Col>
            <Col span={6}><Form.Item name="age" label="Tuổi" rules={[{ required: true }]}><InputNumber min={40} max={120} className="w-full" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="dob" label="Ngày sinh"><DatePicker className="w-full" format="DD/MM/YYYY" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <ElderDetailModal visible={isDetailModalVisible} elderly={selectedElder} onClose={() => setIsDetailModalVisible(false)} />
    </div>
  );
};

export default ElderlyManagement;
