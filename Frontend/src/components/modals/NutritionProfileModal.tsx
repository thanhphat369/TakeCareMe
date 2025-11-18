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
import { nutritionExerciseApi, NutritionProfile, CreateNutritionProfileDto, UpdateNutritionProfileDto } from '../../api/nutritionExerciseApi';
import apiClient from '../../api/apiClient';

const { TextArea } = Input;
const { Option } = Select;

interface NutritionProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingProfile?: NutritionProfile | null;
  defaultElderId?: number;
}

const NutritionProfileModal: React.FC<NutritionProfileModalProps> = ({
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
          dietaryRestrictions: editingProfile.dietaryRestrictions,
          favoriteFoods: editingProfile.favoriteFoods,
          allergies: editingProfile.allergies,
          mealPreferences: editingProfile.mealPreferences,
          dailyCalories: editingProfile.dailyCalories,
          dailyWaterIntake: editingProfile.dailyWaterIntake,
          specialDiet: editingProfile.specialDiet,
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
        const updateData: UpdateNutritionProfileDto = {
          dietaryRestrictions: values.dietaryRestrictions,
          favoriteFoods: values.favoriteFoods,
          allergies: values.allergies,
          mealPreferences: values.mealPreferences,
          dailyCalories: values.dailyCalories,
          dailyWaterIntake: values.dailyWaterIntake,
          specialDiet: values.specialDiet,
          notes: values.notes
        };
        response = await nutritionExerciseApi.updateNutritionProfile(editingProfile.nutritionId, updateData);
      } else {
        // Create new profile
        const createData: CreateNutritionProfileDto = values;
        response = await nutritionExerciseApi.createNutritionProfile(createData);
      }

      if (response.data.success) {
        message.success(editingProfile ? 'Cập nhật hồ sơ dinh dưỡng thành công' : 'Tạo hồ sơ dinh dưỡng thành công');
        onSuccess();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu hồ sơ dinh dưỡng');
    } finally {
      setLoading(false);
    }
  };

  const specialDietOptions = [
    'Chế độ ăn kiêng đái tháo đường',
    'Chế độ ăn ít muối',
    'Chế độ ăn ít chất béo',
    'Chế độ ăn nhiều chất xơ',
    'Chế độ ăn mềm',
    'Chế độ ăn chay',
    'Chế độ ăn Halal',
    'Chế độ ăn Kosher',
    'Khác'
  ];

  const allergyOptions = [
    'Sữa',
    'Trứng',
    'Cá',
    'Tôm cua',
    'Đậu phộng',
    'Đậu nành',
    'Gluten',
    'Hạt',
    'Khác'
  ];

  return (
    <Modal
      title={editingProfile ? 'Cập nhật Hồ sơ Dinh dưỡng' : 'Thêm Hồ sơ Dinh dưỡng'}
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

        <Divider orientation="left">Thông tin dinh dưỡng</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Hạn chế ăn uống"
              name="dietaryRestrictions"
            >
              <TextArea
                rows={3}
                placeholder="Mô tả các hạn chế về ăn uống..."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Món ăn yêu thích"
              name="favoriteFoods"
            >
              <TextArea
                rows={3}
                placeholder="Liệt kê các món ăn yêu thích..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Dị ứng thực phẩm"
              name="allergies"
            >
              <Select
                mode="multiple"
                placeholder="Chọn các loại dị ứng"
                style={{ width: '100%' }}
              >
                {allergyOptions.map(allergy => (
                  <Option key={allergy} value={allergy}>
                    {allergy}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Chế độ ăn đặc biệt"
              name="specialDiet"
            >
              <Select
                placeholder="Chọn chế độ ăn đặc biệt"
                allowClear
              >
                {specialDietOptions.map(diet => (
                  <Option key={diet} value={diet}>
                    {diet}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Sở thích bữa ăn"
              name="mealPreferences"
            >
              <TextArea
                rows={2}
                placeholder="Mô tả sở thích về bữa ăn..."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <TextArea
                rows={2}
                placeholder="Ghi chú bổ sung..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Mục tiêu dinh dưỡng</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Lượng calo mỗi ngày"
              name="dailyCalories"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập lượng calo"
                min={500}
                max={5000}
                addonAfter="cal"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Lượng nước mỗi ngày"
              name="dailyWaterIntake"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập lượng nước"
                min={500}
                max={5000}
                addonAfter="ml"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NutritionProfileModal;
