// import React, { useState, useEffect } from 'react';
// import apiClient from '../api/apiClient';
// import {
//   Card,
//   Table,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Select,
//   DatePicker,
//   Space,
//   Tag,
//   Row,
//   Col,
//   Statistic,
//   Avatar,
//   Tabs,
//   message,
// } from 'antd';
// import {
//   EyeOutlined,
//   UserOutlined,
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   TeamOutlined,
//   SafetyOutlined,
//   HeartOutlined,
// } from '@ant-design/icons';
// import dayjs from 'dayjs';

// const { Option } = Select;
// const { TabPane } = Tabs;

// interface Staff {
//   id: number;
//   fullName: string;
//   email: string;
//   phone: string;
//   role: string;
//   roleTitle?: string;
//   licenseNo?: string;
//   department: string;
//   status: string;
//   shift: string;
//   experienceYears: number;
//   education?: string;
//   skills?: string;
//   notes?: string;
//   hireDate?: string;
// }

// const StaffManagement: React.FC = () => {
//   const [staff, setStaff] = useState<Staff[]>([]);
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     doctors: 0,
//     nurses: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
//   const [form] = Form.useForm();

//   // Load danh sách nhân viên
//   const fetchStaff = async () => {
//     try {
//       setLoading(true);

//       const res = await apiClient.get("/api/staff", {
//         params: { page: 1, limit: 50 },
//       });

//       console.log("Response from /staff:", res.data);

//       const raw = res.data?.data || [];

//       // Map backend data to frontend format
//       const formatted = raw.map((item: any) => ({
//         id: item.staffId,
//         fullName: item.user?.fullName || "",
//         email: item.user?.email || "",
//         phone: item.user?.phone || "",
//         role: item.user?.role || "",
//         roleTitle: item.roleTitle || "",
//         licenseNo: item.licenseNo || "",
//         department: item.department || "",
//         status: item.status || "",
//         shift: item.shift || "",
//         experienceYears: item.experienceYears || 0,
//         education: item.education || "",
//         skills: item.skills || "",
//         notes: item.notes || "",
//         hireDate: item.createdAt || "",
//       }));

//       setStaff(formatted);
//     } catch (error: any) {
//       console.error("Lỗi tải danh sách nhân viên:", error);

//       if (error.response?.status === 401) {
//         message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
//         localStorage.removeItem("accessToken");
//         window.location.href = "/login";
//       } else {
//         message.error(
//           error.response?.data?.message ||
//           "Không thể tải danh sách nhân viên."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Lấy thống kê nhân viên
//   const fetchStatistics = async () => {
//     try {
//       const res = await apiClient.get('/api/staff/statistics');
//       const data = res.data;
//       setStats({
//         total: data.total,
//         active: data.active,
//         doctors: data.byRole?.doctors || 0,
//         nurses: data.byRole?.nurses || 0,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     fetchStaff();
//     fetchStatistics();
//   }, []);

//   const roleLabels: Record<string, string> = {
//     Doctor: 'Bác sĩ',
//     Staff: 'Điều dưỡng',
//     DOCTOR: 'Bác sĩ',
//     STAFF: 'Điều dưỡng',
//   };

//   const statusColors: Record<string, string> = {
//     Active: 'green',
//     Inactive: 'red',
//     OnLeave: 'orange',
//   };

//   const statusLabels: Record<string, string> = {
//     Active: 'Hoạt động',
//     Inactive: 'Không hoạt động',
//     OnLeave: 'Nghỉ phép',
//   };

//   const shiftLabels: Record<string, string> = {
//     morning: 'Ca sáng',
//     afternoon: 'Ca chiều',
//     night: 'Ca đêm',
//     flexible: 'Linh hoạt',
//   };

//   // Cột bảng
//   const columns = [
//     {
//       title: 'Nhân viên',
//       dataIndex: 'fullName',
//       key: 'fullName',
//       render: (text: string, record: Staff) => (
//         <div className="flex items-center">
//           <Avatar size="small" icon={<UserOutlined />} className="mr-3" />
//           <div>
//             <div className="font-medium">{text}</div>
//             <div className="text-sm text-gray-500">{record.email}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: 'Vai trò',
//       dataIndex: 'role',
//       key: 'role',
//       render: (role: string) => (
//         <Tag color={role === 'Doctor' || role === 'DOCTOR' ? 'blue' : 'green'}>
//           {roleLabels[role] || role}
//         </Tag>
//       ),
//     },
//     {
//       title: 'Chức danh',
//       dataIndex: 'roleTitle',
//       key: 'roleTitle',
//     },
//     {
//       title: 'Khoa/Phòng',
//       dataIndex: 'department',
//       key: 'department',
//     },
//     {
//       title: 'Ca làm việc',
//       dataIndex: 'shift',
//       key: 'shift',
//       render: (shift: string) => shiftLabels[shift] || shift,
//     },
//     {
//       title: 'Trạng thái',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status: string) => (
//         <Tag color={statusColors[status] || 'default'}>
//           {statusLabels[status] || status}
//         </Tag>
//       ),
//     },
//     {
//       title: 'Kinh nghiệm',
//       dataIndex: 'experienceYears',
//       key: 'experienceYears',
//       render: (exp: number) => `${exp} năm`,
//     },
//     {
//       title: 'Hành động',
//       key: 'action',
//       render: (_: any, record: Staff) => (
//         <Space>
//            <Button 
//             type="link" 
//             icon={<EyeOutlined />}
//             onClick={() => handleView(record)}
//           >
//             Xem
//           </Button>

//           <Button
//             type="link"
//             icon={<EditOutlined />}
//             onClick={() => handleEdit(record)}
//           >
//             Sửa
//           </Button>
//           <Button
//             type="link"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDelete(record.id)}
//           >
//             Xóa
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   // Thêm nhân viên
//   const handleAdd = () => {
//     setEditingStaff(null);
//     form.resetFields();
//     setIsModalVisible(true);
//   };

//   // Sửa nhân viên
//   const handleEdit = (staff: Staff) => {
//     setEditingStaff(staff);
//     form.setFieldsValue({
//       fullName: staff.fullName,
//       email: staff.email,
//       phone: staff.phone,
//       role: staff.role,
//       roleTitle: staff.roleTitle,
//       licenseNo: staff.licenseNo,
//       department: staff.department,
//       shift: staff.shift,
//       experienceYears: staff.experienceYears,
//       status: staff.status,
//       education: staff.education,
//       skills: staff.skills,
//       notes: staff.notes,
//     });
//     setIsModalVisible(true);
//   };

//   const handleView = (staff: Staff) => {
//     setEditingStaff(staff);
//     setIsModalVisible(true);
//   };


//   // Xóa nhân viên
//   const handleDelete = async (id: number) => {
//     try {
//       await apiClient.delete(`/api/staff/${id}`);
//       message.success('Đã xóa (chuyển Inactive)');
//       fetchStaff();
//       fetchStatistics();
//     } catch (error) {
//       message.error('Không thể xóa nhân viên');
//     }
//   };

//   // Gửi form (Thêm hoặc sửa)
//   const handleSubmit = async (values: any) => {
//     try {
//       // Validate skills length
//       if (values.skills && values.skills.length > 255) {
//         message.error('Kỹ năng/Chuyên môn không được vượt quá 255 ký tự');
//         return;
//       }

//       const payload = {
//         fullName: values.fullName,
//         email: values.email,
//         phone: values.phone,
//         role: values.role, // Keep original case: "Doctor" or "Staff"
//         roleTitle: values.roleTitle,
//         licenseNo: values.licenseNo || null,
//         department: values.department,
//         shift: values.shift, // Keep lowercase: "morning", "afternoon", etc.
//         experienceYears: Number(values.experienceYears) || 0,
//         education: values.education || null,
//         skills: values.skills || null,
//         notes: values.notes || null,
//         status: values.status || 'Active', // "Active", "Inactive", or "OnLeave"
//       };

//       if (editingStaff) {
//         // Update existing staff
//         await apiClient.patch(`/api/staff/${editingStaff.id}`, payload);
//         message.success('Cập nhật thành công');
//       } else {
//         // Create new staff - add password
//         await apiClient.post('/api/staff', {
//           ...payload,
//           password: values.password || '123456',
//         });
//         message.success('Thêm mới thành công');
//       }
      
//       setIsModalVisible(false);
//       form.resetFields();
//       fetchStaff();
//       fetchStatistics();
//     } catch (error: any) {
//       console.error('Submit error:', error);
//       const errorMsg = error.response?.data?.message;
      
//       if (Array.isArray(errorMsg)) {
//         message.error(errorMsg.join(', '));
//       } else {
//         message.error(errorMsg || 'Lưu thất bại');
//       }
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý nhân viên</h1>
//       <p className="text-gray-600">Quản lý thông tin, vai trò và ca làm việc</p>

//        <Row gutter={[16, 16]}>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Tổng nhân viên"
//               value={stats.total}
//               prefix={<TeamOutlined />}
//               valueStyle={{ color: '#1890ff' }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Đang hoạt động"
//               value={stats.active}
//               valueStyle={{ color: '#52c41a' }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Bác sĩ"
//               value={stats.doctors}
//               prefix={<SafetyOutlined />}
//               valueStyle={{ color: '#1890ff' }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Điều dưỡng"
//               value={stats.nurses}
//               prefix={<HeartOutlined />}
//               valueStyle={{ color: '#52c41a' }}
//             />
//           </Card>
//         </Col>
//       </Row>


//       {/* Danh sách */}
//       <Card>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
//           <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
//             Thêm nhân viên
//           </Button>
//         </div>

//         <Tabs defaultActiveKey="all">
//           <TabPane tab={`Tất cả (${stats.total})`} key="all">
//             <Table
//               columns={columns}
//               dataSource={staff}
//               loading={loading}
//               rowKey="id"
//               pagination={{ pageSize: 10 }}
//             />
//           </TabPane>
//           <TabPane tab={`Đang hoạt động (${stats.active})`} key="active">
//             <Table
//               columns={columns}
//               dataSource={staff.filter((s) => s.status === 'Active')}
//               rowKey="id"
//             />
//           </TabPane>
//            <TabPane tab={`Bác sĩ (${stats.doctors})`} key="doctors">
//             <Table 
//               columns={columns} 
//               dataSource={staff.filter(s => s.role === 'Doctor')}
//               rowKey="id"
//               pagination={{ pageSize: 10 }}
//             />
//           </TabPane>
//           <TabPane tab={`Điều dưỡng (${stats.nurses})`} key="nurses">
//             <Table 
//               columns={columns} 
//               dataSource={staff.filter(s => s.role === 'Staff')}
//               rowKey="id"
//               pagination={{ pageSize: 10 }}
//             />
//           </TabPane>
//         </Tabs>
//       </Card>

//       {/* Modal thêm/sửa */}
//       <Modal
//         title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
//         open={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//         width={800}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubmit}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="fullName"
//                 label="Họ và tên"
//                 rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
//               >
//                 <Input />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="email"
//                 label="Email"
//                 rules={[
//                   { required: true, message: 'Vui lòng nhập email' },
//                   { type: 'email', message: 'Email không hợp lệ' },
//                 ]}
//               >
//                 <Input />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="phone"
//                 label="Số điện thoại"
//                 rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
//               >
//                 <Input />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="role"
//                 label="Vai trò"
//                 rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
//               >
//                 <Select placeholder="Chọn vai trò">
//                   <Option value="Doctor">Bác sĩ</Option>
//                   <Option value="Staff">Điều dưỡng</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="roleTitle"
//                 label="Chức danh"
//                 rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}
//               >
//                 <Input placeholder="VD: Bác sĩ nội khoa, Điều dưỡng trưởng" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="licenseNo"
//                 label="Số chứng chỉ hành nghề"
//               >
//                 <Input placeholder="Số giấy phép hành nghề" />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="department"
//                 label="Khoa/Phòng"
//                 rules={[{ required: true, message: 'Vui lòng nhập khoa/phòng' }]}
//               >
//                 <Input placeholder="VD: Nội khoa, Ngoại khoa" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="shift"
//                 label="Ca làm việc"
//                 rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
//               >
//                 <Select placeholder="Chọn ca làm việc">
//                   <Option value="morning">Ca sáng</Option>
//                   <Option value="afternoon">Ca chiều</Option>
//                   <Option value="night">Ca đêm</Option>
//                   <Option value="flexible">Linh hoạt</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="experienceYears"
//                 label="Kinh nghiệm (năm)"
//                 rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
//               >
//                 <Input type="number" min={0} />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="status"
//                 label="Trạng thái"
//                 initialValue="Active"
//               >
//                 <Select>
//                   <Option value="Active">Đang làm việc</Option>
//                   <Option value="Inactive">Nghỉ việc</Option>
//                   <Option value="OnLeave">Nghỉ phép</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           <Form.Item
//             name="education"
//             label="Bằng cấp"
//           >
//             <Input placeholder="VD: Bác sĩ đa khoa, Cử nhân điều dưỡng" />
//           </Form.Item>

//           <Form.Item
//             name="skills"
//             label="Kỹ năng/Chuyên môn"
//             rules={[
//               { max: 255, message: 'Kỹ năng không được vượt quá 255 ký tự' }
//             ]}
//           >
//             <Input.TextArea
//               rows={2}
//               placeholder="VD: Siêu âm tim, Nội soi, Cấp cứu..."
//               maxLength={255}
//               showCount
//             />
//           </Form.Item>

//           <Form.Item name="notes" label="Ghi chú">
//             <Input.TextArea rows={3} placeholder="Thông tin bổ sung..." />
//           </Form.Item>

//           {!editingStaff && (
//             <Form.Item
//               name="password"
//               label="Mật khẩu"
//               extra="Để trống sẽ dùng mật khẩu mặc định: 123456"
//             >
//               <Input.Password placeholder="Mật khẩu (mặc định: 123456)" />
//             </Form.Item>
//           )}

//           <Form.Item>
//             <Space>
//               <Button type="primary" htmlType="submit">
//                 {editingStaff ? 'Cập nhật' : 'Thêm mới'}
//               </Button>
//               <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default StaffManagement;
import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Badge,
  Row,
  Col,
  Statistic,
  Avatar,
  Tabs,
  Switch,
  Upload
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  SafetyOutlined,
  TeamOutlined,
  HeartOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'doctor' | 'nurse' | 'caregiver' | 'admin' | 'supervisor';
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  avatar?: string;
  qualifications: string[];
  specialties: string[];
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  experience: number;
  notes?: string;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      fullName: 'BS. Nguyễn Văn Bác sĩ',
      email: 'doctor.nguyen@tcm.com',
      phone: '0901234567',
      role: 'doctor',
      department: 'Tim mạch',
      status: 'active',
      hireDate: '2023-01-15',
      qualifications: ['Bác sĩ chuyên khoa Tim mạch', 'Thạc sĩ Y học'],
      specialties: ['Tim mạch', 'Huyết áp', 'Đái tháo đường'],
      shift: 'morning',
      experience: 8,
      notes: 'Chuyên gia về tim mạch người cao tuổi'
    },
    {
      id: '2',
      fullName: 'Điều dưỡng Trần Thị Y tá',
      email: 'nurse.tran@tcm.com',
      phone: '0901234568',
      role: 'nurse',
      department: 'Chăm sóc tổng quát',
      status: 'active',
      hireDate: '2023-03-20',
      qualifications: ['Cử nhân Điều dưỡng', 'Chứng chỉ Chăm sóc người cao tuổi'],
      specialties: ['Chăm sóc cơ bản', 'Theo dõi sinh hiệu', 'Vật lý trị liệu'],
      shift: 'afternoon',
      experience: 5,
      notes: 'Kinh nghiệm chăm sóc người cao tuổi'
    },
    {
      id: '3',
      fullName: 'Người chăm sóc Phạm Văn Hỗ trợ',
      email: 'caregiver.pham@tcm.com',
      phone: '0901234569',
      role: 'caregiver',
      department: 'Chăm sóc hàng ngày',
      status: 'active',
      hireDate: '2023-06-10',
      qualifications: ['Chứng chỉ Chăm sóc người cao tuổi'],
      specialties: ['Hỗ trợ sinh hoạt', 'Vận động', 'Tâm lý'],
      shift: 'flexible',
      experience: 3,
      notes: 'Tận tâm và có kinh nghiệm'
    },
    {
      id: '4',
      fullName: 'Quản lý Lê Thị Quản lý',
      email: 'manager.le@tcm.com',
      phone: '0901234570',
      role: 'admin',
      department: 'Quản lý',
      status: 'on_leave',
      hireDate: '2022-12-01',
      qualifications: ['Thạc sĩ Quản trị Y tế', 'Chứng chỉ ISO 9001'],
      specialties: ['Quản lý', 'Điều phối', 'Báo cáo'],
      shift: 'morning',
      experience: 10,
      notes: 'Quản lý có kinh nghiệm'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();

  const roleLabels = {
    doctor: 'Bác sĩ',
    nurse: 'Điều dưỡng',
    caregiver: 'Người chăm sóc',
    admin: 'Quản lý',
    supervisor: 'Giám sát'
  };

  const statusColors = {
    active: 'green',
    inactive: 'red',
    on_leave: 'orange'
  };

  const statusLabels = {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    on_leave: 'Nghỉ phép'
  };

  const shiftLabels = {
    morning: 'Ca sáng',
    afternoon: 'Ca chiều',
    night: 'Ca đêm',
    flexible: 'Linh hoạt'
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Staff) => (
        <div className="flex items-center">
          <Avatar 
            size="small" 
            src={record.avatar}
            icon={<UserOutlined />}
            className="mr-3"
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: keyof typeof roleLabels) => (
        <Tag color={role === 'doctor' ? 'blue' : role === 'nurse' ? 'green' : 'orange'}>
          {roleLabels[role]}
        </Tag>
      ),
    },
    {
      title: 'Khoa/Phòng',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift: keyof typeof shiftLabels) => shiftLabels[shift],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp: number) => `${exp} năm`,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      ...staff,
      hireDate: dayjs(staff.hireDate)
    });
    setIsModalVisible(true);
  };

  const handleView = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleSubmit = (values: any) => {
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...values, hireDate: values.hireDate.format('YYYY-MM-DD') }
          : s
      ));
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        ...values,
        hireDate: values.hireDate.format('YYYY-MM-DD'),
        status: 'active'
      };
      setStaff([...staff, newStaff]);
    }
    setIsModalVisible(false);
  };

  const getStatistics = () => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const doctors = staff.filter(s => s.role === 'doctor').length;
    const nurses = staff.filter(s => s.role === 'nurse').length;

    return { total, active, doctors, nurses };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý nhân viên</h1>
        <p className="text-gray-600">Quản lý thông tin nhân viên, vai trò và phân công ca làm việc</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Bác sĩ"
              value={stats.doctors}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Điều dưỡng"
              value={stats.nurses}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm nhân viên
          </Button>
        </div>

        <Tabs defaultActiveKey="all">
          <TabPane tab={`Tất cả (${stats.total})`} key="all">
            <Table 
              columns={columns} 
              dataSource={staff}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Đang hoạt động (${stats.active})`} key="active">
            <Table 
              columns={columns} 
              dataSource={staff.filter(s => s.status === 'active')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Bác sĩ (${stats.doctors})`} key="doctors">
            <Table 
              columns={columns} 
              dataSource={staff.filter(s => s.role === 'doctor')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Điều dưỡng (${stats.nurses})`} key="nurses">
            <Table 
              columns={columns} 
              dataSource={staff.filter(s => s.role === 'nurse')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="doctor">Bác sĩ</Option>
                  <Option value="nurse">Điều dưỡng</Option>
                  <Option value="caregiver">Người chăm sóc</Option>
                  <Option value="admin">Quản lý</Option>
                  <Option value="supervisor">Giám sát</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Khoa/Phòng"
                rules={[{ required: true, message: 'Vui lòng nhập khoa/phòng' }]}
              >
                <Input placeholder="Nhập khoa/phòng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shift"
                label="Ca làm việc"
                rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
              >
                <Select placeholder="Chọn ca làm việc">
                  <Option value="morning">Ca sáng</Option>
                  <Option value="afternoon">Ca chiều</Option>
                  <Option value="night">Ca đêm</Option>
                  <Option value="flexible">Linh hoạt</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hireDate"
                label="Ngày tuyển dụng"
                rules={[{ required: true, message: 'Vui lòng chọn ngày tuyển dụng' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="experience"
                label="Kinh nghiệm (năm)"
                rules={[{ required: true, message: 'Vui lòng nhập kinh nghiệm' }]}
              >
                <Input type="number" placeholder="Nhập số năm kinh nghiệm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qualifications"
            label="Bằng cấp/Chứng chỉ"
          >
            <Select
              mode="tags"
              placeholder="Nhập bằng cấp/chứng chỉ"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="specialties"
            label="Chuyên môn"
          >
            <Select
              mode="tags"
              placeholder="Nhập chuyên môn"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú về nhân viên..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStaff ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
