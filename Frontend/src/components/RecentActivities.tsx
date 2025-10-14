import React from 'react';
import { List, Avatar, Tag, Timeline } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const RecentActivities: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'health',
      title: 'Cập nhật hồ sơ sức khỏe',
      description: 'Nguyễn Văn An - Huyết áp: 140/90 mmHg',
      time: '2 giờ trước',
      icon: <HeartOutlined className="text-red-500" />,
      color: 'red',
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Cuộc hẹn hoàn thành',
      description: 'Khám sức khỏe định kỳ - Trần Thị Bình',
      time: '4 giờ trước',
      icon: <CalendarOutlined className="text-green-500" />,
      color: 'green',
    },
    {
      id: 3,
      type: 'medication',
      title: 'Nhắc nhở uống thuốc',
      description: 'Lê Văn Cường - Aspirin 100mg',
      time: '6 giờ trước',
      icon: <MedicineBoxOutlined className="text-blue-500" />,
      color: 'blue',
    },
    {
      id: 4,
      type: 'alert',
      title: 'Cảnh báo sức khỏe',
      description: 'Trần Thị Bình - Cần theo dõi đặc biệt',
      time: '8 giờ trước',
      icon: <ExclamationCircleOutlined className="text-orange-500" />,
      color: 'orange',
    },
    {
      id: 5,
      type: 'user',
      title: 'Thêm người cao tuổi mới',
      description: 'Phạm Thị Dung (72 tuổi) đã được thêm vào hệ thống',
      time: '1 ngày trước',
      icon: <UserOutlined className="text-purple-500" />,
      color: 'purple',
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'health':
        return 'red';
      case 'appointment':
        return 'green';
      case 'medication':
        return 'blue';
      case 'alert':
        return 'orange';
      case 'user':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div className="h-96 overflow-y-auto">
      <Timeline>
        {activities.map((activity) => (
          <Timeline.Item
            key={activity.id}
            dot={activity.icon}
            color={getActivityColor(activity.type)}
          >
            <div className="space-y-1">
              <div className="font-medium text-sm">{activity.title}</div>
              <div className="text-xs text-gray-600">{activity.description}</div>
              <div className="text-xs text-gray-400">{activity.time}</div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default RecentActivities;
