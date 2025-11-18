import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, Row, Col, Card, Statistic, Popconfirm, message, Upload, Avatar } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined, UserOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Elderly } from '../types';
import { fetchEldersController, createElderController, updateElderController, deleteElderController } from '../api/elders';
import ElderDetailModal from './modals/ElderlyDetailModal';
import { compressImage } from '../utils/imageCompress';
import apiClient from '../api/apiClient';

const { Option } = Select;

const ElderlyManagement: React.FC = () => {
  const [elders, setElders] = useState<Elderly[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedElder, setSelectedElder] = useState<Elderly | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  
  // Filter và search states
  const [searchText, setSearchText] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [minAge, setMinAge] = useState<number | null>(null);
  const [maxAge, setMaxAge] = useState<number | null>(null);

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
      // Đảm bảo avatar được gửi (có thể là null hoặc URL)
      values.avatar = avatarUrl || values.avatar || null;
      // Chuyển empty string thành null
      if (values.avatar === '') {
        values.avatar = null;
      }
      console.log('Saving elder with avatar:', values.avatar);
      await createElderController(values);
      message.success('Thêm mới thành công');
      setIsModalVisible(false);
      setAvatarUrl('');
      form.resetFields();
      await loadElders(); // Reload dữ liệu sau khi import
    } catch (error: any) {
      console.error('Error saving elder:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Lưu dữ liệu thất bại';
      message.error(errorMessage);
    }
  };

  // Hàm xử lý upload avatar
  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      // Compress image before upload
      const compressedFile = await compressImage(file, 800, 800, 0.8);
      
      // Upload to server
      const formData = new FormData();
      formData.append('avatar', compressedFile);
      
      const response = await apiClient.post('/api/elders/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const fileUrl = response.data.url;
      setAvatarUrl(fileUrl);
      form.setFieldsValue({ avatar: fileUrl });
      message.success('Tải lên hình ảnh thành công');
      return fileUrl;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Tải lên hình ảnh thất bại');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarUrl('');
    form.setFieldsValue({ avatar: '' });
  };

  const columns = [
    {
      title: 'Người cao tuổi',
      dataIndex: 'fullName',
      render: (text: string, r: Elderly) => {
        const avatarSrc = r.avatar 
          ? (r.avatar.startsWith('http') 
              ? r.avatar 
              : `${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'}${r.avatar}`)
          : undefined;
        return (
          <div className="flex items-center">
            <Avatar size="small" src={avatarSrc} icon={<UserOutlined />} className="mr-2" />
            <div>
              <div className="font-medium">{text}</div>
              {r.email && <div className="text-xs text-gray-500">{r.email}</div>}
            </div>
          </div>
        );
      },
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
          <Popconfirm title="Xóa người này?" onConfirm={() => deleteElderController(r.id).then(loadElders)} okText="Có" cancelText="Không">
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Lọc dữ liệu dựa trên search và filter
  const filteredElders = useMemo(() => {
    let filtered = [...elders];

    // Lọc theo tìm kiếm (tên, số điện thoại, địa chỉ)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(elder => 
        elder.fullName?.toLowerCase().includes(searchLower) ||
        elder.phone?.toLowerCase().includes(searchLower) ||
        elder.address?.toLowerCase().includes(searchLower) ||
        elder.email?.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo giới tính
    if (genderFilter !== 'all') {
      filtered = filtered.filter(elder => elder.gender === genderFilter);
    }

    // Lọc theo độ tuổi
    if (minAge !== null) {
      filtered = filtered.filter(elder => elder.age !== null && elder.age !== undefined && elder.age >= minAge);
    }
    if (maxAge !== null) {
      filtered = filtered.filter(elder => elder.age !== null && elder.age !== undefined && elder.age <= maxAge);
    }

    return filtered;
  }, [elders, searchText, genderFilter, minAge, maxAge]);

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
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { form.resetFields(); setAvatarUrl(''); setIsModalVisible(true); }}>
          Thêm mới
        </Button>
      </div>

      {/* Thống kê */}
      <Row gutter={16}>
        <Col span={8}><Card><Statistic title="Tổng số" value={stats.total} prefix={<UserOutlined />} valueStyle={{ color: '#0ea5e9' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Đang hoạt động" value={stats.active} valueStyle={{ color: '#10b981' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Ngừng hoạt động" value={stats.inactive} valueStyle={{ color: '#ef4444' }} /></Card></Col>
      </Row>

      {/* Bộ lọc và tìm kiếm */}
      <Card>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, địa chỉ, email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Giới tính"
              value={genderFilter}
              onChange={(value) => setGenderFilter(value || 'all')}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">Tất cả</Option>
              <Option value="M">Nam</Option>
              <Option value="F">Nữ</Option>
            </Select>
          </Col>
          <Col span={3}>
            <InputNumber
              placeholder="Tuổi tối thiểu"
              value={minAge}
              onChange={(value) => setMinAge(value)}
              min={0}
              max={120}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={3}>
            <InputNumber
              placeholder="Tuổi tối đa"
              value={maxAge}
              onChange={(value) => setMaxAge(value)}
              min={0}
              max={120}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button 
                onClick={() => {
                  setSearchText('');
                  setGenderFilter('all');
                  setMinAge(null);
                  setMaxAge(null);
                }}
              >
                Xóa bộ lọc
              </Button>
              <span className="text-gray-500">
                Hiển thị: {filteredElders.length} / {elders.length}
              </span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table columns={columns} dataSource={filteredElders} loading={loading} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }} />
      </Card>

      {/* Modal thêm mới */}
      <Modal title="Thêm người cao tuổi" open={isModalVisible} onOk={handleModalOk} onCancel={() => { setIsModalVisible(false); setAvatarUrl(''); form.resetFields(); }} width={700}>
        <Form form={form} layout="vertical">
          {/* Avatar Upload Section */}
          <Row gutter={16} className="mb-4">
            <Col span={24}>
              <Form.Item label="Hình ảnh đại diện">
                <div className="flex items-center space-x-4">
                  <Avatar
                    size={80}
                    src={avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'}${avatarUrl}`) : undefined}
                    icon={<UserOutlined />}
                  >
                    {form.getFieldValue('fullName')?.charAt(0) || 'U'}
                  </Avatar>
                  <div className="flex-1">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        // Validate file type
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                          message.error('Chỉ được tải lên file hình ảnh!');
                          return false;
                        }

                        // Validate file size (max 2MB)
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isLt2M) {
                          message.error('Hình ảnh phải nhỏ hơn 2MB!');
                          return false;
                        }

                        setUploading(true);
                        handleAvatarUpload(file).finally(() => setUploading(false));
                        return false; // Prevent default upload
                      }}
                    >
                      <Button loading={uploading} icon={<UploadOutlined />}>
                        {avatarUrl ? 'Thay đổi hình ảnh' : 'Tải lên hình ảnh'}
                      </Button>
                    </Upload>
                    {avatarUrl && (
                      <Button
                        type="text"
                        danger
                        onClick={handleAvatarRemove}
                        className="ml-2"
                      >
                        Xóa hình ảnh
                      </Button>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 2MB
                    </div>
                  </div>
                </div>
              </Form.Item>
              {/* Hidden field to store avatar URL */}
              <Form.Item name="avatar" style={{ display: 'none' }}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

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
      <ElderDetailModal 
        visible={isDetailModalVisible} 
        elderly={selectedElder} 
        onClose={() => setIsDetailModalVisible(false)}
        onUpdate={loadElders}
      />
    </div>
  );
};

export default ElderlyManagement;
