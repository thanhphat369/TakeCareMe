import React, { useState, useEffect, useMemo } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, Tag,
  Row, Col, Statistic, Avatar, Tabs, message, Upload, InputNumber
} from "antd";
import {
  EyeOutlined, UserOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, TeamOutlined, SafetyOutlined, HeartOutlined, UploadOutlined, SearchOutlined
} from "@ant-design/icons";
import { compressImage } from '../utils/imageCompress';
import apiClient from '../api/apiClient';
import { Staff } from "../types";
import {
  fetchStaffController, createStaffController, updateStaffController,
  deleteStaffController, fetchStaffStatisticsController
} from "../controllers/staffController";
import StaffDetailModal from "./modals/StaffDetailModal";

const { Option } = Select;
const { TabPane } = Tabs;

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, doctors: 0, nurses: 0 });
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  
  // Filter và search states
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [minExperience, setMinExperience] = useState<number | null>(null);
  const [maxExperience, setMaxExperience] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, summary] = await Promise.all([
        fetchStaffController(),
        fetchStaffStatisticsController()
      ]);
      setStaff(list);
      setStats({
        total: summary.total,
        active: summary.active,
        doctors: summary.byRole?.doctors || 0,
        nurses: summary.byRole?.nurses || 0
      });
    } catch (e) {
      message.error("Không thể tải dữ liệu nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Đảm bảo avatar được gửi (có thể là null hoặc URL)
      // Ưu tiên avatarUrl từ state, sau đó là values.avatar từ form
      const avatarValue = avatarUrl || values.avatar || null;
      // Chuyển empty string thành null
      const finalAvatar = avatarValue === '' ? null : avatarValue;
      
      const payload = {
        ...values,
        avatar: finalAvatar,
        experienceYears: Number(values.experienceYears) || 0,
        status: values.status || "Active"
      };
      editingStaff
        ? await updateStaffController(editingStaff.id, payload)
        : await createStaffController(payload);
      message.success(editingStaff ? "Cập nhật thành công" : "Thêm mới thành công");
      setIsModalVisible(false);
      setAvatarUrl('');
      form.resetFields();
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join(", ") : msg || "Lưu thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStaffController(id);
      message.success("Đã xóa nhân viên");
      loadData();
    } catch {
      message.error("Không thể xóa nhân viên");
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
      
      const response = await apiClient.post('/api/staff/upload-avatar', formData, {
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
      title: "Nhân viên",
      dataIndex: "fullName",
      render: (text: string, r: Staff) => {
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
              <div className="text-xs text-gray-500">{r.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role: string) => (
        <Tag color={role === "Doctor" ? "blue" : "green"}>
          {role === "Doctor" ? "Bác sĩ" : "Điều dưỡng"}
        </Tag>
      ),
    },
    { title: "Chức danh", dataIndex: "roleTitle" },
    { title: "Khoa/Phòng", dataIndex: "department" },
    {
      title: "Ca làm việc",
      dataIndex: "shift",
      render: (s: string) =>
        ({ morning: "Ca sáng", afternoon: "Ca chiều", night: "Ca đêm", flexible: "Linh hoạt" }[s] || s)
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (st: string) => (
        <Tag color={st === "Active" ? "green" : st === "OnLeave" ? "orange" : "red"}>
          {st === "Active" ? "Hoạt động" : st === "OnLeave" ? "Nghỉ phép" : "Ngừng"}
        </Tag>
      ),
    },
    { title: "Kinh nghiệm", dataIndex: "experienceYears", render: (y: number) => `${y} năm` },
    {
      title: "Hành động",
      render: (_: any, r: Staff) => (
        <Space>
          <Button icon={<EyeOutlined />} type="link" onClick={() => { setSelectedStaff(r); setIsDetailVisible(true); }}>Xem</Button>
          <Button icon={<EditOutlined />} type="link" onClick={() => { 
            // Extract relative path if it's a full URL
            let avatarPath = r.avatar || '';
            if (avatarPath && avatarPath.startsWith('http')) {
              try {
                const urlObj = new URL(avatarPath);
                avatarPath = urlObj.pathname;
              } catch {
                // If URL parsing fails, keep original
                avatarPath = r.avatar || '';
              }
            }
            setEditingStaff(r); 
            setAvatarUrl(avatarPath || ''); 
            form.setFieldsValue({ ...r, avatar: avatarPath || null }); 
            setIsModalVisible(true); 
          }}>Sửa</Button>
          <Button icon={<DeleteOutlined />} type="link" danger onClick={() => handleDelete(r.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  // Lọc dữ liệu dựa trên search và filter
  const filteredStaff = useMemo(() => {
    let filtered = [...staff];

    // Lọc theo tìm kiếm (tên, email, số điện thoại, chức danh, khoa/phòng)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(s => 
        s.fullName?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower) ||
        s.phone?.toLowerCase().includes(searchLower) ||
        s.roleTitle?.toLowerCase().includes(searchLower) ||
        s.department?.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Lọc theo ca làm việc
    if (shiftFilter !== 'all') {
      filtered = filtered.filter(s => s.shift === shiftFilter);
    }

    // Lọc theo kinh nghiệm
    if (minExperience !== null) {
      filtered = filtered.filter(s => s.experienceYears !== null && s.experienceYears !== undefined && s.experienceYears >= minExperience);
    }
    if (maxExperience !== null) {
      filtered = filtered.filter(s => s.experienceYears !== null && s.experienceYears !== undefined && s.experienceYears <= maxExperience);
    }

    return filtered;
  }, [staff, searchText, statusFilter, shiftFilter, minExperience, maxExperience]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Quản lý nhân viên</h1>
          <p className="text-gray-600">Thông tin, vai trò và ca làm việc</p>
        </div>
          <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingStaff(null); form.resetFields(); setAvatarUrl(''); setIsModalVisible(true); }}
        >
          Thêm nhân viên
        </Button>
      </div>

      {/* Thống kê */}
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="Tổng nhân viên" value={stats.total} prefix={<TeamOutlined />} valueStyle={{ color: "#1890ff" }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Hoạt động" value={stats.active} valueStyle={{ color: "#52c41a" }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Bác sĩ" value={stats.doctors} prefix={<SafetyOutlined />} valueStyle={{ color: "#1890ff" }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Điều dưỡng" value={stats.nurses} prefix={<HeartOutlined />} valueStyle={{ color: "#52c41a" }} /></Card></Col>
      </Row>

      {/* Bộ lọc và tìm kiếm */}
      <Card>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm theo tên, email, SĐT, chức danh, khoa/phòng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || 'all')}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">Tất cả</Option>
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Nghỉ việc</Option>
              <Option value="OnLeave">Nghỉ phép</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Ca làm việc"
              value={shiftFilter}
              onChange={(value) => setShiftFilter(value || 'all')}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">Tất cả</Option>
              <Option value="morning">Ca sáng</Option>
              <Option value="afternoon">Ca chiều</Option>
              <Option value="night">Ca đêm</Option>
              <Option value="flexible">Linh hoạt</Option>
            </Select>
          </Col>
          <Col span={3}>
            <InputNumber
              placeholder="Kinh nghiệm tối thiểu"
              value={minExperience}
              onChange={(value) => setMinExperience(value)}
              min={0}
              max={50}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={3}>
            <InputNumber
              placeholder="Kinh nghiệm tối đa"
              value={maxExperience}
              onChange={(value) => setMaxExperience(value)}
              min={0}
              max={50}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('all');
                  setShiftFilter('all');
                  setMinExperience(null);
                  setMaxExperience(null);
                }}
              >
                Xóa bộ lọc
              </Button>
              <span className="text-gray-500">
                Hiển thị: {filteredStaff.length} / {staff.length}
              </span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Danh sách nhân viên */}
      <Card>
        <Tabs defaultActiveKey="all">
          <TabPane tab={`Tất cả (${filteredStaff.length})`} key="all">
            <Table columns={columns} dataSource={filteredStaff} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
          </TabPane>
          <TabPane tab={`Đang hoạt động (${filteredStaff.filter(s => s.status === "Active").length})`} key="active">
            <Table columns={columns} dataSource={filteredStaff.filter(s => s.status === "Active")} rowKey="id" />
          </TabPane>
          <TabPane tab={`Bác sĩ (${filteredStaff.filter(s => s.role === "Doctor").length})`} key="doctors">
            <Table columns={columns} dataSource={filteredStaff.filter(s => s.role === "Doctor")} rowKey="id" />
          </TabPane>
          <TabPane tab={`Điều dưỡng (${filteredStaff.filter(s => s.role === "Staff").length})`} key="nurses">
            <Table columns={columns} dataSource={filteredStaff.filter(s => s.role === "Staff")} rowKey="id" />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingStaff ? "Sửa thông tin" : "Thêm nhân viên"}
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setAvatarUrl(''); form.resetFields(); }}
        footer={null}
        width={750}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            <Col span={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="role" label="Vai trò" rules={[{ required: true }]}><Select><Option value="Doctor">Bác sĩ</Option><Option value="Staff">Điều dưỡng</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="roleTitle" label="Chức danh" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="licenseNo" label="Số chứng chỉ hành nghề"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="department" label="Khoa/Phòng" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="shift" label="Ca làm việc" rules={[{ required: true }]}><Select>
              <Option value="morning">Ca sáng</Option>
              <Option value="afternoon">Ca chiều</Option>
              <Option value="night">Ca đêm</Option>
              <Option value="flexible">Linh hoạt</Option>
            </Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="experienceYears" label="Kinh nghiệm (năm)" rules={[{ required: true }]}><Input type="number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="Trạng thái" initialValue="Active"><Select>
              <Option value="Active">Đang làm việc</Option>
              <Option value="Inactive">Nghỉ việc</Option>
              <Option value="OnLeave">Nghỉ phép</Option>
            </Select></Form.Item></Col>
          </Row>
          <Form.Item name="education" label="Bằng cấp"><Input /></Form.Item>
          <Form.Item name="skills" label="Kỹ năng/Chuyên môn"><Input.TextArea rows={2} maxLength={255} showCount /></Form.Item>
          <Form.Item name="notes" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
          {!editingStaff && <Form.Item name="password" label="Mật khẩu" extra="Để trống = staff123"><Input.Password /></Form.Item>}
          <Space>
            <Button type="primary" htmlType="submit">{editingStaff ? "Cập nhật" : "Thêm mới"}</Button>
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
          </Space>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <StaffDetailModal visible={isDetailVisible} staff={selectedStaff} onClose={() => setIsDetailVisible(false)} />
    </div>
  );
};

export default StaffManagement;
