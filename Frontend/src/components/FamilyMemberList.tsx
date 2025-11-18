import React, { useState } from 'react';
import { Card, List, Avatar, Button, Tag, Popconfirm, message, Empty, Row, Col, Statistic } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CrownOutlined,
  HomeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { FamilyMember } from '../types/family-member';

interface FamilyMemberListProps {
  familyMembers: FamilyMember[];
  onAdd: () => void;
  onEdit: (familyMember: FamilyMember) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const FamilyMemberList: React.FC<FamilyMemberListProps> = ({
  familyMembers,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
      message.success('Xóa nguời thân thành công');
    } catch (error: any) {
      message.error(error.message || 'Xóa thát bại');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'green' : 'red';
  };

  const getStatusText = (status: string) => {
    return status === 'Active' ? 'Hoạt dộng' : 'Không hoạt động';
  };

  const getRelationshipColor = (relationship: string) => {
    const colors: { [key: string]: string } = {
      'Con trai': 'blue',
      'Con gái': 'pink',
      'Con dâu': 'purple',
      'Con rể': 'cyan',
      'Cháu trai': 'orange',
      'Cháu gái': 'magenta',
      'Anh/Chị': 'green',
      'Em trai/Em gái': 'lime',
      'Cháu nội': 'gold',
      'Cháu ngoọi': 'volcano',
      'Nguời giám hộ': 'red',
      'Khác': 'default',
    };
    return colors[relationship] || 'default';
  };

  const primaryMember = familyMembers.find(member => member.isPrimary);
  const activeMembers = familyMembers.filter(member => member.family.status === 'Active');

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Tổng số nguời thân"
              value={familyMembers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Đang hoạt dộng"
              value={activeMembers.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Nguời liên hệ chính"
              value={primaryMember ? 1 : 0}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onAdd}
          className="mb-4"
        >
          Thêm nguời thân
        </Button>
      </div>

      {/* Family Members List */}
      {familyMembers.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chua có nguời thân nào"
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Thêm nguời thân đầu tiên
          </Button>
        </Empty>
      ) : (
        <List
          loading={loading}
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={familyMembers}
          renderItem={(member) => (
            <List.Item>
              <Card
                size="small"
                className="h-full"
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(member)}
                  >
                    Chỉnh sửa
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Xác nhận xóa"
                    description="Bạnn có chắc chắn muốn xóa nguời thân này?"
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    onConfirm={() => handleDelete(String(member.familyId))}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deletingId === String(member.familyId)}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="text-center mb-4">
                  <Avatar
                    size={64}
                    src={member.family.avatar}
                    icon={<UserOutlined />}
                    className="mb-2"
                  />
                  <div className="font-medium text-lg">{member.family.fullName}</div>
                  <div className="flex justify-center items-center gap-2 mt-1">
                    <Tag color={getRelationshipColor(member.relationship)}>
                      {member.relationship}
                    </Tag>
                    {member.isPrimary && (
                      <Tag color="red" icon={<CrownOutlined />}>
                        Liên hệ chính
                      </Tag>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MailOutlined className="mr-2 text-gray-500" />
                    <span className="truncate">{member.family.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <PhoneOutlined className="mr-2 text-gray-500" />
                    <span>{member.family.phone}</span>
                  </div>
                  
                  {member.family.address && (
                    <div className="flex items-start text-sm">
                      <HomeOutlined className="mr-2 text-gray-500 mt-0.5" />
                      <span className="truncate">{member.family.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Tag color={getStatusColor(member.family.status)}>
                      {getStatusText(member.family.status)}
                    </Tag>
                    <span className="text-xs text-gray-500">
                      {new Date(member.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FamilyMemberList;
