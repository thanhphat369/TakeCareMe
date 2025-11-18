import React, { useEffect } from 'react';
import { Card, Form, Select, Switch, Button, message } from 'antd';

const { Option } = Select;

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyAlertConfig {
  enabled: boolean;
  minimumLevelForEmergency: AlertPriority;
  notifyByEmail: boolean;
  notifyBySms: boolean;
}

const DEFAULT_CONFIG: EmergencyAlertConfig = {
  enabled: true,
  minimumLevelForEmergency: 'high',
  notifyByEmail: true,
  notifyBySms: false,
};

const STORAGE_KEY = 'emergencyAlertConfig';

const EmergencyAlertSettings: React.FC = () => {
  const [form] = Form.useForm<EmergencyAlertConfig>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const config = raw ? (JSON.parse(raw) as EmergencyAlertConfig) : DEFAULT_CONFIG;
      form.setFieldsValue(config);
    } catch {
      form.setFieldsValue(DEFAULT_CONFIG);
    }
  }, [form]);

  const handleSave = (values: EmergencyAlertConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    message.success('Đã lưu cấu hình cảnh báo khẩn cấp');
  };

  return (
    <Card title="Cấu hình Cảnh báo Khẩn cấp" bordered>
      <Form
        form={form}
        layout="vertical"
        initialValues={DEFAULT_CONFIG}
        onFinish={handleSave}
      >
        <Form.Item
          name="enabled"
          label="Bật cảnh báo khẩn cấp"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="minimumLevelForEmergency"
          label="Ngưỡng mức độ để coi là 'Khẩn cấp'"
          tooltip="Các cảnh báo có mức độ >= ngưỡng này sẽ được coi là khẩn cấp"
          rules={[{ required: true, message: 'Vui lòng chọn ngưỡng mức độ' }]}
        >
          <Select style={{ maxWidth: 280 }}>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
            <Option value="critical">Critical</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notifyByEmail"
          label="Gửi Email khi có cảnh báo khẩn cấp"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notifyBySms"
          label="Gửi SMS khi có cảnh báo khẩn cấp"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Lưu cấu hình
        </Button>
      </Form>
    </Card>
  );
};

export default EmergencyAlertSettings;












