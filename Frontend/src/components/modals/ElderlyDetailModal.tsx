import React from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { Elderly } from '../../types';
import dayjs from 'dayjs';

interface ElderlyDetailModalProps {
  visible: boolean;
  elderly: Elderly | null;
  onClose: () => void;
}

const ElderlyDetailModal: React.FC<ElderlyDetailModalProps> = ({
  visible,
  elderly,
  onClose,
}) => {
  if (!elderly) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'monitoring':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Khỏe mạnh';
      case 'monitoring':
        return 'Theo dõi';
      case 'critical':
        return 'Khẩn cấp';
      default:
        return status;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          <span>Thông tin chi tiết - {elderly.name}</span>
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
              <strong>{elderly.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Tuổi">{elderly.age}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              <Tag color={elderly.gender === 'male' ? 'blue' : 'pink'}>
                {elderly.gender === 'male' ? 'Nam' : 'Nữ'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined className="mr-2" />
              {elderly.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Liên hệ khẩn cấp">
              <PhoneOutlined className="mr-2" />
              {elderly.emergencyContact}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              <HomeOutlined className="mr-2" />
              {elderly.address}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              <Tag color="red">{elderly.bloodType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(elderly.status)}>
                {getStatusText(elderly.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ phụ trách" span={2}>
              <SafetyOutlined className="mr-2" />
              {elderly.doctor}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Health Stats */}
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Lần khám cuối"
                value={
                  elderly.lastCheckup
                    ? dayjs(elderly.lastCheckup).format('DD/MM/YYYY')
                    : 'Chưa có'
                }
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Lần khám tiếp theo"
                value={
                  elderly.nextCheckup
                    ? dayjs(elderly.nextCheckup).format('DD/MM/YYYY')
                    : 'Chưa đặt lịch'
                }
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Medical History */}
        {elderly.medicalHistory && (
          <Card title={<><HeartOutlined className="mr-2" />Tiền sử bệnh</>}>
            <div className="text-gray-700">{elderly.medicalHistory}</div>
          </Card>
        )}

        {/* Allergies */}
        {elderly.allergies && (
          <Card title={<><SafetyOutlined className="mr-2" />Dị ứng</>}>
            <div className="space-y-1">
              {elderly.allergies.split(',').map((allergy, index) => (
                <Tag key={index} color="orange" className="mr-1 mb-1">
                  {allergy.trim()}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Current Medications */}
        {elderly.medications && elderly.medications.length > 0 && (
          <Card
            title={<><MedicineBoxOutlined className="mr-2" />Thuốc đang sử dụng</>}
          >
            <div className="space-y-2">
              {elderly.medications.map((medication, index) => (
                <div key={index} className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center">
                    <MedicineBoxOutlined className="mr-2 text-blue-600" />
                    <span className="font-medium text-blue-600">
                      {medication}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        {elderly.notes && (
          <Card title="Ghi chú">
            <div className="text-gray-700 whitespace-pre-wrap">
              {elderly.notes}
            </div>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Ngày tạo">
              {dayjs(elderly.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {dayjs(elderly.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default ElderlyDetailModal;