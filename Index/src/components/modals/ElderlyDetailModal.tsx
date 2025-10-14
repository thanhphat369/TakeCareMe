import React from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Statistic, Timeline } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  PhoneOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Elderly } from '../../types';

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

  const getGenderText = (gender: string) => {
    return gender === 'male' ? 'Nam' : 'Nữ';
  };

  return (
    <Modal
      title={`Thông tin chi tiết - ${elderly.name}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Họ và tên">
              {elderly.name}
            </Descriptions.Item>
            <Descriptions.Item label="Tuổi">
              {elderly.age} tuổi
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {getGenderText(elderly.gender)}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              {elderly.bloodType}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined className="mr-1" />
              {elderly.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Liên hệ khẩn cấp">
              <PhoneOutlined className="mr-1" />
              {elderly.emergencyContact}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              <HomeOutlined className="mr-1" />
              {elderly.address}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Health Status */}
        <Card title="Tình trạng sức khỏe" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Trạng thái"
                value={getStatusText(elderly.status)}
                valueStyle={{ 
                  color: getStatusColor(elderly.status) === 'green' ? '#10b981' : 
                         getStatusColor(elderly.status) === 'orange' ? '#f59e0b' : '#ef4444'
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Bác sĩ phụ trách"
                value={elderly.doctor}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Lần khám cuối"
                value={new Date(elderly.lastCheckup).toLocaleDateString('vi-VN')}
              />
            </Col>
          </Row>
        </Card>

        {/* Medical Information */}
        <Card title="Thông tin y tế" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <h4 className="font-medium mb-2">Tiền sử bệnh</h4>
              <div className="space-y-1">
                {elderly.medicalHistory.map((condition, index) => (
                  <Tag key={index} color="red" className="mr-1 mb-1">
                    {condition}
                  </Tag>
                ))}
              </div>
            </Col>
            <Col span={12}>
              <h4 className="font-medium mb-2">Dị ứng</h4>
              <div className="space-y-1">
                {elderly.allergies.length > 0 ? (
                  elderly.allergies.map((allergy, index) => (
                    <Tag key={index} color="orange" className="mr-1 mb-1">
                      {allergy}
                    </Tag>
                  ))
                ) : (
                  <span className="text-gray-500">Không có</span>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Medications */}
        <Card title="Thuốc đang sử dụng" size="small">
          {elderly.medications.length > 0 ? (
            <div className="space-y-3">
              {elderly.medications.map((medication) => (
                <div key={medication.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-blue-600">{medication.name}</h5>
                    <Tag color="blue">{medication.dosage}</Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <MedicineBoxOutlined className="mr-1" />
                      Tần suất: {medication.frequency}
                    </div>
                    <div>
                      <CalendarOutlined className="mr-1" />
                      Bắt đầu: {new Date(medication.startDate).toLocaleDateString('vi-VN')}
                    </div>
                    {medication.endDate && (
                      <div>
                        <CalendarOutlined className="mr-1" />
                        Kết thúc: {new Date(medication.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    {medication.notes && (
                      <div className="text-gray-500 italic">
                        Ghi chú: {medication.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Không có thuốc nào được ghi nhận
            </div>
          )}
        </Card>

        {/* Notes */}
        {elderly.notes && (
          <Card title="Ghi chú" size="small">
            <p className="text-gray-700">{elderly.notes}</p>
          </Card>
        )}

        {/* Timeline */}
        <Card title="Lịch sử hoạt động" size="small">
          <Timeline>
            <Timeline.Item
              dot={<CalendarOutlined className="text-blue-500" />}
              color="blue"
            >
              <div>
                <div className="font-medium">Lần khám cuối</div>
                <div className="text-sm text-gray-600">
                  {new Date(elderly.lastCheckup).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Timeline.Item>
            <Timeline.Item
              dot={<CalendarOutlined className="text-green-500" />}
              color="green"
            >
              <div>
                <div className="font-medium">Lần khám tiếp theo</div>
                <div className="text-sm text-gray-600">
                  {new Date(elderly.nextCheckup).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Timeline.Item>
            <Timeline.Item
              dot={<UserOutlined className="text-purple-500" />}
              color="purple"
            >
              <div>
                <div className="font-medium">Thêm vào hệ thống</div>
                <div className="text-sm text-gray-600">
                  {new Date(elderly.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Timeline.Item>
            <Timeline.Item
              dot={<ExclamationCircleOutlined className="text-orange-500" />}
              color="orange"
            >
              <div>
                <div className="font-medium">Cập nhật lần cuối</div>
                <div className="text-sm text-gray-600">
                  {new Date(elderly.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>
    </Modal>
  );
};

export default ElderlyDetailModal;
