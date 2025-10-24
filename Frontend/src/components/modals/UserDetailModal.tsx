import React from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Avatar, Timeline, Button, Space, Divider } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CrownOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  HomeOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { User } from '../../types';

interface UserDetailModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  user,
  onClose,
}) => {
  if (!user) return null;

  const getRoleInfo = (role: string) => {
    const roleMap: { [key: string]: { label: string; color: string; icon: any; description: string } } = {
      'SuperAdmin': {
        label: 'Super Admin',
        color: 'red',
        icon: <CrownOutlined />,
        description: 'Quản lý toàn bộ hệ thống, cấu hình, phân quyền, báo cáo toàn trung tâm'
      },
      'Admin': {
        label: 'Quản lý',
        color: 'blue',
        icon: <TeamOutlined />,
        description: 'Quản lý nhân viên, lịch, hồ sơ, báo cáo'
      },
      'Doctor': {
        label: 'Bác sĩ',
        color: 'green',
        icon: <MedicineBoxOutlined />,
        description: 'Truy cập hồ sơ y tế, kê đơn, chỉ định điều trị'
      },
      'Staff': {
        label: 'Nhân viên chăm sóc',
        color: 'orange',
        icon: <HeartOutlined />,
        description: 'Nhập sinh hiệu, thực hiện chăm sóc, ghi nhật ký, báo cáo sự cố'
      },
      'Family': {
        label: 'Người thân',
        color: 'purple',
        icon: <HomeOutlined />,
        description: 'Xem báo cáo, nhận cảnh báo, tương tác'
      },
      'Elder': {
        label: 'Người cao tuổi',
        color: 'cyan',
        icon: <UserOutlined />,
        description: 'Nhắc uống thuốc, thông báo, gọi trợ giúp'
      }
    };
    return roleMap[role] || roleMap['Elder'];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Inactive': return 'orange';
      case 'Banned': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Hoạt động';
      case 'Inactive': return 'Không hoạt động';
      case 'Banned': return 'Bị khóa';
      default: return status;
    }
  };

  const roleInfo = getRoleInfo(user.role);

  return (
    <Modal
      title={
        <div className="flex items-center">
          <Avatar size={40} src={user.avatar} icon={<UserOutlined />} className="mr-3" />
          <div>
            <div className="text-lg font-medium">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />}>
          Chỉnh sửa
        </Button>,
      ]}
      width={800}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Họ và tên">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    {user.fullName}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <div className="flex items-center">
                    <MailOutlined className="mr-2 text-gray-500" />
                    {user.email}
                  </div>
                </Descriptions.Item>
                {user.phone && (
                  <Descriptions.Item label="Số điện thoại">
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2 text-gray-500" />
                      {user.phone}
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Vai trò">
                  <Tag color={roleInfo.color} icon={roleInfo.icon}>
                    {roleInfo.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(user.status)}>
                    {getStatusText(user.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ID người dùng">
                  #{user.userId}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Role Information */}
        <Card title="Thông tin vai trò" size="small">
          <div className="space-y-3">
            <div>
              <div className="font-medium text-lg">{roleInfo.label}</div>
              <div className="text-gray-600">{roleInfo.description}</div>
            </div>
            
            {user.roleData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Chi tiết vai trò:</h4>
                <Row gutter={16}>
                  {user.roleData.roleTitle && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Chức danh:</strong> {user.roleData.roleTitle}
                      </div>
                    </Col>
                  )}
                  {user.roleData.licenseNo && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Số chứng chỉ:</strong> {user.roleData.licenseNo}
                      </div>
                    </Col>
                  )}
                  {user.roleData.department && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Phòng ban:</strong> {user.roleData.department}
                      </div>
                    </Col>
                  )}
                  {user.roleData.experienceYears && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Kinh nghiệm:</strong> {user.roleData.experienceYears} năm
                      </div>
                    </Col>
                  )}
                  {user.roleData.skills && (
                    <Col span={24}>
                      <div className="text-sm">
                        <strong>Kỹ năng:</strong> {user.roleData.skills}
                      </div>
                    </Col>
                  )}
                  {user.roleData.relationship && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Mối quan hệ:</strong> {user.roleData.relationship}
                      </div>
                    </Col>
                  )}
                  {user.roleData.isPrimary && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Liên hệ chính:</strong> 
                        <Tag color="red" className="ml-1">Có</Tag>
                      </div>
                    </Col>
                  )}
                  {user.roleData.age && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Tuổi:</strong> {user.roleData.age}
                      </div>
                    </Col>
                  )}
                  {user.roleData.gender && (
                    <Col span={12}>
                      <div className="text-sm">
                        <strong>Giới tính:</strong> {user.roleData.gender === 'M' ? 'Nam' : 'Nữ'}
                      </div>
                    </Col>
                  )}
                  {user.roleData.address && (
                    <Col span={24}>
                      <div className="text-sm">
                        <strong>Địa chỉ:</strong> {user.roleData.address}
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            )}
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card title="Lịch sử hoạt động" size="small">
          <Timeline>
            <Timeline.Item 
              dot={<CalendarOutlined className="text-blue-500" />} 
              color="blue"
            >
              <div>
                <div className="font-medium">Tài khoản được tạo</div>
                <div className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </Timeline.Item>
            
            {user.lastLogin && (
              <Timeline.Item 
                dot={<UserOutlined className="text-green-500" />} 
                color="green"
              >
                <div>
                  <div className="font-medium">Lần đăng nhập cuối</div>
                  <div className="text-sm text-gray-600">
                    {new Date(user.lastLogin).toLocaleString('vi-VN')}
                  </div>
                </div>
              </Timeline.Item>
            )}
            
            <Timeline.Item 
              dot={<CalendarOutlined className="text-orange-500" />} 
              color="orange"
            >
              <div>
                <div className="font-medium">Cập nhật lần cuối</div>
                <div className="text-sm text-gray-600">
                  {new Date(user.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </Timeline.Item>
          </Timeline>
        </Card>

        {/* Notes */}
        {user.notes && (
          <Card title="Ghi chú" size="small">
            <div className="text-gray-700">{user.notes}</div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;
