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
      message.success(isEdit ? 'C?p nh?t thành công' : 'Thêm ngu?i thân thành công');
      form.resetFields();
      setAvatarUrl('');
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Có l?i x?y ra');
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
    { value: 'Con r?', label: 'Con r?' },
    { value: 'Cháu trai', label: 'Cháu trai' },
    { value: 'Cháu gái', label: 'Cháu gái' },
    { value: 'Anh/Ch?', label: 'Anh/Ch?' },
    { value: 'Em trai/Em gái', label: 'Em trai/Em gái' },
    { value: 'Cháu n?i', label: 'Cháu n?i' },
    { value: 'Cháu ngo?i', label: 'Cháu ngo?i' },
    { value: 'Ngu?i giám h?', label: 'Ngu?i giám h?' },
    { value: 'Khác', label: 'Khác' },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-blue-500" />
          {isEdit ? 'Ch?nh s?a thông tin ngu?i thân' : 'Thêm ngu?i thân m?i'}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          H?y
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEdit ? 'C?p nh?t' : 'Thêm m?i'}
        </Button>,
      ]}
      width={700}
      destroyOnClose
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
                  message.error('Ch? ch?p nh?n file JPG/PNG!');
                }
                const isLt2M = file.size! / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Kích thu?c file ph?i nh? hon 2MB!');
                }
                return isJpgOrPng && isLt2M;
              }}
            >
              <Button type="dashed" icon={<PlusOutlined />}>
                Thêm ?nh
              </Button>
            </Upload>
          </div>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="H? và tên"
              rules={[
                { required: true, message: 'Vui lòng nh?p h? tên' },
                { min: 2, message: 'H? tên ph?i có ít nh?t 2 ký t?' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nh?p h? và tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="relationship"
              label="M?i quan h?"
              rules={[{ required: true, message: 'Vui lòng ch?n m?i quan h?' }]}
            >
              <Select placeholder="Ch?n m?i quan h?">
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
                { required: true, message: 'Vui lòng nh?p email' },
                { type: 'email', message: 'Email không h?p l?' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nh?p email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="S? di?n tho?i"
              rules={[
                { required: true, message: 'Vui lòng nh?p s? di?n tho?i' },
                { pattern: /^[0-9+\-\s()]+$/, message: 'S? di?n tho?i không h?p l?' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nh?p s? di?n tho?i" />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <Form.Item
            name="password"
            label="M?t kh?u"
            rules={[
              { required: true, message: 'Vui lòng nh?p m?t kh?u' },
              { min: 6, message: 'M?t kh?u ph?i có ít nh?t 6 ký t?' },
            ]}
          >
            <Input.Password placeholder="Nh?p m?t kh?u" />
          </Form.Item>
        )}

        <Form.Item
          name="address"
          label="Ð?a ch?"
        >
          <Input.TextArea 
            placeholder="Nh?p d?a ch? (tùy ch?n)" 
            rows={2}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isPrimary"
              label="Ngu?i liên h? chính"
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
                label="Tr?ng thái"
              >
                <Select>
                  <Select.Option value="Active">Ho?t d?ng</Select.Option>
                  <Select.Option value="Inactive">Không ho?t d?ng</Select.Option>
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
            placeholder="Ghi chú thêm v? ngu?i thân (tùy ch?n)" 
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FamilyMemberModal;
