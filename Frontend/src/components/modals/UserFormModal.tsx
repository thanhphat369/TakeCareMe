import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, message, Switch, Upload, Avatar, Tabs } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined, 
  PlusOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  TeamOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { User, CreateUserRequest, UpdateUserRequest } from '../../types';
import { createUser, updateUser } from '../../api/users';

interface UserFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  onClose,
  onSave,
  user,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || '');
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'Elder');

  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        notes: user.notes,
        // Role-specific data
        roleTitle: user.roleData?.roleTitle,
        licenseNo: user.roleData?.licenseNo,
        skills: user.roleData?.skills,
        experienceYears: user.roleData?.experienceYears,
        department: user.roleData?.department,
        relationship: user.roleData?.relationship,
        isPrimary: user.roleData?.isPrimary,
        age: user.roleData?.age,
        gender: user.roleData?.gender,
        address: user.roleData?.address,
      });
      setAvatarUrl(user.avatar || '');
      setSelectedRole(user.role);
    } else {
      form.resetFields();
      setAvatarUrl('');
      setSelectedRole('Elder');
    }
  }, [user, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Prepare role-specific data
      const roleData: any = {};
      
      if (['Doctor', 'Staff'].includes(selectedRole)) {
        roleData.roleTitle = values.roleTitle;
        roleData.licenseNo = values.licenseNo;
        roleData.skills = values.skills;
        roleData.experienceYears = values.experienceYears;
        roleData.department = values.department;
      } else if (selectedRole === 'Family') {
        roleData.relationship = values.relationship;
        roleData.isPrimary = values.isPrimary;
      } else if (selectedRole === 'Elder') {
        roleData.age = values.age;
        roleData.gender = values.gender;
        roleData.address = values.address;
        roleData.contactPersonId = values.contactPersonId;
      }

      const submitData = {
        ...values,
        avatar: avatarUrl,
        roleData,
      };

      if (isEdit) {
        await updateUser(user!.id, submitData as UpdateUserRequest);
        message.success('Cập nhật người dùng thành công');
      } else {
        await createUser(submitData as CreateUserRequest);
        message.success('Tạo người dùng thành công');
      }
      
      onSave();
      form.resetFields();
      setAvatarUrl('');
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAvatarUrl('');
    onClose();
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      setAvatarUrl(info.file.response?.url || '');
    }
  };

  const roleOptions = [
    { value: 'SuperAdmin', label: 'Super Admin', icon: <CrownOutlined /> },
    { value: 'Admin', label: 'Quản lý', icon: <TeamOutlined /> },
    { value: 'Doctor', label: 'Bác sĩ', icon: <MedicineBoxOutlined /> },
    { value: 'Staff', label: 'Nhân viên chăm sóc', icon: <HeartOutlined /> },
    { value: 'Family', label: 'Người thân', icon: <HomeOutlined /> },
    { value: 'Elder', label: 'Người cao tuổi', icon: <UserOutlined /> },
  ];

  const relationshipOptions = [
    { value: 'Con trai', label: 'Con trai' },
    { value: 'Con gái', label: 'Con gái' },
    { value: 'Con dâu', label: 'Con dâu' },
    { value: 'Con rể', label: 'Con rể' },
    { value: 'Cháu trai', label: 'Cháu trai' },
    { value: 'Cháu gái', label: 'Cháu gái' },
    { value: 'Anh/Chị', label: 'Anh/Chị' },
    { value: 'Em trai/Em gái', label: 'Em trai/Em gái' },
    { value: 'Cháu nội', label: 'Cháu nội' },
    { value: 'Cháu ngoại', label: 'Cháu ngoại' },
    { value: 'Người giám hộ', label: 'Người giám hộ' },
    { value: 'Khác', label: 'Khác' },
  ];

  const departmentOptions = [
    'Khoa Nội',
    'Khoa Ngoại',
    'Khoa Tim mạch',
    'Khoa Thần kinh',
    'Khoa Hô hấp',
    'Khoa Tiêu hóa',
    'Khoa Nội tiết',
    'Khoa Da liễu',
    'Khoa Mắt',
    'Khoa Tai mũi họng',
    'Khoa Xương khớp',
    'Khoa Tâm thần',
    'Phòng khám đa khoa',
    'Phòng cấp cứu',
    'Phòng điều dưỡng',
  ];

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case 'Doctor':
      case 'Staff':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roleTitle" label="Chức danh">
                <Input placeholder="VD: Bác sĩ chuyên khoa, Điều dưỡng trưởng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="licenseNo" label="Số chứng chỉ hành nghề">
                <Input placeholder="Nhập số chứng chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Phòng ban">
                <Select placeholder="Chọn phòng ban">
                  {departmentOptions.map(dept => (
                    <Select.Option key={dept} value={dept}>{dept}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="experienceYears" label="Số năm kinh nghiệm">
                <Input type="number" min={0} placeholder="Nhập số năm" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="skills" label="Kỹ năng chuyên môn">
                <Input.TextArea 
                  rows={3} 
                  placeholder="Mô tả kỹ năng chuyên môn, chứng chỉ đặc biệt..."
                />
              </Form.Item>
            </Col>
          </Row>
        );
      
      case 'Family':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="relationship" label="Mối quan hệ">
                <Select placeholder="Chọn mối quan hệ">
                  {relationshipOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isPrimary" label="Người liên hệ chính" valuePropName="checked">
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
          </Row>
        );
      
      case 'Elder':
        return (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="age" label="Tuổi" rules={[{ required: true }]}>
                <Input type="number" min={60} max={120} placeholder="Nhập tuổi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="M">Nam</Select.Option>
                  <Select.Option value="F">Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contactPersonId" label="ID người liên hệ">
                <Input type="number" placeholder="ID người thân liên hệ" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-blue-500" />
          {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEdit ? 'Cập nhật' : 'Tạo mới'}
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'Active',
          isPrimary: false,
        }}
      >
        <Tabs
          items={[
            {
              key: 'basic',
              label: 'Thông tin cơ bản',
              children: (
                <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="text-center mb-6">
                    <Avatar
                      size={80}
                      src={avatarUrl}
                      icon={<UserOutlined />}
                      className="mb-2"
                    />
                    <div>
                      <Upload
                        name="avatar"
                        listType="picture-card"
                        showUploadList={false}
                        action="/api/upload/avatar"
                        onChange={handleAvatarChange}
                        beforeUpload={(file) => {
                          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                          if (!isJpgOrPng) {
                            message.error('Chỉ chấp nhận file JPG/PNG!');
                          }
                          const isLt2M = file.size! / 1024 / 1024 < 2;
                          if (!isLt2M) {
                            message.error('Kích thước file phải nhỏ hơn 2MB!');
                          }
                          return isJpgOrPng && isLt2M;
                        }}
                      >
                        <Button type="dashed" icon={<PlusOutlined />}>
                          Thêm ảnh
                        </Button>
                      </Upload>
                    </div>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                          { required: true, message: 'Vui lòng nhập họ tên' },
                          { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
                        ]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                      >
                        <Select 
                          placeholder="Chọn vai trò"
                          onChange={setSelectedRole}
                        >
                          {roleOptions.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                              <div className="flex items-center">
                                {option.icon}
                                <span className="ml-2">{option.label}</span>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email' },
                          { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                          { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' },
                        ]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {!isEdit && (
                    <Form.Item
                      name="password"
                      label="Mật khẩu"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                      ]}
                    >
                      <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                  )}

                  {isEdit && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select>
                            <Select.Option value="Active">Hoạt động</Select.Option>
                            <Select.Option value="Inactive">Không hoạt động</Select.Option>
                            <Select.Option value="Banned">Bị khóa</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Form.Item name="notes" label="Ghi chú">
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Ghi chú thêm về người dùng (tùy chọn)" 
                    />
                  </Form.Item>
                </div>
              )
            },
            {
              key: 'role',
              label: 'Thông tin vai trò',
              children: (
                <div className="space-y-4">
                  {renderRoleSpecificFields()}
                </div>
              )
            }
          ]}
        />
      </Form>
    </Modal>
  );
};

export default UserFormModal;
