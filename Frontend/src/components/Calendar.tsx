import React, { useState, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, Modal, Form, Input, Select, Button, message, Tag, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Appointment, CreateAppointmentDto } from '../api/appointments';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../api/appointments';
import { fetchEldersController } from '../api/elders';
import { getUsers, getDoctorsAndStaff } from '../api/users';
import dayjs from 'dayjs';

const { Option } = Select;

interface Elder {
  id: string;
  elderId: number;
  fullName: string;
  age?: number;
}

interface User {
  userId: number;
  fullName: string;
  role: string;
}

const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [elders, setElders] = useState<Elder[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [staffNurses, setStaffNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form] = Form.useForm();
  const [careType, setCareType] = useState<'Doctor' | 'Nurse' | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<{ userId: number; role: string } | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCurrentUser({
          userId: parsed.userId || parsed.id,
          role: parsed.role,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Determine which users endpoint to call based on user role
      let usersPromise: Promise<any>;
      if (!currentUser) {
        // If user not loaded yet, try to get doctors and staff (safer fallback)
        usersPromise = getDoctorsAndStaff().catch(() => getUsers());
      } else if (currentUser.role === 'Doctor' || currentUser.role === 'Staff' || currentUser.role === 'Nurse') {
        // Doctor and Staff can only access doctors-and-staff endpoint
        usersPromise = getDoctorsAndStaff();
      } else {
        // Admin and SuperAdmin can access all users
        usersPromise = getUsers();
      }
      
      const [appointmentsResponse, eldersData, usersData] = await Promise.all([
        getAppointments(),
        fetchEldersController(),
        usersPromise,
      ]);

      // Handle appointments response - might be array or wrapped in data object
      let appointmentsData: Appointment[] = [];
      if (Array.isArray(appointmentsResponse)) {
        appointmentsData = appointmentsResponse;
      } else if (appointmentsResponse && typeof appointmentsResponse === 'object' && 'data' in appointmentsResponse) {
        appointmentsData = (appointmentsResponse as any).data || [];
      }

      // Filter appointments based on user role
      let filteredAppointments = appointmentsData;
      if (currentUser) {
        if (currentUser.role === 'Doctor') {
          // Bác sĩ chỉ thấy lịch của chính mình
          filteredAppointments = appointmentsData.filter(
            (apt) => apt.doctorId === currentUser.userId
          );
        } else if (currentUser.role === 'Staff' || currentUser.role === 'Nurse') {
          // Điều dưỡng/nhân viên chỉ thấy lịch của chính mình
          filteredAppointments = appointmentsData.filter(
            (apt) => apt.nurseId === currentUser.userId
          );
        }
        // SuperAdmin và Admin thấy tất cả lịch (không cần filter)
      }

      setAppointments(filteredAppointments);
      
      // Map elders
      const mappedElders: Elder[] = eldersData.map((elder: any) => ({
        id: elder.id,
        elderId: parseInt(elder.id),
        fullName: elder.fullName,
        age: elder.age,
      }));
      setElders(mappedElders);

      // Filter doctors and staff/nurses
      const doctorsList = usersData
        .filter((user: any) => user.role === 'Doctor')
        .map((user: any) => ({
          userId: user.userId || user.id,
          fullName: user.fullName,
          role: user.role,
        }));
      setDoctors(doctorsList);

      const staffList = usersData
        .filter((user: any) => user.role === 'Staff' || user.role === 'Nurse')
        .map((user: any) => ({
          userId: user.userId || user.id,
          fullName: user.fullName,
          role: user.role,
        }));
      setStaffNurses(staffList);
    } catch (error: any) {
      message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (careType?: string) => {
    switch (careType) {
      case 'Doctor':
        return '#3b82f6'; // Blue for doctor checkup
      case 'Nurse':
        return '#10b981'; // Green for nurse care
      default:
        return '#6b7280';
    }
  };


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'blue';
      case 'in-progress':
      case 'in_progress':
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
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'in-progress':
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Chưa xác định';
    }
  };
  
  const events = useMemo(() => {
    return appointments.map(appointment => {
      const elderName = appointment.elder?.fullName || elders.find(e => e.elderId === appointment.elderId)?.fullName || 'Chưa xác định';
      const careProviderName = appointment.careType === 'Doctor' 
        ? (appointment.doctor?.fullName || doctors.find(d => d.userId === appointment.doctorId)?.fullName || '')
        : (appointment.nurse?.fullName || staffNurses.find(s => s.userId === appointment.nurseId)?.fullName || '');
      
      const title = appointment.careType === 'Doctor' 
        ? `Khám: ${elderName} - BS. ${careProviderName}`
        : `Chăm sóc: ${elderName} - ĐD. ${careProviderName}`;

      return {
        id: String(appointment.appointmentId),
        title: title,
        start: appointment.visitDate,
        end: appointment.nextVisitDate || appointment.visitDate,
        backgroundColor: getEventColor(appointment.careType),
        borderColor: getEventColor(appointment.careType),
        extendedProps: {
          ...appointment,
        }
      };
    });
  }, [appointments, elders, doctors, staffNurses]);

  

  const handleDateSelect = (selectInfo: any) => {
    setEditingAppointment(null);
    setCareType(undefined);
    setIsModalVisible(true);
    form.setFieldsValue({
      visitDate: dayjs(selectInfo.start),
      careType: undefined,
    });
  };

  const handleEventClick = (clickInfo: any) => {
    const appointment = clickInfo.event.extendedProps as Appointment;
    setEditingAppointment(appointment);
    setCareType(appointment.careType);
    setIsModalVisible(true);
    form.setFieldsValue({
      elderId: appointment.elderId,
      careType: appointment.careType,
      doctorId: appointment.doctorId,
      nurseId: appointment.nurseId,
      visitDate: appointment.visitDate ? dayjs(appointment.visitDate) : undefined,
      nextVisitDate: appointment.nextVisitDate ? dayjs(appointment.nextVisitDate) : undefined,
      notes: appointment.notes,
      status: appointment.status,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const appointmentData: CreateAppointmentDto = {
        elderId: values.elderId,
        careType: values.careType,
        visitDate: values.visitDate ? dayjs(values.visitDate).toISOString() : new Date().toISOString(),
        nextVisitDate: values.nextVisitDate ? dayjs(values.nextVisitDate).toISOString() : undefined,
        notes: values.notes,
        status: values.status || 'Scheduled',
      };

      if (values.careType === 'Doctor') {
        appointmentData.doctorId = values.doctorId;
        appointmentData.nurseId = undefined;
      } else if (values.careType === 'Nurse') {
        appointmentData.nurseId = values.nurseId;
        appointmentData.doctorId = undefined;
      }

      if (editingAppointment) {
        await updateAppointment(editingAppointment.appointmentId, appointmentData);
        message.success('Cập nhật cuộc hẹn thành công');
      } else {
        await createAppointment(appointmentData);
        message.success('Thêm cuộc hẹn thành công');
      }

      await loadData();
      setIsModalVisible(false);
      setCareType(undefined);
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        // Validation errors
        return;
      }
      message.error('Lỗi: ' + (error.message || 'Không thể lưu cuộc hẹn'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAppointment(id);
      message.success('Xóa cuộc hẹn thành công');
      await loadData();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error('Lỗi: ' + (error.message || 'Không thể xóa cuộc hẹn'));
    }
  };

  const handleCareTypeChange = (value: 'Doctor' | 'Nurse') => {
    setCareType(value);
    form.setFieldsValue({
      doctorId: undefined,
      nurseId: undefined,
    });
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
            setCareType(undefined);
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
            <span className="text-sm">Bác sĩ khám</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Điều dưỡng chăm sóc</span>
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
        onCancel={() => {
          setIsModalVisible(false);
          setCareType(undefined);
          form.resetFields();
        }}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
        footer={[
          <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            setCareType(undefined);
            form.resetFields();
          }}>
            Hủy
          </Button>,
          editingAppointment && (
            <Button
              key="delete"
              danger
              onClick={() => handleDelete(editingAppointment.appointmentId)}
            >
              Xóa
            </Button>
          ),
          <Button key="submit" type="primary" onClick={handleModalOk} loading={loading}>
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'Scheduled',
          }}
        >
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Thông tin cuộc hẹn</h4>
            {editingAppointment && (
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Người cao tuổi:</strong> {editingAppointment.elder?.fullName || elders.find(e => e.elderId === editingAppointment.elderId)?.fullName || 'Chưa xác định'}
                </div>
                <div>
                  <strong>Loại:</strong> {editingAppointment.careType === 'Doctor' ? 'Bác sĩ khám' : 'Điều dưỡng chăm sóc'}
                </div>
                <div>
                  <strong>Người thực hiện:</strong> {
                    editingAppointment.careType === 'Doctor' 
                      ? (editingAppointment.doctor?.fullName || doctors.find(d => d.userId === editingAppointment.doctorId)?.fullName || 'Chưa xác định')
                      : (editingAppointment.nurse?.fullName || staffNurses.find(s => s.userId === editingAppointment.nurseId)?.fullName || 'Chưa xác định')
                  }
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
            name="elderId"
            label="Người cao tuổi"
            rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
          >
            <Select 
              placeholder="Chọn người cao tuổi"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {elders.map(elder => (
                <Option key={elder.elderId} value={elder.elderId}>
                  {elder.fullName} {elder.age ? `(${elder.age} tuổi)` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="careType"
            label="Loại cuộc hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn loại cuộc hẹn' }]}
          >
            <Select 
              placeholder="Chọn loại cuộc hẹn"
              onChange={(value) => {
                handleCareTypeChange(value);
                setCareType(value);
              }}
            >
              <Option value="Doctor">Bác sĩ khám</Option>
              <Option value="Nurse">Điều dưỡng chăm sóc</Option>
            </Select>
          </Form.Item>

          {(careType === 'Doctor' || form.getFieldValue('careType') === 'Doctor') && (
            <Form.Item
              name="doctorId"
              label="Bác sĩ"
              rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
            >
              <Select 
                placeholder="Chọn bác sĩ"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {doctors.map(doctor => (
                  <Option key={doctor.userId} value={doctor.userId}>
                    BS. {doctor.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {(careType === 'Nurse' || form.getFieldValue('careType') === 'Nurse') && (
            <Form.Item
              name="nurseId"
              label="Điều dưỡng/Nhân viên"
              rules={[{ required: true, message: 'Vui lòng chọn điều dưỡng/nhân viên' }]}
            >
              <Select 
                placeholder="Chọn điều dưỡng/nhân viên"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {staffNurses.map(staff => (
                  <Option key={staff.userId} value={staff.userId}>
                    {staff.role === 'Nurse' ? 'ĐD. ' : 'NV. '}{staff.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="visitDate"
            label="Ngày giờ hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày giờ hẹn' }]}
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày giờ hẹn"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
          >
            <Select>
              <Option value="Scheduled">Đã lên lịch</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú về cuộc hẹn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;
