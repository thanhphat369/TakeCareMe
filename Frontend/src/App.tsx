import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  LogoutOutlined,
  FileTextOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ElderlyManagement from './components/ElderlyManagement';
import Calendar from './components/Calendar';
import CareSchedules from './components/CareSchedules';
import CareEvents from './components/CareEvents';
import HealthRecords from './components/HealthRecords';
import Reports from './components/Reports';
import Settings from './components/Settings';
import MedicationManagement from './components/MedicationManagement';
import AlertsManagement from './components/AlertsManagement';
import StaffManagement from './components/StaffManagement';
import PaymentManagement from './components/PaymentManagement';
import VitalSignsMonitor from './components/VitalSignsMonitor';
// import ActivateAccount from './components/ActivateAccount';

const { Header, Sider, Content } = Layout;

// Định nghĩa các vai trò người dùng (khớp với backend)
export type UserRole = 'SuperAdmin' | 'Admin' | 'Doctor' | 'Staff' | 'Family' | 'Elder';


export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  permissions?: string[];
}

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem('accessToken'));
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  // const [showActivate, setShowActivate] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, [authed]);

  // Menu items dựa trên vai trò người dùng
  const getMenuItems = (userRole: UserRole) => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff', 'Family']
      },
      {
        key: 'elderly',
        icon: <UserOutlined />,
        label: 'Quản lý người cao tuổi',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff']
      },
      {
        key: 'staff',
        icon: <TeamOutlined />,
        label: 'Quản lý nhân viên',
        roles: ['SuperAdmin', 'Admin']
      },
      {
        key: 'calendar',
        icon: <CalendarOutlined />,
        label: 'Lịch chăm sóc',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff']
      },
      {
        key: 'care_schedules',
        icon: <CalendarOutlined />,
        label: 'Kế hoạch chăm sóc',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff']
      },
      {
        key: 'care_events',
        icon: <CalendarOutlined />,
        label: 'Nhật ký chăm sóc',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff']
      },
      {
        key: 'health',
        icon: <HeartOutlined />,
        label: 'Theo dõi sức khỏe',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff', 'Family']
      },
      {
        key: 'vitals',
        icon: <MobileOutlined />,
        label: 'Sinh hiệu real-time',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff']
      },
      {
        key: 'medications',
        icon: <MedicineBoxOutlined />,
        label: 'Quản lý thuốc',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff']
      },
      {
        key: 'alerts',
        icon: <BellOutlined />,
        label: 'Cảnh báo khẩn cấp',
        roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff', 'Family']
      },
      {
        key: 'payments',
        icon: <FileTextOutlined />,
        label: 'Quản lý thanh toán',
        roles: ['SuperAdmin', 'Admin']
      },
      {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: 'Báo cáo',
        roles: ['SuperAdmin', 'Admin', 'Doctor']
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Cài đặt',
        roles: ['SuperAdmin', 'Admin']
      },
    ];

    return baseItems.filter(item => item.roles.includes(userRole));
  };

  const menuItems = currentUser ? getMenuItems(currentUser.role) : [];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'elderly':
        return <ElderlyManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'calendar':
        return <Calendar />;
      case 'care_schedules':
        return <CareSchedules />;
      case 'care_events':
        return <CareEvents />;
      case 'health':
        return <HealthRecords />;
      case 'vitals':
        return <VitalSignsMonitor />;
      case 'medications':
        return <MedicationManagement />;
      case 'alerts':
        return <AlertsManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    setAuthed(false);
    setCurrentUser(null);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  if (!authed) {
  //   if (showActivate) {
  //   return (
  //     <ActivateAccount
  //       onActivated={() => {
  //         setShowActivate(false);
  //       }}
  //       onBackToLogin={() => setShowActivate(false)}
  //     />
  //   );
  // }
    if (showRegister) {
      return (
        <Register 
          onSuccess={() => setAuthed(true)}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login 
        onSuccess={() => setAuthed(true)} 
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
        }}
      >
        <div className="p-4 text-center">
          <h2 className={`text-primary-600 font-bold ${collapsed ? 'text-sm' : 'text-lg'}`}>
            {collapsed ? 'ECM' : 'Elderly Care'}
          </h2>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: 0, 
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="flex items-center">
            <button
              className="text-lg ml-2 sm:ml-4 p-2 hover:bg-gray-100 rounded"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '☰' : '✕'}
            </button>
            <div className="text-sm sm:text-lg font-semibold text-gray-700 ml-2 sm:ml-4">
              <span className="hidden sm:inline">Take Care Me (TCM) - Hệ thống chăm sóc người cao tuổi</span>
              <span className="sm:hidden">TCM</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Thông báo */}
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              className="text-gray-600 hover:text-blue-600"
              size="small"
            />
            
            {/* User info */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:bg-gray-50 px-2 sm:px-3 py-2 rounded">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  src={currentUser?.avatar}
                />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-700">
                    {currentUser?.fullName || 'Người dùng'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.role === 'SuperAdmin' && 'Super Admin'}
                    {currentUser?.role === 'Admin' && 'Quản lý'}
                    {currentUser?.role === 'Doctor' && 'Bác sĩ'}
                    {currentUser?.role === 'Staff' && 'Nhân viên'}
                    {currentUser?.role === 'Family' && 'Người thân'}
                    {currentUser?.role === 'Elder' && 'Người cao tuổi'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '16px 8px',
            padding: '16px',
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="sm:mx-4 sm:my-6 sm:p-6"
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;