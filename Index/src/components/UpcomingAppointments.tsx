import React from 'react';
import { List, Avatar, Tag, Button, Space } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { mockAppointments, mockElderly, mockCaregivers } from '../data/mockData';

const UpcomingAppointments: React.FC = () => {
  const upcomingAppointments = mockAppointments
    .filter(apt => new Date(apt.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'checkup':
        return <HeartOutlined className="text-blue-500" />;
      case 'medication':
        return <MedicineBoxOutlined className="text-green-500" />;
      case 'exercise':
        return <TeamOutlined className="text-orange-500" />;
      case 'social':
        return <UserOutlined className="text-purple-500" />;
      case 'emergency':
        return <ClockCircleOutlined className="text-red-500" />;
      default:
        return <CalendarOutlined className="text-gray-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'Khám sức khỏe';
      case 'medication':
        return 'Uống thuốc';
      case 'exercise':
        return 'Tập thể dục';
      case 'social':
        return 'Hoạt động xã hội';
      case 'emergency':
        return 'Khẩn cấp';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'in-progress':
        return 'orange';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    const diffTime = appointmentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hôm nay ${appointmentDate.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Ngày mai ${appointmentDate.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return appointmentDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="h-96 overflow-y-auto">
      <List
        dataSource={upcomingAppointments}
        renderItem={(appointment) => {
          const elderly = mockElderly.find(e => e.id === appointment.elderlyId);
          const caregiver = mockCaregivers.find(c => c.id === appointment.caregiverId);
          
          return (
            <List.Item
              actions={[
                <Button type="link" size="small">
                  Xem chi tiết
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={getAppointmentIcon(appointment.type)}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{appointment.title}</span>
                    <Tag color={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Tag>
                  </div>
                }
                description={
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      <UserOutlined className="mr-1" />
                      {elderly?.name} - {caregiver?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      <ClockCircleOutlined className="mr-1" />
                      {formatDateTime(appointment.start)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getTypeText(appointment.type)} • {appointment.location}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default UpcomingAppointments;
