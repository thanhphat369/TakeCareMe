import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Divider,
  Space,
  Tag
} from 'antd';
import { nutritionExerciseApi, ExerciseProfile, CreateExerciseProfileDto, UpdateExerciseProfileDto } from '../../api/nutritionExerciseApi';
import apiClient from '../../api/apiClient';

const { TextArea } = Input;
const { Option } = Select;

interface ExerciseProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingProfile?: ExerciseProfile | null;
  defaultElderId?: number;
}

const ExerciseProfileModal: React.FC<ExerciseProfileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingProfile,
  defaultElderId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [elders, setElders] = useState<any[]>([]);
  const [loadingElders, setLoadingElders] = useState(false);

  useEffect(() => {
    if (visible) {
      loadElders();
      if (editingProfile) {
        // Populate form with editing data
        form.setFieldsValue({
          elderId: editingProfile.elderId,
          exerciseType: editingProfile.exerciseType,
          frequency: editingProfile.frequency,
          duration: editingProfile.duration,
          intensity: editingProfile.intensity,
          preferredActivities: editingProfile.preferredActivities,
          physicalLimitations: editingProfile.physicalLimitations,
          weeklyGoalMinutes: editingProfile.weeklyGoalMinutes,
          equipmentUsed: editingProfile.equipmentUsed,
          notes: editingProfile.notes
        });
      } else {
        // Reset form for new profile
        form.resetFields();
        if (defaultElderId) {
          form.setFieldsValue({ elderId: defaultElderId });
        }
      }
    }
  }, [visible, editingProfile, defaultElderId, form]);

  const loadElders = async () => {
    setLoadingElders(true);
    try {
      const response = await apiClient.get('/elders');
      if (response.data.success) {
        setElders(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách người cao tuổi');
    } finally {
      setLoadingElders(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (editingProfile) {
        // Update existing profile
        const updateData: UpdateExerciseProfileDto = {
          exerciseType: values.exerciseType,
          frequency: values.frequency,
          duration: values.duration,
          intensity: values.intensity,
          preferredActivities: values.preferredActivities,
          physicalLimitations: values.physicalLimitations,
          weeklyGoalMinutes: values.weeklyGoalMinutes,
          equipmentUsed: values.equipmentUsed,
          notes: values.notes
        };
        response = await nutritionExerciseApi.updateExerciseProfile(editingProfile.exerciseId, updateData);
      } else {
        // Create new profile
        const createData: CreateExerciseProfileDto = values;
        response = await nutritionExerciseApi.createExerciseProfile(createData);
      }

      if (response.data.success) {
        message.success(editingProfile ? 'Cập nhật hồ sơ vận động thành công' : 'Tạo hồ sơ vận động thành công');
        onSuccess();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu hồ sơ vận động');
    } finally {
      setLoading(false);
    }
  };

  const exerciseTypeOptions = [
    'Đi bộ',
    'Chạy bộ nhẹ',
    'Bơi lội',
    'Yoga',
    'Tai Chi',
    'Khiêu vũ',
    'Tập thể dục nhẹ',
    'Tập tạ nhẹ',
    'Đạp xe',
    'Vật lý trị liệu',
    'Khác'
  ];

  const frequencyOptions = [
    'Hàng ngày',
    '6 lần/tuần',
    '5 lần/tuần',
    '4 lần/tuần',
    '3 lần/tuần',
    '2 lần/tuần',
    '1 lần/tuần',
    'Không thường xuyên'
  ];

  const intensityOptions = [
    'Nhẹ',
    'Trung bình',
    'Cao'
  ];

  const durationOptions = [
    '15 phút',
    '30 phút',
    '45 phút',
    '60 phút',
    '90 phút',
    'Trên 90 phút'
  ];

  const equipmentOptions = [
    'Không sử dụng',
    'Gậy đi bộ',
    'Xe lăn',
    'Máy tập đi bộ',
    'Xe đạp tập',
    'Tạ nhẹ',
    'Dây kháng lực',
    'Bóng tập',
    'Thảm yoga',
    'Khác'
  ];

  return (
    <Modal
      title={editingProfile ? 'Cập nhật Hồ sơ Vận động' : 'Thêm Hồ sơ Vận động'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Người cao tuổi"
              name="elderId"
              rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
            >
              <Select
                placeholder="Chọn người cao tuổi"
                loading={loadingElders}
                showSearch
                optionFilterProp="children"
                disabled={!!editingProfile}
              >
                {elders.map(elder => (
                  <Option key={elder.elderId} value={elder.elderId}>
                    {elder.fullName} - ID: {elder.elderId}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Thông tin vận động</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại vận động"
              name="exerciseType"
            >
              <Select
                placeholder="Chọn loại vận động"
                allowClear
              >
                {exerciseTypeOptions.map(type => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tần suất"
              name="frequency"
            >
              <Select
                placeholder="Chọn tần suất"
                allowClear
              >
                {frequencyOptions.map(freq => (
                  <Option key={freq} value={freq}>
                    {freq}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thời gian mỗi lần"
              name="duration"
            >
              <Select
                placeholder="Chọn thời gian"
                allowClear
              >
                {durationOptions.map(duration => (
                  <Option key={duration} value={duration}>
                    {duration}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Cường độ"
              name="intensity"
            >
              <Select
                placeholder="Chọn cường độ"
                allowClear
              >
                {intensityOptions.map(intensity => (
                  <Option key={intensity} value={intensity}>
                    {intensity}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Hoạt động yêu thích"
              name="preferredActivities"
            >
              <TextArea
                rows={3}
                placeholder="Mô tả các hoạt động vận động yêu thích..."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Hạn chế vật lý"
              name="physicalLimitations"
            >
              <TextArea
                rows={3}
                placeholder="Mô tả các hạn chế về thể chất..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thiết bị sử dụng"
              name="equipmentUsed"
            >
              <Select
                mode="multiple"
                placeholder="Chọn thiết bị"
                style={{ width: '100%' }}
              >
                {equipmentOptions.map(equipment => (
                  <Option key={equipment} value={equipment}>
                    {equipment}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mục tiêu vận động hàng tuần"
              name="weeklyGoalMinutes"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập số phút"
                min={0}
                max={1680} // 24h * 7 days
                addonAfter="phút"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <TextArea
                rows={3}
                placeholder="Ghi chú bổ sung về vận động..."
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ExerciseProfileModal;
