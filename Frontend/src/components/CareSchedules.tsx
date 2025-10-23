import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchCareSchedules, createCareSchedule, updateCareSchedule, deleteCareSchedule } from '../controllers/careSchedulesController';

const { Option } = Select;

interface CareScheduleRow {
  id: string;
  elderId: number;
  type: string;
  recurrence: string;
  startTime?: string;
  endTime?: string;
  assignedTo?: number | null;
  status: string;
}

const CareSchedules: React.FC = () => {
  const [data, setData] = useState<CareScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareScheduleRow | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const rows = await fetchCareSchedules();
      setData(rows);
    } catch (e) {
      message.error('Không thể tải lịch chăm sóc');
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

  const onEdit = (row: CareScheduleRow) => {
    setEditing(row);
    form.setFieldsValue({
      elderId: row.elderId,
      type: row.type,
      recurrence: row.recurrence,
      startTime: row.startTime ? dayjs(row.startTime) : undefined,
      endTime: row.endTime ? dayjs(row.endTime) : undefined,
      assignedTo: row.assignedTo || undefined,
      status: row.status,
    });
    setOpen(true);
  };

  const onDelete = async (row: CareScheduleRow) => {
    try {
      await deleteCareSchedule(row.id);
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
      type: values.type,
      recurrence: values.recurrence,
      startTime: values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm:ss') : null,
      endTime: values.endTime ? values.endTime.format('YYYY-MM-DD HH:mm:ss') : null,
      assignedTo: values.assignedTo ? Number(values.assignedTo) : null,
      status: values.status || 'Active',
    };
    try {
      if (editing) {
        await updateCareSchedule(editing.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await createCareSchedule(payload);
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
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Lặp lại', dataIndex: 'recurrence', key: 'recurrence' },
    { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime' },
    { title: 'Kết thúc', dataIndex: 'endTime', key: 'endTime' },
    { title: 'Phân công', dataIndex: 'assignedTo', key: 'assignedTo' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Active' ? 'green' : 'default'}>{s}</Tag> },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, row: CareScheduleRow) => (
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
        <h2 className="text-xl font-semibold">Lịch chăm sóc</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Thêm lịch</Button>
      </div>
      <Table rowKey="id" loading={loading} dataSource={data} columns={columns as any} />

      <Modal open={open} title={editing ? 'Chỉnh sửa lịch' : 'Thêm lịch'} onOk={onSubmit} onCancel={() => setOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="elderId" label="Elder ID" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>
              <Option value="Medication">Medication</Option>
              <Option value="Exercise">Exercise</Option>
              <Option value="HealthCheck">HealthCheck</Option>
            </Select>
          </Form.Item>
          <Form.Item name="recurrence" label="Lặp lại" rules={[{ required: true }]}>
            <Select>
              <Option value="daily">daily</Option>
              <Option value="weekly">weekly</Option>
              <Option value="monthly">monthly</Option>
            </Select>
          </Form.Item>
          <Form.Item name="startTime" label="Bắt đầu">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="endTime" label="Kết thúc">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="assignedTo" label="Phân công">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CareSchedules;


