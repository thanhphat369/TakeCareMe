import React from 'react';
import { Card, Row, Col, Tag, List, Typography, Divider } from 'antd';
import {
  CrownOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  HomeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface RolePermissionsProps {
  selectedRole?: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ selectedRole }) => {
  const rolePermissions = {
    SuperAdmin: {
      title: 'Super Admin',
      description: 'Quản lý toàn bộ hệ thống, cấu hình, phân quyền, báo cáo toàn trung tâm',
      color: 'red',
      icon: <CrownOutlined />,
      permissions: [
        { name: 'Cấu hình hệ thống', description: 'Thiết lập tham số hệ thống, cấu hình chung' },
        { name: 'Quản lý người dùng', description: 'Tạo, sửa, xóa tài khoản người dùng' },
        { name: 'Phân quyền', description: 'Gán và quản lý quyền hạn cho các vai trò' },
        { name: 'Báo cáo toàn trung tâm', description: 'Xem và xuất báo cáo tổng hợp' },
        { name: 'Xuất dữ liệu', description: 'Xuất dữ liệu hệ thống ra file' },
        { name: 'Quản lý backup', description: 'Sao lưu và khôi phục dữ liệu' },
      ]
    },
    Admin: {
      title: 'Quản lý',
      description: 'Quản lý nhân viên, lịch, hồ sơ, báo cáo',
      color: 'blue',
      icon: <TeamOutlined />,
      permissions: [
        { name: 'Quản lý nhân viên', description: 'Thêm, sửa, xóa thông tin nhân viên' },
        { name: 'Quản lý lịch', description: 'Tạo và quản lý lịch làm việc, ca trực' },
        { name: 'Quản lý hồ sơ', description: 'Xem và quản lý hồ sơ bệnh nhân' },
        { name: 'Báo cáo phòng ban', description: 'Xem báo cáo của phòng ban' },
        { name: 'Phân công công việc', description: 'Giao việc cho nhân viên' },
        { name: 'Quản lý thiết bị', description: 'Theo dõi và quản lý thiết bị y tế' },
      ]
    },
    Doctor: {
      title: 'Bác sĩ',
      description: 'Truy cập hồ sơ y tế, kê đơn, chỉ định điều trị',
      color: 'green',
      icon: <MedicineBoxOutlined />,
      permissions: [
        { name: 'Truy cập hồ sơ y tế', description: 'Xem chi tiết hồ sơ bệnh nhân' },
        { name: 'Kê đơn thuốc', description: 'Tạo và quản lý đơn thuốc' },
        { name: 'Chỉ định điều trị', description: 'Lập kế hoạch điều trị cho bệnh nhân' },
        { name: 'Tư vấn bệnh nhân', description: 'Tư vấn và trao đổi với bệnh nhân' },
        { name: 'Xem kết quả xét nghiệm', description: 'Truy cập kết quả xét nghiệm' },
        { name: 'Ghi chú y tế', description: 'Ghi chú và cập nhật tình trạng bệnh' },
      ]
    },
    Staff: {
      title: 'Nhân viên chăm sóc',
      description: 'Nhập sinh hiệu, thực hiện chăm sóc, ghi nhật ký, báo cáo sự cố',
      color: 'orange',
      icon: <HeartOutlined />,
      permissions: [
        { name: 'Nhập sinh hiệu', description: 'Ghi nhận các chỉ số sinh hiệu bệnh nhân' },
        { name: 'Thực hiện chăm sóc', description: 'Thực hiện các hoạt động chăm sóc hàng ngày' },
        { name: 'Ghi nhật ký', description: 'Ghi chép nhật ký chăm sóc bệnh nhân' },
        { name: 'Báo cáo sự cố', description: 'Báo cáo các sự cố và tình huống bất thường' },
        { name: 'Truy cập mobile', description: 'Sử dụng ứng dụng di động để làm việc' },
        { name: 'Quản lý lịch cá nhân', description: 'Xem và cập nhật lịch làm việc' },
      ]
    },
    Family: {
      title: 'Người thân',
      description: 'Xem báo cáo, nhận cảnh báo, tương tác',
      color: 'purple',
      icon: <HomeOutlined />,
      permissions: [
        { name: 'Xem báo cáo', description: 'Xem báo cáo sức khỏe của người thân' },
        { name: 'Nhận cảnh báo', description: 'Nhận thông báo về tình trạng sức khỏe' },
        { name: 'Tương tác', description: 'Liên lạc và tương tác với nhân viên y tế' },
        { name: 'Truy cập mobile/web', description: 'Sử dụng ứng dụng di động hoặc web' },
        { name: 'Xem lịch khám', description: 'Xem lịch khám và hẹn của người thân' },
        { name: 'Cập nhật thông tin', description: 'Cập nhật thông tin liên hệ' },
      ]
    },
    Elder: {
      title: 'Người cao tuổi',
      description: 'Nhắc uống thuốc, thông báo, gọi trợ giúp',
      color: 'cyan',
      icon: <UserOutlined />,
      permissions: [
        { name: 'Nhắc uống thuốc', description: 'Nhận thông báo nhắc uống thuốc đúng giờ' },
        { name: 'Thông báo', description: 'Nhận thông báo về lịch khám, hoạt động' },
        { name: 'Gọi trợ giúp', description: 'Gọi trợ giúp khẩn cấp khi cần thiết' },
        { name: 'Giao diện đơn giản', description: 'Sử dụng giao diện đơn giản, dễ sử dụng' },
        { name: 'Xem thông tin cá nhân', description: 'Xem thông tin sức khỏe cơ bản' },
        { name: 'Liên lạc gia đình', description: 'Liên lạc với người thân' },
      ]
    }
  };

  const getRoleData = (role: string) => {
    return rolePermissions[role as keyof typeof rolePermissions] || rolePermissions.Elder;
  };

  const allRoles = Object.keys(rolePermissions);

  return (
    <div className="space-y-6">
      <Title level={3}>Quyền hạn theo vai trò</Title>
      
      {selectedRole ? (
        // Show specific role permissions
        <Card>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">
              {getRoleData(selectedRole).icon}
            </div>
            <Title level={2} style={{ color: getRoleData(selectedRole).color }}>
              {getRoleData(selectedRole).title}
            </Title>
            <Text type="secondary" className="text-lg">
              {getRoleData(selectedRole).description}
            </Text>
          </div>
          
          <Divider />
          
          <List
            dataSource={getRoleData(selectedRole).permissions}
            renderItem={(permission) => (
              <List.Item>
                <div className="flex items-start w-full">
                  <CheckCircleOutlined className="text-green-500 mr-3 mt-1" />
                  <div>
                    <div className="font-medium text-lg">{permission.name}</div>
                    <div className="text-gray-600">{permission.description}</div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      ) : (
        // Show all roles comparison
        <Row gutter={[16, 16]}>
          {allRoles.map((role) => {
            const roleData = getRoleData(role);
            return (
              <Col span={8} key={role}>
                <Card 
                  hoverable
                  className="h-full"
                  style={{ borderColor: roleData.color }}
                >
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2" style={{ color: roleData.color }}>
                      {roleData.icon}
                    </div>
                    <Title level={4} style={{ color: roleData.color }}>
                      {roleData.title}
                    </Title>
                    <Text type="secondary" className="text-sm">
                      {roleData.description}
                    </Text>
                  </div>
                  
                  <List
                    size="small"
                    dataSource={roleData.permissions.slice(0, 3)}
                    renderItem={(permission) => (
                      <List.Item className="py-1">
                        <div className="flex items-center">
                          <CheckCircleOutlined className="text-green-500 mr-2" />
                          <Text className="text-sm">{permission.name}</Text>
                        </div>
                      </List.Item>
                    )}
                  />
                  
                  {roleData.permissions.length > 3 && (
                    <div className="text-center mt-2">
                      <Text type="secondary" className="text-xs">
                        +{roleData.permissions.length - 3} quyền khác
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default RolePermissions;
