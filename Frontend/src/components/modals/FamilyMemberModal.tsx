import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, message, Switch, Upload, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';
import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '../../types/family-member';

interface FamilyMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateFamilyMemberRequest | UpdateFamilyMemberRequest) => Promise<void>;
  familyMember?: FamilyMember | null;
  elderlyId: string;
}

const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  visible,
  onClose,
  onSave,
  familyMember,
  elderlyId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(familyMember?.family?.avatar || '');
  void elderlyId;

  const isEdit = !!familyMember;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const submitData = isEdit 
        ? { ...values, avatar: avatarUrl } as UpdateFamilyMemberRequest
        : { ...values, avatar: avatarUrl } as CreateFamilyMemberRequest;

      await onSave(submitData);
      message.success(isEdit ? 'Cập nhật thành công' : 'Thêm người mới thành công');
      form.resetFields();
      setAvatarUrl('');
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
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
    { value: 'Nguời giám hộ', label: 'Nguời giám hộ' },
    { value: 'Khác', label: 'Khác' },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-blue-500" />
          {isEdit ? 'Chỉnh sửa thông tin người thân' : 'Thêm người thân mới'}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          H?y
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>,
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={familyMember ? {
          fullName: familyMember.family.fullName,
          email: familyMember.family.email,
          phone: familyMember.family.phone,
          relationship: familyMember.relationship,
          address: familyMember.family.address,
          isPrimary: familyMember.isPrimary,
          status: familyMember.family.status,
        } : {
          isPrimary: false,
          status: 'Active',
        }}
      >
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
                { required: true, message: 'Vui lòng nhập họ và tên' },
                { min: 2, message: 'Họ và tên phải có ít nhất 2 kí tự' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="relationship"
              label="Mối quan hệ"
              rules={[{ required: true, message: 'Vui lòng chọn quan hệ' }]}
            >
              <Select placeholder="Chọn mối quan hệ">
                {relationshipOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
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
                { required: true, message: 'Vui lòng nhập số điện thoại' },
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
              { required: true, message: 'Vui lòng nhập mật khẩu ' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 kí tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input.TextArea 
            placeholder="Nhập địa chỉ" 
            rows={2}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isPrimary"
              label="Người liên hệ chính"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Có" 
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Col>
          {isEdit && (
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
              >
                <Select>
                  <Select.Option value="Active">Hoạt động</Select.Option>
                  <Select.Option value="Inactive">Không hoạt động</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea 
            placeholder="Ghi chú thêm nguời thân (tùy chọn)" 
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FamilyMemberModal;
