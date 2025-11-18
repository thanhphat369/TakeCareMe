import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Avatar, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  message,
  Tooltip,
  Badge,
  Dropdown,
  Menu,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  HomeOutlined,
  UserAddOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { User, UserStats, UserRole } from '../types';
import { getUsers, getUserStats, createUser, updateUser, deleteUser, banUser, unbanUser } from '../api/users';
import UserDetailModal from './modals/UserDetailModal';
import UserFormModal from './modals/UserFormModal';
import RolePermissions from './RolePermissions';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Modal states
  const [userDetailModalVisible, setUserDetailModalVisible] = useState(false);
  const [userFormModalVisible, setUserFormModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);

  // Role definitions with permissions
  const roleDefinitions: UserRole[] = [
    {
      role: 'SuperAdmin',
      label: 'Super Admin',
      description: 'Quản lý toàn bộ hệ thống, cấu hình, phân quyền, báo cáo toàn trung tâm',
      permissions: ['system_config', 'user_management', 'role_management', 'reports_all', 'data_export'],
      color: 'red',
      icon: 'CrownOutlined'
    },
    {
      role: 'Admin',
      label: 'Quản lý',
      description: 'Quản lý nhân viên, lịch, hồ sơ, báo cáo',
      permissions: ['staff_management', 'schedule_management', 'records_management', 'reports_department'],
      color: 'blue',
      icon: 'TeamOutlined'
    },
    {
      role: 'Doctor',
      label: 'Bác sĩ',
      description: 'Truy cập hồ sơ y tế, kê đơn, chỉ định điều trị',
      permissions: ['medical_records', 'treatment_plan', 'patient_consultation'],
      color: 'green',
      icon: 'MedicineBoxOutlined'
    },
    {
      role: 'Staff',
      label: 'Nhân viên chăm sóc',
      description: 'Nhập sinh hiệu, thực hiện chăm sóc, ghi nhật ký, báo cáo sự cố',
      permissions: ['vital_signs', 'care_logs', 'incident_reports', 'mobile_access'],
      color: 'orange',
      icon: 'HeartOutlined'
    },
    {
      role: 'Family',
      label: 'Người thân',
      description: 'Xem báo cáo, nhận cảnh báo, tương tác',
      permissions: ['view_reports', 'receive_alerts', 'interaction', 'mobile_web_access'],
      color: 'purple',
      icon: 'HomeOutlined'
    },
    {
      role: 'Elder',
      label: 'Người cao tuổi',
      description: 'Nhắc uống thuốc, thông báo, gọi trợ giúp',
      permissions: ['medication_reminders', 'notifications', 'emergency_call', 'simple_interface'],
      color: 'cyan',
      icon: 'UserOutlined'
    }
  ];

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchText, roleFilter, statusFilter, dateRange]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error: any) {
      console.error('Error loading user stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.includes(searchText)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= startDate.startOf('day').toDate() && 
               userDate <= endDate.endOf('day').toDate();
      });
    }

    setFilteredUsers(filtered);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDetailModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormModalVisible(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormModalVisible(true);
  };

  // Helper function to get user ID (prefer userId, fallback to id)
  const getUserIdentifier = (user: User): string => {
    if (user.userId !== undefined && user.userId !== null) {
      return String(user.userId);
    }
    if (user.id !== undefined && user.id !== null) {
      return String(user.id);
    }
    throw new Error('User ID không hợp lệ');
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const userId = getUserIdentifier(user);
      await deleteUser(userId);
      message.success('Xóa người dùng thành công');
      loadUsers();
      loadUserStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Xóa người dùng thất bại';
      message.error(errorMessage);
    }
  };

  const handleBanUser = async (user: User) => {
    try {
      const userId = getUserIdentifier(user);
      await banUser(userId);
      message.success('Khóa tài khoản thành công');
      loadUsers();
      loadUserStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Khóa tài khoản thất bại';
      message.error(errorMessage);
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      const userId = getUserIdentifier(user);
      await unbanUser(userId);
      message.success('Mở khóa tài khoản thành công');
      loadUsers();
      loadUserStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Mở khóa tài khoản thất bại';
      message.error(errorMessage);
    }
  };

  const getRoleInfo = (role: string) => {
    return roleDefinitions.find(r => r.role === role) || roleDefinitions[0];
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

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      render: (record: User) => (
        <div className="flex items-center">
          <Avatar 
            size={40} 
            src={record.avatar} 
            icon={<UserOutlined />}
            className="mr-3"
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
            {record.phone && (
              <div className="text-sm text-gray-500">{record.phone}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      key: 'role',
      width: 150,
      render: (record: User) => {
        const roleInfo = getRoleInfo(record.role);
        return (
          <Tag color={roleInfo.color} icon={<CrownOutlined />}>
            {roleInfo.label}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (record: User) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: 'Lần đăng nhập cuối',
      key: 'lastLogin',
      width: 150,
      render: (record: User) => (
        <div className="text-sm">
          {record.lastLogin 
            ? new Date(record.lastLogin).toLocaleDateString('vi-VN')
            : 'Chưa đăng nhập'
          }
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      width: 120,
      render: (record: User) => (
        <div className="text-sm">
          {new Date(record.createdAt).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (record: User) => {
        const menu = (
          <Menu>
            <Menu.Item 
              key="view" 
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record)}
            >
              Xem chi tiết
            </Menu.Item>
            <Menu.Item 
              key="edit" 
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            >
              Chỉnh sửa
            </Menu.Item>
            <Menu.Divider />
            {record.status === 'Banned' ? (
              <Menu.Item 
                key="unban" 
                icon={<UnlockOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Mở khóa tài khoản',
                    content: `Bạn có chắc muốn mở khóa tài khoản của ${record.fullName}?`,
                    okText: 'Mở khóa',
                    cancelText: 'Hủy',
                    onOk: () => handleUnbanUser(record),
                  });
                }}
              >
                Mở khóa
              </Menu.Item>
            ) : (
              <Menu.Item 
                key="ban" 
                icon={<LockOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Khóa tài khoản',
                    content: `Bạn có chắc muốn khóa tài khoản của ${record.fullName}?`,
                    okText: 'Khóa',
                    cancelText: 'Hủy',
                    okType: 'danger',
                    onOk: () => handleBanUser(record),
                  });
                }}
              >
                Khóa tài khoản
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item 
              key="delete" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Xóa người dùng',
                  content: `Bạn có chắc muốn xóa người dùng ${record.fullName}? Hành động này không thể hoàn tác!`,
                  okText: 'Xóa',
                  cancelText: 'Hủy',
                  okType: 'danger',
                  onOk: () => handleDeleteUser(record),
                });
              }}
            >
              Xóa
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddUser}
        >
          Thêm người dùng
        </Button>
      </div>

      {/* Statistics */}
      {userStats && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng người dùng"
                value={userStats.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang hoạt động"
                value={userStats.activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Không hoạt động"
                value={userStats.inactiveUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Bị khóa"
                value={userStats.bannedUsers}
                prefix={<LockOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Tìm kiếm theo tên, email, SĐT"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Vai trò"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả vai trò</Option>
              {roleDefinitions.map(role => (
                <Option key={role.role} value={role.role}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Không hoạt động</Option>
              <Option value="Banned">Bị khóa</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  loadUsers();
                  loadUserStats();
                }}
              >
                Làm mới
              </Button>
              <Button 
                onClick={() => {
                  setSearchText('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setDateRange(null);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Hiển thị ${range[0]}-${range[1]} của ${total} người dùng`,
          }}
        />
      </Card>

      {/* Modals */}
      <UserDetailModal
        visible={userDetailModalVisible}
        user={selectedUser}
        onClose={() => setUserDetailModalVisible(false)}
      />

      <UserFormModal
        visible={userFormModalVisible}
        user={selectedUser}
        onClose={() => setUserFormModalVisible(false)}
        onSave={() => {
          setUserFormModalVisible(false);
          loadUsers();
          loadUserStats();
        }}
      />
    </div>
  );
};

export default UserManagement;
