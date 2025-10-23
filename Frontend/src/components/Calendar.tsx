import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, Modal, Form, Input, Select, Button, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { mockAppointments, mockElderly, mockCaregivers } from '../data/mockData';
import { Appointment } from '../types';

const { Option } = Select;

const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form] = Form.useForm();
  

  const getEventColor = (type: string) => {
    switch (type) {
      case 'checkup':
        return '#3b82f6';
      case 'medication':
        return '#10b981';
      case 'exercise':
        return '#f59e0b';
      case 'social':
        return '#8b5cf6';
      case 'emergency':
        return '#ef4444';
      default:
        return '#6b7280';
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
  
  const events = useMemo(() => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      start: appointment.start,
      end: appointment.end,
      backgroundColor: getEventColor(appointment.type),
      borderColor: getEventColor(appointment.type),
      extendedProps: {
        ...appointment,
        elderly: mockElderly.find(e => e.id === appointment.elderlyId),
        caregiver: mockCaregivers.find(c => c.id === appointment.caregiverId),
      }
    }));
  }, [appointments]);

  

  const handleDateSelect = (selectInfo: any) => {
    setEditingAppointment(null);
    setIsModalVisible(true);
    form.setFieldsValue({
      start: selectInfo.start,
      end: selectInfo.end,
    });
  };

  const handleEventClick = (clickInfo: any) => {
    const appointment = clickInfo.event.extendedProps;
    setEditingAppointment(appointment);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...appointment,
      start: new Date(appointment.start),
      end: new Date(appointment.end),
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newAppointment: Appointment = {
        ...values,
        id: editingAppointment?.id || Date.now().toString(),
        start: values.start ? values.start.toDate() : new Date(),
        end: values.end ? values.end.toDate() : new Date(),
        createdAt: editingAppointment?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingAppointment) {
        setAppointments(appointments.map(item => 
          item.id === editingAppointment.id ? newAppointment : item
        ));
        message.success('Cập nhật cuộc hẹn thành công');
      } else {
        setAppointments([...appointments, newAppointment]);
        message.success('Thêm cuộc hẹn thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter(item => item.id !== id));
    message.success('Xóa cuộc hẹn thành công');
    setIsModalVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lịch hẹn</h1>
          <p className="text-gray-600">Quản lý lịch hẹn và cuộc hẹn chăm sóc</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingAppointment(null);
            setIsModalVisible(true);
            form.resetFields();
          }}
          size="large"
        >
          Thêm cuộc hẹn
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">Khám sức khỏe</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Uống thuốc</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Tập thể dục</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span className="text-sm">Hoạt động xã hội</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Khẩn cấp</span>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          locale="vi"
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày'
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingAppointment ? 'Chỉnh sửa cuộc hẹn' : 'Thêm cuộc hẹn mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          editingAppointment && (
            <Button
              key="delete"
              danger
              onClick={() => handleDelete(editingAppointment.id)}
            >
              Xóa
            </Button>
          ),
          <Button key="submit" type="primary" onClick={handleModalOk}>
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'checkup',
            status: 'scheduled',
          }}
        >
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Thông tin cuộc hẹn</h4>
            {editingAppointment && (
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Người cao tuổi:</strong> {mockElderly.find(e => e.id === editingAppointment.elderlyId)?.fullName}
                </div>
                <div>
                  <strong>Người chăm sóc:</strong> {mockCaregivers.find(c => c.id === editingAppointment.caregiverId)?.name}
                </div>
                <div>
                  <strong>Trạng thái:</strong> 
                  <Tag color={getStatusColor(editingAppointment.status)} className="ml-2">
                    {getStatusText(editingAppointment.status)}
                  </Tag>
                </div>
              </div>
            )}
          </div>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại cuộc hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn loại cuộc hẹn' }]}
          >
            <Select>
              <Option value="checkup">Khám sức khỏe</Option>
              <Option value="medication">Uống thuốc</Option>
              <Option value="exercise">Tập thể dục</Option>
              <Option value="social">Hoạt động xã hội</Option>
              <Option value="emergency">Khẩn cấp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="elderlyId"
            label="Người cao tuổi"
            rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
          >
            <Select>
              {mockElderly.map(elderly => (
                <Option key={elderly.id} value={elderly.id}>
                  {elderly.fullName} ({elderly.age} tuổi)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="caregiverId"
            label="Người chăm sóc"
            rules={[{ required: true, message: 'Vui lòng chọn người chăm sóc' }]}
          >
            <Select>
              {mockCaregivers.map(caregiver => (
                <Option key={caregiver.id} value={caregiver.id}>
                  {caregiver.name} - {caregiver.specialization.join(', ')}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Địa điểm"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;
