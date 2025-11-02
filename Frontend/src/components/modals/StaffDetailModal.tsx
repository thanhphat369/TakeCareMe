import React from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Statistic, Timeline } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { Staff } from '../../types';
import dayjs from 'dayjs';

interface StaffDetailModalProps {
  visible: boolean;
  staff: Staff | null;
  onClose: () => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  visible,
  staff,
  onClose,
}) => {
  if (!staff) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Inactive':
        return 'red';
      case 'OnLeave':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Đang làm việc';
      case 'Inactive':
        return 'Nghỉ việc';
      case 'OnLeave':
        return 'Nghỉ phép';
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    return role === 'Doctor' ? 'Bác sĩ' : 'Điều dưỡng';
  };

  const getShiftText = (shift: string) => {
    const shiftMap: Record<string, string> = {
      morning: 'Ca sáng',
      afternoon: 'Ca chiều',
      night: 'Ca đêm',
      flexible: 'Linh hoạt',
    };
    return shiftMap[shift] || shift;
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          <span>Thông tin chi tiết - {staff.fullName}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Họ và tên" span={2}>
              <strong>{staff.fullName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={staff.role === 'Doctor' ? 'blue' : 'green'}>
                {getRoleText(staff.role)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chức danh">
              <strong>{staff.roleTitle}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined className="mr-2" />
              {staff.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined className="mr-2" />
              {staff.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Khoa/Phòng">
              <SafetyOutlined className="mr-2" />
              {staff.department}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(staff.status)}>
                {getStatusText(staff.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Work Information */}
        <Card title={<><ClockCircleOutlined className="mr-2" />Thông tin công việc</>}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Ca làm việc"
                value={getShiftText(staff.shift)}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Kinh nghiệm"
                value={staff.experienceYears}
                suffix="năm"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Ngày tuyển dụng"
                value={
                  staff.hireDate
                    ? dayjs(staff.hireDate).format('DD/MM/YYYY')
                    : 'Chưa cập nhật'
                }
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* Professional Information */}
        <Card title={<><BookOutlined className="mr-2" />Thông tin chuyên môn</>}>
          <Row gutter={16}>
            <Col span={24}>
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">
                  <IdcardOutlined className="mr-2" />
                  Số chứng chỉ hành nghề
                </h4>
                <div className="text-gray-800">
                  {staff.licenseNo || <span className="text-gray-400">Chưa cập nhật</span>}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">
                  <BookOutlined className="mr-2" />
                  Bằng cấp
                </h4>
                <div className="text-gray-800">
                  {staff.education || <span className="text-gray-400">Chưa cập nhật</span>}
                </div>
              </div>

              {staff.skills && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">
                    <MedicineBoxOutlined className="mr-2" />
                    Kỹ năng & Chuyên môn
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{staff.skills}</p>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* Notes */}
        {staff.notes && (
          <Card title="Ghi chú">
            <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
              {staff.notes}
            </div>
          </Card>
        )}

        {/* Timeline */}
        <Card title="Lịch sử hoạt động">
          <Timeline>
            {staff.hireDate && (
              <Timeline.Item
                dot={<CalendarOutlined className="text-blue-500" />}
                color="blue"
              >
                <div>
                  <div className="font-medium">Ngày tuyển dụng</div>
                  <div className="text-sm text-gray-600">
                    {dayjs(staff.hireDate).format('DD/MM/YYYY')}
                  </div>
                </div>
              </Timeline.Item>
            )}
            <Timeline.Item
              dot={<UserOutlined className="text-green-500" />}
              color="green"
            >
              <div>
                <div className="font-medium">Trạng thái hiện tại</div>
                <div className="text-sm text-gray-600">
                  <Tag color={getStatusColor(staff.status)}>
                    {getStatusText(staff.status)}
                  </Tag>
                </div>
              </div>
            </Timeline.Item>
            {staff.createdAt && (
              <Timeline.Item
                dot={<UserOutlined className="text-purple-500" />}
                color="purple"
              >
                <div>
                  <div className="font-medium">Thêm vào hệ thống</div>
                  <div className="text-sm text-gray-600">
                    {dayjs(staff.createdAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </Timeline.Item>
            )}
            {staff.updatedAt && (
              <Timeline.Item
                dot={<ClockCircleOutlined className="text-orange-500" />}
                color="orange"
              >
                <div>
                  <div className="font-medium">Cập nhật lần cuối</div>
                  <div className="text-sm text-gray-600">
                    {dayjs(staff.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </Timeline.Item>
            )}
          </Timeline>
        </Card>

        {/* Statistics Summary */}
        <Card title="Tóm tắt">
          <Row gutter={16}>
            <Col span={8}>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {staff.experienceYears}
                </div>
                <div className="text-sm text-gray-600 mt-1">Năm kinh nghiệm</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {staff.department}
                </div>
                <div className="text-sm text-gray-600 mt-1">Khoa/Phòng</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {getShiftText(staff.shift)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Ca làm việc</div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default StaffDetailModal;