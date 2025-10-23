// import React, { useState, useEffect } from 'react';
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
//   Alert,
//   Tabs,
//   message,
//   Spin
// } from 'antd';
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   MedicineBoxOutlined,
//   ExclamationCircleOutlined,
//   ReloadOutlined,
// } from '@ant-design/icons';
// import dayjs from 'dayjs';

// const { Option } = Select;
// const { TabPane } = Tabs;
// const { confirm } = Modal;

// interface Medication {
//   medicationId: number;
//   elderId: number;
//   name: string;
//   dose: string;
//   frequency: string;
//   startDate: string;
//   endDate?: string;
//   notes?: string;
//   prescribedBy?: number;
//   elder?: {
//     elderId: number;
//     fullName: string;
//   };
//   status?: 'active' | 'completed' | 'expired';
// }

// interface Elder {
//   elderId: number;
//   fullName: string;
// }

// // Cấu hình API base URL
// const API_BASE_URL = 'http://localhost:3000/api';

// const MedicationManagement: React.FC = () => {
//   const [medications, setMedications] = useState<Medication[]>([]);
//   const [elders, setElders] = useState<Elder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
//   const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
//   const [form] = Form.useForm();

//   // Load dữ liệu khi component mount
//   useEffect(() => {
//     fetchElders();
//   }, []);

//   useEffect(() => {
//     if (selectedElderId) {
//       fetchMedications(selectedElderId);
//     }
//   }, [selectedElderId]);

//   // Lấy token từ localStorage
//   const getAuthToken = () => {
//     return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
//   };

//   // API Helper function với authentication
//   const apiRequest = async (url: string, options: RequestInit = {}) => {
//     try {
//       const token = getAuthToken();

//       const response = await fetch(url, {
//         ...options,
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//           ...options.headers,
//         },
//       });

//       if (response.status === 401) {
//         message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
//         // Redirect to login if needed
//         // window.location.href = '/login';
//         throw new Error('Unauthorized');
//       }

//       if (!response.ok) {
//         const error = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
//         throw new Error(error.message || 'API request failed');
//       }

//       return await response.json();
//     } catch (error: any) {
//       throw error;
//     }
//   };

//   // Lấy danh sách người cao tuổi
//   const fetchElders = async () => {
//     try {
//       setLoading(true);
//       const data = await apiRequest(`${API_BASE_URL}/elders`);
//       setElders(data);
//       if (data.length > 0 && !selectedElderId) {
//         setSelectedElderId(data[0].elderId);
//       }
//     } catch (error: any) {
//       if (error.message !== 'Unauthorized') {
//         message.error('Không thể tải danh sách người cao tuổi');
//       }
//       console.error('Error fetching elders:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Lấy danh sách thuốc theo người cao tuổi
//   const fetchMedications = async (elderId: number) => {
//     try {
//       setLoading(true);
//       const data = await apiRequest(`${API_BASE_URL}/medications/elder/${elderId}`);
//       const medicationsWithStatus = data.map((med: Medication) => ({
//         ...med,
//         status: getMedicationStatus(med)
//       }));
//       setMedications(medicationsWithStatus);
//     } catch (error: any) {
//       if (error.message !== 'Unauthorized') {
//         message.error('Không thể tải danh sách thuốc');
//       }
//       console.error('Error fetching medications:', error);
//       setMedications([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Xác định trạng thái thuốc
//   const getMedicationStatus = (medication: Medication): 'active' | 'completed' | 'expired' => {
//     const today = dayjs();
//     if (medication.endDate) {
//       const endDate = dayjs(medication.endDate);
//       if (endDate.isBefore(today)) {
//         return 'completed';
//       }
//     }
//     if (medication.startDate) {
//       const startDate = dayjs(medication.startDate);
//       if (startDate.isAfter(today)) {
//         return 'expired';
//       }
//     }
//     return 'active';
//   };

//   // Thêm thuốc mới
//   const handleAdd = () => {
//     setEditingMedication(null);
//     form.resetFields();
//     form.setFieldsValue({ elderId: selectedElderId });
//     setIsModalVisible(true);
//   };

//   // Sửa thuốc
//   const handleEdit = (medication: Medication) => {
//     setEditingMedication(medication);
//     form.setFieldsValue({
//       ...medication,
//       startDate: medication.startDate ? dayjs(medication.startDate) : null,
//       endDate: medication.endDate ? dayjs(medication.endDate) : null,
//     });
//     setIsModalVisible(true);
//   };

//   // Xóa thuốc
//   const handleDelete = (medicationId: number) => {
//     confirm({
//       title: 'Xác nhận xóa',
//       icon: <ExclamationCircleOutlined />,
//       content: 'Bạn có chắc chắn muốn xóa thuốc này?',
//       okText: 'Xóa',
//       okType: 'danger',
//       cancelText: 'Hủy',
//       async onOk() {
//         try {
//           await apiRequest(`${API_BASE_URL}/medications/${medicationId}`, {
//             method: 'DELETE',
//           });
//           message.success('Xóa thuốc thành công');
//           if (selectedElderId) {
//             fetchMedications(selectedElderId);
//           }
//         } catch (error: any) {
//           if (error.message !== 'Unauthorized') {
//             message.error('Không thể xóa thuốc');
//           }
//           console.error('Error deleting medication:', error);
//         }
//       },
//     });
//   };

//   // Submit form (thêm hoặc sửa)
//   const handleSubmit = async (values: any) => {
//     try {
//       setLoading(true);
//       const medicationData = {
//         ...values,
//         startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
//         endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
//       };

//       if (editingMedication) {
//         // Cập nhật
//         await apiRequest(
//           `${API_BASE_URL}/medications/${editingMedication.medicationId}`,
//           {
//             method: 'PUT',
//             body: JSON.stringify(medicationData),
//           }
//         );
//         message.success('Cập nhật thuốc thành công');
//       } else {
//         // Thêm mới
//         await apiRequest(`${API_BASE_URL}/medications`, {
//           method: 'POST',
//           body: JSON.stringify(medicationData),
//         });
//         message.success('Thêm thuốc mới thành công');
//       }

//       setIsModalVisible(false);
//       form.resetFields();
//       if (selectedElderId) {
//         fetchMedications(selectedElderId);
//       }
//     } catch (error: any) {
//       if (error.message !== 'Unauthorized') {
//         message.error(error.message || 'Có lỗi xảy ra');
//       }
//       console.error('Error submitting medication:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const statusColors = {
//     active: 'green',
//     completed: 'blue',
//     expired: 'orange'
//   };

//   const statusLabels = {
//     active: 'Đang dùng',
//     completed: 'Đã hoàn thành',
//     expired: 'Chưa bắt đầu'
//   };

//   const columns = [
//     {
//       title: 'Tên thuốc',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text: string) => (
//         <Space>
//           <MedicineBoxOutlined style={{ color: '#1890ff' }} />
//           <span style={{ fontWeight: 500 }}>{text}</span>
//         </Space>
//       ),
//     },
//     {
//       title: 'Liều lượng',
//       dataIndex: 'dose',
//       key: 'dose',
//       render: (dose: string) => dose || '-',
//     },
//     {
//       title: 'Tần suất',
//       dataIndex: 'frequency',
//       key: 'frequency',
//       render: (frequency: string) => frequency || '-',
//     },
//     {
//       title: 'Ngày bắt đầu',
//       dataIndex: 'startDate',
//       key: 'startDate',
//       render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
//     },
//     {
//       title: 'Ngày kết thúc',
//       dataIndex: 'endDate',
//       key: 'endDate',
//       render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
//     },
//     {
//       title: 'Trạng thái',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status: keyof typeof statusColors) => (
//         <Tag color={statusColors[status]}>
//           {statusLabels[status]}
//         </Tag>
//       ),
//     },
//     {
//       title: 'Hành động',
//       key: 'action',
//       width: 150,
//       render: (_: any, record: Medication) => (
//         <Space>
//           <Button 
//             type="link" 
//             size="small"
//             icon={<EditOutlined />}
//             onClick={() => handleEdit(record)}
//           >
//             Sửa
//           </Button>
//           <Button 
//             type="link" 
//             size="small"
//             danger 
//             icon={<DeleteOutlined />}
//             onClick={() => handleDelete(record.medicationId)}
//           >
//             Xóa
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   const getStatistics = () => {
//     const total = medications.length;
//     const active = medications.filter(m => m.status === 'active').length;
//     const completed = medications.filter(m => m.status === 'completed').length;
//     const expired = medications.filter(m => m.status === 'expired').length;

//     return { total, active, completed, expired };
//   };

//   const stats = getStatistics();

//   return (
//     <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
//       <div style={{ maxWidth: 1400, margin: '0 auto' }}>
//         <div style={{ marginBottom: 24 }}>
//           <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
//             Quản lý thuốc
//           </h1>
//           <p style={{ color: '#6b7280', fontSize: 14 }}>
//             Quản lý thuốc và lịch uống thuốc cho người cao tuổi
//           </p>
//         </div>

//         {/* Chọn người cao tuổi */}
//         <Card style={{ marginBottom: 24 }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div style={{ flex: 1 }}>
//               <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
//                 Chọn người cao tuổi
//               </label>
//               <Select
//                 style={{ width: 300 }}
//                 placeholder="Chọn người cao tuổi"
//                 value={selectedElderId}
//                 onChange={(value) => setSelectedElderId(value)}
//                 loading={loading}
//                 disabled={elders.length === 0}
//               >
//                 {elders.map(elder => (
//                   <Option key={elder.elderId} value={elder.elderId}>
//                     {elder.fullName}
//                   </Option>
//                 ))}
//               </Select>
//             </div>
//             <Button 
//               icon={<ReloadOutlined />}
//               onClick={() => selectedElderId && fetchMedications(selectedElderId)}
//               loading={loading}
//             >
//               Làm mới
//             </Button>
//           </div>
//         </Card>

//         {/* Statistics */}
//         {selectedElderId && (
//           <>
//             <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
//               <Col xs={24} sm={12} md={6}>
//                 <Card>
//                   <Statistic
//                     title="Tổng số thuốc"
//                     value={stats.total}
//                     prefix={<MedicineBoxOutlined />}
//                     valueStyle={{ color: '#1890ff' }}
//                   />
//                 </Card>
//               </Col>
//               <Col xs={24} sm={12} md={6}>
//                 <Card>
//                   <Statistic
//                     title="Đang dùng"
//                     value={stats.active}
//                     valueStyle={{ color: '#52c41a' }}
//                   />
//                 </Card>
//               </Col>
//               <Col xs={24} sm={12} md={6}>
//                 <Card>
//                   <Statistic
//                     title="Đã hoàn thành"
//                     value={stats.completed}
//                     valueStyle={{ color: '#1890ff' }}
//                   />
//                 </Card>
//               </Col>
//               <Col xs={24} sm={12} md={6}>
//                 <Card>
//                   <Statistic
//                     title="Chưa bắt đầu"
//                     value={stats.expired}
//                     valueStyle={{ color: '#fa8c16' }}
//                   />
//                 </Card>
//               </Col>
//             </Row>

//             {/* Main Content */}
//             <Card>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                 <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Danh sách thuốc</h2>
//                 <Button 
//                   type="primary" 
//                   icon={<PlusOutlined />}
//                   onClick={handleAdd}
//                   disabled={!selectedElderId}
//                 >
//                   Thêm thuốc mới
//                 </Button>
//               </div>

//               <Spin spinning={loading}>
//                 <Tabs defaultActiveKey="all">
//                   <TabPane tab={`Tất cả (${stats.total})`} key="all">
//                     <Table 
//                       columns={columns} 
//                       dataSource={medications}
//                       rowKey="medicationId"
//                       pagination={{ pageSize: 10 }}
//                       scroll={{ x: 'max-content' }}
//                     />
//                   </TabPane>
//                   <TabPane tab={`Đang dùng (${stats.active})`} key="active">
//                     <Table 
//                       columns={columns} 
//                       dataSource={medications.filter(m => m.status === 'active')}
//                       rowKey="medicationId"
//                       pagination={{ pageSize: 10 }}
//                       scroll={{ x: 'max-content' }}
//                     />
//                   </TabPane>
//                   <TabPane tab={`Đã hoàn thành (${stats.completed})`} key="completed">
//                     <Table 
//                       columns={columns} 
//                       dataSource={medications.filter(m => m.status === 'completed')}
//                       rowKey="medicationId"
//                       pagination={{ pageSize: 10 }}
//                       scroll={{ x: 'max-content' }}
//                     />
//                   </TabPane>
//                 </Tabs>
//               </Spin>
//             </Card>
//           </>
//         )}

//         {!selectedElderId && elders.length > 0 && (
//           <Card>
//             <Alert
//               message="Chưa chọn người cao tuổi"
//               description="Vui lòng chọn người cao tuổi để xem danh sách thuốc"
//               type="info"
//               showIcon
//             />
//           </Card>
//         )}

//         {elders.length === 0 && !loading && (
//           <Card>
//             <Alert
//               message="Không có dữ liệu"
//               description="Chưa có người cao tuổi nào trong hệ thống hoặc phiên đăng nhập đã hết hạn"
//               type="warning"
//               showIcon
//             />
//           </Card>
//         )}
//       </div>

//       {/* Add/Edit Modal */}
//       <Modal
//         title={editingMedication ? 'Sửa thông tin thuốc' : 'Thêm thuốc mới'}
//         open={isModalVisible}
//         onCancel={() => {
//           setIsModalVisible(false);
//           form.resetFields();
//         }}
//         footer={null}
//         width={600}
//         destroyOnClose
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleSubmit}
//         >
//           <Form.Item
//             name="elderId"
//             label="Người cao tuổi"
//             rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
//           >
//             <Select placeholder="Chọn người cao tuổi">
//               {elders.map(elder => (
//                 <Option key={elder.elderId} value={elder.elderId}>
//                   {elder.fullName}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="name"
//             label="Tên thuốc"
//             rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
//           >
//             <Input placeholder="Nhập tên thuốc" maxLength={100} />
//           </Form.Item>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="dose"
//                 label="Liều lượng"
//               >
//                 <Input placeholder="Ví dụ: 1 viên, 5ml" maxLength={50} />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="frequency"
//                 label="Tần suất"
//               >
//                 <Select placeholder="Chọn tần suất">
//                   <Option value="Hàng ngày">Hàng ngày</Option>
//                   <Option value="2 lần/ngày">2 lần/ngày</Option>
//                   <Option value="3 lần/ngày">3 lần/ngày</Option>
//                   <Option value="1 lần/tuần">1 lần/tuần</Option>
//                   <Option value="Theo chỉ định">Theo chỉ định</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="startDate"
//                 label="Ngày bắt đầu"
//               >
//                 <DatePicker 
//                   format="DD/MM/YYYY"
//                   placeholder="Chọn ngày bắt đầu"
//                   style={{ width: '100%' }}
//                 />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="endDate"
//                 label="Ngày kết thúc"
//               >
//                 <DatePicker 
//                   format="DD/MM/YYYY"
//                   placeholder="Chọn ngày kết thúc"
//                   style={{ width: '100%' }}
//                 />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Form.Item
//             name="notes"
//             label="Ghi chú"
//           >
//             <Input.TextArea 
//               rows={3} 
//               placeholder="Ghi chú về thuốc, cách dùng..."
//               maxLength={255}
//             />
//           </Form.Item>

//           <Form.Item style={{ marginBottom: 0 }}>
//             <Space>
//               <Button type="primary" htmlType="submit" loading={loading}>
//                 {editingMedication ? 'Cập nhật' : 'Thêm mới'}
//               </Button>
//               <Button onClick={() => {
//                 setIsModalVisible(false);
//                 form.resetFields();
//               }}>
//                 Hủy
//               </Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default MedicationManagement;
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  Card,
  Statistic,
  Popconfirm,
  message,
  Tag,
  Spin,
  Empty,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

// Controllers
import {
  fetchMedications,
  fetchMedicationsByElder,
  createMedication,
  updateMedication,
  deleteMedication,
  fetchEldersController,
} from '../controllers/medicationController';

// Types
import { Medication } from '../types/Medication';

const { Option } = Select;

interface Elder {
  elderId: number;
  fullName: string;
  age?: number;
  gender?: string;
  phone?: string;
}

const MedicationManagement: React.FC = () => {
  // ==================== STATE ====================
  const [medications, setMedications] = useState<Medication[]>([]);
  const [elders, setElders] = useState<Elder[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // ==================== LOAD DATA ====================
  const loadElders = async () => {
    try {
      const data = await fetchEldersController();
      setElders(data);
      
      // Auto-select first elder if none selected
      if (data.length > 0 && !selectedElderId) {
        setSelectedElderId(data[0].elderId);
      }
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const loadMedications = async () => {
    try {
      setLoading(true);
      let data: Medication[];

      if (selectedElderId) {
        // Load medications for specific elder
        data = await fetchMedicationsByElder(selectedElderId);
      } else {
        // Load all medications
        data = await fetchMedications();
      }

      setMedications(data);
    } catch (error: any) {
      message.error(error.message);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load elders on mount
  useEffect(() => {
    loadElders();
  }, []);

  // Load medications when elder selected
  useEffect(() => {
    if (selectedElderId) {
      loadMedications();
    }
  }, [selectedElderId]);

  // ==================== HANDLERS ====================
  const handleAdd = () => {
    setEditingMedication(null);
    form.resetFields();
    
    // Pre-fill elder if one is selected
    if (selectedElderId) {
      form.setFieldsValue({ elderId: selectedElderId });
    }
    
    setIsModalVisible(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);

    // Parse time range if exists
    let timeRange: [Dayjs, Dayjs] | undefined;
    if (medication.time) {
      const times = medication.time.split(' - ');
      if (times.length === 2) {
        timeRange = [
          dayjs(times[0], 'HH:mm'),
          dayjs(times[1], 'HH:mm'),
        ];
      }
    }

    form.setFieldsValue({
      elderId: medication.elderId,
      name: medication.name,
      dose: medication.dose,
      frequency: medication.frequency,
      time: timeRange,
      startDate: medication.startDate ? dayjs(medication.startDate) : undefined,
      endDate: medication.endDate ? dayjs(medication.endDate) : undefined,
      notes: medication.notes,
    });

    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedication(id);
      message.success('Xóa thuốc thành công');
      loadMedications();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Format time range
      let timeRange: string | null = null;
      if (Array.isArray(values.time) && values.time.length === 2) {
        timeRange = values.time
          .map((t: Dayjs) => t.format('HH:mm'))
          .join(' - ');
      }

      const payload: Partial<Medication> = {
        elderId: Number(values.elderId),
        name: values.name,
        dose: values.dose || null,
        frequency: values.frequency || null,
        time: timeRange,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        notes: values.notes || null,
      };

      if (editingMedication) {
        await updateMedication(editingMedication.medicationId, payload);
        message.success('Cập nhật thuốc thành công');
      } else {
        await createMedication(payload);
        message.success('Thêm thuốc mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadMedications();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMedication(null);
  };

  const handleRefresh = () => {
    loadMedications();
  };

  // ==================== HELPERS ====================
  const getMedicationStatus = (medication: Medication) => {
    const today = dayjs();

    if (medication.endDate && dayjs(medication.endDate).isBefore(today)) {
      return { label: 'Đã hết hạn', color: 'red' };
    }

    if (
      medication.startDate &&
      dayjs(medication.startDate).isAfter(today)
    ) {
      return { label: 'Chưa bắt đầu', color: 'orange' };
    }

    return { label: 'Đang sử dụng', color: 'green' };
  };

  // ==================== STATISTICS ====================
  const stats = {
    total: medications.length,
    active: medications.filter(
      (m) => !m.endDate || dayjs(m.endDate).isAfter(dayjs())
    ).length,
    expired: medications.filter(
      (m) => m.endDate && dayjs(m.endDate).isBefore(dayjs())
    ).length,
    upcoming: medications.filter(
      (m) => m.startDate && dayjs(m.startDate).isAfter(dayjs())
    ).length,
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#1890ff' }} />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Người cao tuổi',
      key: 'elder',
      width: 150,
      render: (_: any, record: Medication) => {
        const elder =
          record.elder || elders.find((e) => e.elderId === record.elderId);
        return elder ? elder.fullName : '-';
      },
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dose',
      key: 'dose',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 130,
      render: (text: string) => text || '-',
    },
    {
      title: 'Thời gian uống',
      dataIndex: 'time',
      key: 'time',
      width: 140,
      render: (text: string) =>
        text ? (
          <Space>
            <ClockCircleOutlined />
            {text}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) =>
        date ? (
          <Space>
            <CalendarOutlined />
            {dayjs(date).format('DD/MM/YYYY')}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) =>
        date ? (
          <Space>
            <CalendarOutlined />
            {dayjs(date).format('DD/MM/YYYY')}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_: any, record: Medication) => {
        const status = getMedicationStatus(record);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Medication) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa thuốc này?"
            onConfirm={() => handleDelete(record.medicationId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ==================== RENDER ====================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Quản lý thuốc
            </h1>
            <p className="text-gray-600">
              Theo dõi và quản lý lịch dùng thuốc của người cao tuổi
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm thuốc mới
            </Button>
          </Space>
        </div>

        {/* Elder Selection */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo người cao tuổi
              </label>
              <Select
                style={{ width: 300 }}
                placeholder="Chọn người cao tuổi"
                value={selectedElderId}
                onChange={(value) => setSelectedElderId(value)}
                allowClear
                onClear={() => setSelectedElderId(null)}
                showSearch
                filterOption={(input, option) => {
                  const label = String(option?.label || '');
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {elders.map((elder) => (
                  <Option key={elder.elderId} value={elder.elderId}>
                    {elder.fullName}
                    {elder.age && ` (${elder.age} tuổi)`}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số thuốc"
                value={stats.total}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#0ea5e9' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang sử dụng"
                value={stats.active}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã hết hạn"
                value={stats.expired}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chưa bắt đầu"
                value={stats.upcoming}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card>
          <Spin spinning={loading}>
            {medications.length > 0 ? (
              <Table
                columns={columns}
                dataSource={medications}
                rowKey="medicationId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Tổng ${total} thuốc`,
                }}
                scroll={{ x: 1400 }}
              />
            ) : (
              <Empty
                description={
                  selectedElderId
                    ? 'Chưa có thuốc nào được thêm cho người cao tuổi này'
                    : 'Chọn người cao tuổi để xem danh sách thuốc'
                }
              />
            )}
          </Spin>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          editingMedication ? 'Chỉnh sửa thông tin thuốc' : 'Thêm thuốc mới'
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        confirmLoading={submitting}
        okText={editingMedication ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="elderId"
                label="Người cao tuổi"
                rules={[
                  { required: true, message: 'Vui lòng chọn người cao tuổi' },
                ]}
              >
                <Select
                  placeholder="Chọn người cao tuổi"
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {elders.map((elder) => (
                    <Option key={elder.elderId} value={elder.elderId}>
                      {elder.fullName}
                      {elder.age && ` (${elder.age} tuổi)`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên thuốc"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên thuốc' },
                  { max: 100, message: 'Tên thuốc tối đa 100 ký tự' },
                ]}
              >
                <Input placeholder="Nhập tên thuốc" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dose"
                label="Liều lượng"
                rules={[{ max: 50, message: 'Liều lượng tối đa 50 ký tự' }]}
              >
                <Input placeholder="VD: 500mg, 1 viên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="frequency" label="Tần suất">
                <Select placeholder="Chọn tần suất">
                  <Option value="1 lần/ngày">1 lần/ngày</Option>
                  <Option value="2 lần/ngày">2 lần/ngày</Option>
                  <Option value="3 lần/ngày">3 lần/ngày</Option>
                  <Option value="1 lần/tuần">1 lần/tuần</Option>
                  <Option value="Theo chỉ định">Theo chỉ định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Thời gian uống"
                rules={[
                  { required: true, message: 'Vui lòng chọn thời gian uống' },
                ]}
              >
                <TimePicker.RangePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[{ max: 255, message: 'Ghi chú tối đa 255 ký tự' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú nếu có (cách dùng, lưu ý đặc biệt...)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationManagement;