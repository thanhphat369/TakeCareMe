import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchCareEvents, createCareEvent, updateCareEvent, deleteCareEvent } from '../controllers/careEventsController';

const { Option } = Select;

interface CareEventRow {
  id: string;
  elderId: number;
  scheduleId?: number | null;
  type: string;
  notes?: string;
  timestamp?: string;
  performedBy?: number;
  attachments?: string | null;
}

const CareEvents: React.FC = () => {
  const [data, setData] = useState<CareEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareEventRow | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const rows = await fetchCareEvents();
      setData(rows);
    } catch (e) {
      message.error('Không thể tải nhật ký chăm sóc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (row: CareEventRow) => {
    setEditing(row);
    form.setFieldsValue({
      elderId: row.elderId,
      scheduleId: row.scheduleId || undefined,
      type: row.type,
      notes: row.notes,
      timestamp: row.timestamp ? dayjs(row.timestamp) : undefined,
      performedBy: row.performedBy || undefined,
    });
    setOpen(true);
  };

  const onDelete = async (row: CareEventRow) => {
    try {
      await deleteCareEvent(row.id);
      message.success('Đã xoá');
      load();
    } catch {
      message.error('Xoá thất bại');
    }
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      elderId: Number(values.elderId),
      scheduleId: values.scheduleId ? Number(values.scheduleId) : null,
      type: values.type,
      notes: values.notes || null,
      timestamp: values.timestamp ? values.timestamp.format('YYYY-MM-DD HH:mm:ss') : null,
      performedBy: values.performedBy ? Number(values.performedBy) : null,
    };
    try {
      if (editing) {
        await updateCareEvent(editing.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await createCareEvent(payload);
        message.success('Thêm mới thành công');
      }
      setOpen(false);
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Lưu thất bại');
    }
  };

  const columns = [
    { title: 'Elder ID', dataIndex: 'elderId', key: 'elderId' },
    { title: 'Schedule ID', dataIndex: 'scheduleId', key: 'scheduleId' },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
    { title: 'Thời gian', dataIndex: 'timestamp', key: 'timestamp' },
    { title: 'Thực hiện bởi', dataIndex: 'performedBy', key: 'performedBy' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, row: CareEventRow) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(row)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(row)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Nhật ký chăm sóc</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Thêm sự kiện</Button>
      </div>
      <Table rowKey="id" loading={loading} dataSource={data} columns={columns as any} />

      <Modal open={open} title={editing ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện'} onOk={onSubmit} onCancel={() => setOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="elderId" label="Elder ID" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="scheduleId" label="Schedule ID">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>
              <Option value="Bath">Bath</Option>
              <Option value="Meal">Meal</Option>
              <Option value="Medication">Medication</Option>
              <Option value="Exercise">Exercise</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="timestamp" label="Thời gian">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="performedBy" label="Thực hiện bởi">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Đính kèm">
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CareEvents;


