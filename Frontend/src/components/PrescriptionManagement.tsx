import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, Select, DatePicker, TimePicker,
  Row, Col, Card, Statistic, Popconfirm, message, Tag, Spin, Empty, Divider,
  Avatar, Badge
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, MedicineBoxOutlined,
  CalendarOutlined, ReloadOutlined, FileTextOutlined,
  UserOutlined, EyeOutlined, UserSwitchOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
// Controllers
import {
  fetchPrescriptions,
  fetchPrescriptionsByElder,
  createPrescription,
  updatePrescription,
  deletePrescription,
  fetchEldersController,
} from '../controllers/prescriptionController';
import { getUsers } from '../api/users';

// Types
import { Prescription, CreatePrescriptionRequest, MedicationItem } from '../types';

const { Option } = Select;

interface Elder {
  elderId: number;
  fullName: string;
  age?: number;
  gender?: string;
  phone?: string;
}

interface User {
  userId: number;
  fullName: string;
  role: string;
}

const PrescriptionManagement: React.FC = () => {
  // ==================== STATE ====================
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [elders, setElders] = useState<Elder[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // ==================== LOAD DATA ====================
  const loadElders = async () => {
    try {
      const data = await fetchEldersController();
      setElders(data);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await getUsers();
      // Filter to get only doctors and admins who can prescribe
      setDoctors(data.filter((user: any) => user.role === 'Doctor' || user.role === 'Admin'));
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      let data: Prescription[];

      if (selectedElderId) {
        // Load prescriptions for specific elder
        data = await fetchPrescriptionsByElder(selectedElderId);
      } else {
        // Load all prescriptions
        data = await fetchPrescriptions();
      }

      setPrescriptions(data);
    } catch (error: any) {
      message.error(error.message);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedElderId]);

  // Load elders and doctors on mount
  useEffect(() => {
    loadElders();
    loadDoctors();
  }, []);

  // Load prescriptions when elder selected
  useEffect(() => {
    if (selectedElderId) {
      loadPrescriptions();
    }
  }, [selectedElderId, loadPrescriptions]);

  // ==================== HANDLERS ====================
  const handleAdd = () => {
    setEditingPrescription(null);
    form.resetFields();
    
    // Pre-fill elder if one is selected
    if (selectedElderId) {
      form.setFieldsValue({ elderId: selectedElderId });
    }
    
    setIsModalVisible(true);
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);

    // Parse medications for form
    const medicationsFormData = prescription.medications?.map(med => ({
      ...med,
      time: med.time ? (() => {
        const times = med.time.split(' - ');
        if (times.length === 2) {
          return [dayjs(times[0], 'HH:mm'), dayjs(times[1], 'HH:mm')];
        }
        return null;
      })() : null,
    })) || [];

    form.setFieldsValue({
      elderId: prescription.elderId,
      prescribedBy: prescription.prescribedBy,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      prescriptionDate: prescription.prescriptionDate ? dayjs(prescription.prescriptionDate) : undefined,
      startDate: prescription.startDate ? dayjs(prescription.startDate) : undefined,
      endDate: prescription.endDate ? dayjs(prescription.endDate) : undefined,
      medications: medicationsFormData,
    });

    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePrescription(id);
      message.success('Xóa đơn thuốc thành công');
      loadPrescriptions();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Format medications
      const medications: MedicationItem[] = (values.medications || []).map((med: any) => ({
        name: med.name,
        dose: med.dose || undefined,
        frequency: med.frequency || undefined,
        time: Array.isArray(med.time) && med.time.length === 2 
          ? med.time.map((t: Dayjs) => t.format('HH:mm')).join(' - ')
          : undefined,
        notes: med.notes || undefined,
      }));

      const payload: CreatePrescriptionRequest = {
        elderId: Number(values.elderId),
        prescribedBy: Number(values.prescribedBy),
        diagnosis: values.diagnosis || undefined,
        notes: values.notes || undefined,
        prescriptionDate: values.prescriptionDate.format('YYYY-MM-DD'),
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        medications: medications,
      };

      if (editingPrescription) {
        await updatePrescription(editingPrescription.prescriptionId, payload);
        message.success('Cập nhật đơn thuốc thành công');
      } else {
        await createPrescription(payload);
        message.success('Tạo đơn thuốc mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadPrescriptions();
    } catch (error: any) {
      if (error.errorFields) {
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
    setEditingPrescription(null);
  };

  const handleRefresh = () => {
    loadPrescriptions();
  };

  // ==================== HELPERS ====================
  const getPrescriptionStatus = (prescription: Prescription) => {
    const today = dayjs();

    if (prescription.endDate && dayjs(prescription.endDate).isBefore(today)) {
      return { label: 'Đã hoàn thành', color: 'green' };
    }

    if (prescription.startDate && dayjs(prescription.startDate).isAfter(today)) {
      return { label: 'Chưa bắt đầu', color: 'orange' };
    }

    return { label: 'Đang điều trị', color: 'blue' };
  };

  // ==================== STATISTICS ====================
  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter(
      (p) => !p.endDate || dayjs(p.endDate).isAfter(dayjs())
    ).length,
    completed: prescriptions.filter(
      (p) => p.endDate && dayjs(p.endDate).isBefore(dayjs())
    ).length,
    upcoming: prescriptions.filter(
      (p) => p.startDate && dayjs(p.startDate).isAfter(dayjs())
    ).length,
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      title: 'Mã đơn thuốc',
      dataIndex: 'prescriptionId',
      key: 'prescriptionId',
      width: 120,
      render: (id: number) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span className="font-medium">#{id}</span>
        </Space>
      ),
    },
    {
      title: 'Người cao tuổi',
      key: 'elder',
      width: 200,
      render: (_: any, record: Prescription) => {
        const elder = record.elder || elders.find((e) => e.elderId === record.elderId);
        return elder ? (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{elder.fullName}</span>
          </Space>
        ) : '-';
      },
    },
    {
      title: 'Bác sĩ kê toa',
      key: 'prescriber',
      width: 180,
      render: (_: any, record: Prescription) => {
        const prescriber = record.prescriber || doctors.find((d) => d.userId === record.prescribedBy);
        return prescriber ? (
          <Space>
            <UserSwitchOutlined style={{ color: '#52c41a' }} />
            <span>{prescriber.fullName}</span>
          </Space>
        ) : '-';
      },
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Số thuốc',
      key: 'medicationCount',
      width: 100,
      render: (_: any, record: Prescription) => (
        <Badge count={record.medications?.length || 0} showZero color="#52c41a">
          <MedicineBoxOutlined />
        </Badge>
      ),
    },
    {
      title: 'Ngày kê toa',
      dataIndex: 'prescriptionDate',
      key: 'prescriptionDate',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_: any, record: Prescription) => {
        const status = getPrescriptionStatus(record);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Prescription) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Xem
          </Button>
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
            description="Bạn có chắc chắn muốn xóa đơn thuốc này?"
            onConfirm={() => handleDelete(record.prescriptionId)}
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
              Quản lý đơn thuốc
            </h1>
            <p className="text-gray-600">
              Quản lý đơn thuốc và kê toa thuốc cho người cao tuổi
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
              Tạo đơn thuốc mới
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
                title="Tổng số đơn thuốc"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#0ea5e9' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang điều trị"
                value={stats.active}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
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
            {prescriptions.length > 0 ? (
              <Table
                columns={columns}
                dataSource={prescriptions}
                rowKey="prescriptionId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Tổng ${total} đơn thuốc`,
                }}
                scroll={{ x: 1400 }}
              />
            ) : (
              <Empty
                description={
                  selectedElderId
                    ? 'Chưa có đơn thuốc nào cho người cao tuổi này'
                    : 'Chọn người cao tuổi để xem danh sách đơn thuốc'
                }
              />
            )}
          </Spin>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          editingPrescription ? 'Chỉnh sửa đơn thuốc' : 'Tạo đơn thuốc mới'
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={1000}
        confirmLoading={submitting}
        okText={editingPrescription ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                name="prescribedBy"
                label="Bác sĩ kê toa"
                rules={[
                  { required: true, message: 'Vui lòng chọn bác sĩ kê toa' },
                ]}
              >
                <Select
                  placeholder="Chọn bác sĩ"
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {doctors.map((doctor) => (
                    <Option key={doctor.userId} value={doctor.userId}>
                      <Space>
                        <UserSwitchOutlined />
                        {doctor.fullName} ({doctor.role})
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prescriptionDate" label="Ngày kê toa" rules={[
                { required: true, message: 'Vui lòng chọn ngày kê toa' },
              ]}>
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="diagnosis" label="Chẩn đoán">
                <Input placeholder="Nhập chẩn đoán" />
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
            rules={[{ max: 500, message: 'Ghi chú tối đa 500 ký tự' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú về đơn thuốc"
            />
          </Form.Item>

          <Divider>Danh sách thuốc</Divider>
          
          <Form.List name="medications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" className="mb-4">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Tên thuốc"
                          rules={[{ required: true, message: 'Nhập tên thuốc' }]}
                        >
                          <Input placeholder="Tên thuốc" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dose']}
                          label="Liều lượng"
                        >
                          <Input placeholder="VD: 500mg" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'frequency']}
                          label="Tần suất"
                        >
                          <Select placeholder="Tần suất">
                            <Option value="1 lần/ngày">1 lần/ngày</Option>
                            <Option value="2 lần/ngày">2 lần/ngày</Option>
                            <Option value="3 lần/ngày">3 lần/ngày</Option>
                            <Option value="Theo chỉ định">Theo chỉ định</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item label=" ">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          >
                            Xóa
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'time']}
                          label="Thời gian uống"
                        >
                          <TimePicker.RangePicker 
                            format="HH:mm" 
                            className="w-full"
                            placeholder={['Bắt đầu', 'Kết thúc']}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                          label="Ghi chú"
                        >
                          <Input placeholder="Ghi chú về thuốc" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm thuốc
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};
export default PrescriptionManagement;
// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   Table, Button, Space, Modal, Form, Input, Select, DatePicker, TimePicker,
//   Row, Col, Card, Statistic, Popconfirm, message, Tag, Spin, Empty, Divider,
//   Avatar, Badge
// } from 'antd';
// import {
//   EditOutlined, DeleteOutlined, PlusOutlined, MedicineBoxOutlined,
//   CalendarOutlined, ReloadOutlined, FileTextOutlined,
//   UserOutlined, EyeOutlined, UserSwitchOutlined, TeamOutlined
// } from '@ant-design/icons';
// import dayjs, { Dayjs } from 'dayjs';
// // Controllers
// import {
//   fetchPrescriptions,
//   fetchPrescriptionsByElder,
//   createPrescription,
//   updatePrescription,
//   deletePrescription,
//   fetchEldersController,
// } from '../controllers/prescriptionController';
// import type { Staff } from '../api/staff';
// import { getUsers } from '../api/users';
// import { getStaffs } from '../api/staff';// 👈 API mới để lấy danh sách nhân viên

// // Types
// import { Prescription, CreatePrescriptionRequest, MedicationItem } from '../types';

// const { Option } = Select;

// interface Elder {
//   elderId: number;
//   fullName: string;
//   age?: number;
//   gender?: string;
//   phone?: string;
// }

// interface User {
//   userId: number;
//   fullName: string;
//   role: string;
// }

// // interface Staff {
// //   staffId: number;
// //   fullName: string;
// //   department?: string;
// // }

// const PrescriptionManagement: React.FC = () => {
//   // ==================== STATE ====================
//   const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
//   const [elders, setElders] = useState<Elder[]>([]);
//   const [doctors, setDoctors] = useState<User[]>([]);
//   const [staffs, setStaffs] = useState<Staff[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
//   const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
//   const [form] = Form.useForm();

//   // ==================== LOAD DATA ====================
//   const loadElders = async () => {
//     try {
//       const data = await fetchEldersController();
//       setElders(data);
//     } catch (error: any) {
//       message.error(error.message);
//     }
//   };

//   const loadDoctors = async () => {
//     try {
//       const data = await getUsers();
//       setDoctors(data.filter((user: any) => user.role === 'Doctor' || user.role === 'Admin'));
//     } catch (error: any) {
//       message.error(error.message);
//     }
//   };

//   const loadStaffs = async () => {
//     try {
//       const data = await getStaffs();
//       setStaffs(data);
//     } catch (error: any) {
//       message.error(error.message);
//     }
//   };

//   const loadPrescriptions = useCallback(async () => {
//     try {
//       setLoading(true);
//       let data: Prescription[];

//       if (selectedElderId) {
//         data = await fetchPrescriptionsByElder(selectedElderId);
//       } else {
//         data = await fetchPrescriptions();
//       }

//       setPrescriptions(data);
//     } catch (error: any) {
//       message.error(error.message);
//       setPrescriptions([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedElderId]);

//   useEffect(() => {
//     loadElders();
//     loadDoctors();
//     loadStaffs();
//   }, []);

//   useEffect(() => {
//     if (selectedElderId) {
//       loadPrescriptions();
//     }
//   }, [selectedElderId, loadPrescriptions]);

//   // ==================== HANDLERS ====================
//   const handleAdd = () => {
//     setEditingPrescription(null);
//     form.resetFields();
//     if (selectedElderId) form.setFieldsValue({ elderId: selectedElderId });
//     setIsModalVisible(true);
//   };

//   const handleEdit = (prescription: Prescription) => {
//     setEditingPrescription(prescription);
//     const medicationsFormData = prescription.medications?.map((med) => ({
//       ...med,
//       time: med.time
//         ? (() => {
//             const times = med.time.split(' - ');
//             return times.length === 2
//               ? [dayjs(times[0], 'HH:mm'), dayjs(times[1], 'HH:mm')]
//               : null;
//           })()
//         : null,
//       staffInCharge: med.staff?.staffId || med.staffInCharge || null,
//     })) || [];

//     form.setFieldsValue({
//       elderId: prescription.elderId,
//       prescribedBy: prescription.prescribedBy,
//       diagnosis: prescription.diagnosis,
//       notes: prescription.notes,
//       prescriptionDate: prescription.prescriptionDate
//         ? dayjs(prescription.prescriptionDate)
//         : undefined,
//       startDate: prescription.startDate ? dayjs(prescription.startDate) : undefined,
//       endDate: prescription.endDate ? dayjs(prescription.endDate) : undefined,
//       medications: medicationsFormData,
//     });

//     setIsModalVisible(true);
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await deletePrescription(id);
//       message.success('Xóa đơn thuốc thành công');
//       loadPrescriptions();
//     } catch (error: any) {
//       message.error(error.message);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setSubmitting(true);
//       const values = await form.validateFields();

//       const medications: MedicationItem[] = (values.medications || []).map((med: any) => ({
//         name: med.name,
//         dose: med.dose || undefined,
//         frequency: med.frequency || undefined,
//         time:
//           Array.isArray(med.time) && med.time.length === 2
//             ? med.time.map((t: Dayjs) => t.format('HH:mm')).join(' - ')
//             : undefined,
//         notes: med.notes || undefined,
//         staffInCharge: med.staffInCharge || null, // 👈 thêm staff phụ trách
//       }));

//       const payload: CreatePrescriptionRequest = {
//         elderId: Number(values.elderId),
//         prescribedBy: Number(values.prescribedBy),
//         diagnosis: values.diagnosis || undefined,
//         notes: values.notes || undefined,
//         prescriptionDate: values.prescriptionDate.format('YYYY-MM-DD'),
//         startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
//         endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
//         medications,
//       };

//       if (editingPrescription) {
//         await updatePrescription(editingPrescription.prescriptionId, payload);
//         message.success('Cập nhật đơn thuốc thành công');
//       } else {
//         await createPrescription(payload);
//         message.success('Tạo đơn thuốc mới thành công');
//       }

//       setIsModalVisible(false);
//       form.resetFields();
//       loadPrescriptions();
//     } catch (error: any) {
//       if (error.errorFields) {
//         message.error('Vui lòng kiểm tra lại thông tin');
//       } else {
//         message.error(error.message);
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//     form.resetFields();
//     setEditingPrescription(null);
//   };

//   const handleRefresh = () => loadPrescriptions();

//   // ==================== TABLE ====================
//   const columns = [
//     {
//       title: 'Mã đơn thuốc',
//       dataIndex: 'prescriptionId',
//       key: 'prescriptionId',
//       width: 120,
//       render: (id: number) => (
//         <Space>
//           <FileTextOutlined style={{ color: '#1890ff' }} />
//           <span className="font-medium">#{id}</span>
//         </Space>
//       ),
//     },
//     {
//       title: 'Người cao tuổi',
//       key: 'elder',
//       width: 200,
//       render: (_: any, record: Prescription) => {
//         const elder = record.elder || elders.find((e) => e.elderId === record.elderId);
//         return elder ? (
//           <Space>
//             <Avatar size="small" icon={<UserOutlined />} />
//             <span>{elder.fullName}</span>
//           </Space>
//         ) : '-';
//       },
//     },
//     {
//       title: 'Bác sĩ kê toa',
//       key: 'prescriber',
//       width: 180,
//       render: (_: any, record: Prescription) => {
//         const prescriber =
//           record.prescriber || doctors.find((d) => d.userId === record.prescribedBy);
//         return prescriber ? (
//           <Space>
//             <UserSwitchOutlined style={{ color: '#52c41a' }} />
//             <span>{prescriber.fullName}</span>
//           </Space>
//         ) : '-';
//       },
//     },
//     {
//       title: 'Chẩn đoán',
//       dataIndex: 'diagnosis',
//       key: 'diagnosis',
//       width: 200,
//       ellipsis: true,
//       render: (text: string) => text || '-',
//     },
//     {
//       title: 'Số thuốc',
//       key: 'medicationCount',
//       width: 100,
//       render: (_: any, record: Prescription) => (
//         <Badge count={record.medications?.length || 0} showZero color="#52c41a">
//           <MedicineBoxOutlined />
//         </Badge>
//       ),
//     },
//     {
//       title: 'Ngày kê toa',
//       dataIndex: 'prescriptionDate',
//       key: 'prescriptionDate',
//       width: 120,
//       render: (date: string) => (
//         <Space>
//           <CalendarOutlined />
//           {dayjs(date).format('DD/MM/YYYY')}
//         </Space>
//       ),
//     },
//   ];

//   // ==================== RENDER ====================
//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-[1600px] mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-1">Quản lý đơn thuốc</h1>
//             <p className="text-gray-600">Quản lý đơn thuốc và kê toa thuốc cho người cao tuổi</p>
//           </div>
//           <Space>
//             <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
//               Làm mới
//             </Button>
//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               onClick={handleAdd}
//               size="large"
//             >
//               Tạo đơn thuốc mới
//             </Button>
//           </Space>
//         </div>

//         {/* Table */}
//         <Card>
//           <Spin spinning={loading}>
//             {prescriptions.length > 0 ? (
//               <Table
//                 columns={columns}
//                 dataSource={prescriptions}
//                 rowKey="prescriptionId"
//                 pagination={{ pageSize: 10 }}
//                 scroll={{ x: 1400 }}
//               />
//             ) : (
//               <Empty description="Chưa có đơn thuốc nào" />
//             )}
//           </Spin>
//         </Card>
//       </div>

//       {/* Modal thêm/sửa đơn */}
//       <Modal
//         title={editingPrescription ? 'Chỉnh sửa đơn thuốc' : 'Tạo đơn thuốc mới'}
//         open={isModalVisible}
//         onOk={handleSubmit}
//         onCancel={handleCancel}
//         width={1000}
//         confirmLoading={submitting}
//         okText={editingPrescription ? 'Cập nhật' : 'Tạo mới'}
//         cancelText="Hủy"
//       >
//         <Form form={form} layout="vertical" className="mt-4">
//           {/* --- Các thông tin chính --- */}
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="elderId"
//                 label="Người cao tuổi"
//                 rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
//               >
//                 <Select placeholder="Chọn người cao tuổi" showSearch>
//                   {elders.map((elder) => (
//                     <Option key={elder.elderId} value={elder.elderId}>
//                       {elder.fullName} {elder.age && `(${elder.age} tuổi)`}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="prescribedBy"
//                 label="Bác sĩ kê toa"
//                 rules={[{ required: true, message: 'Vui lòng chọn bác sĩ kê toa' }]}
//               >
//                 <Select placeholder="Chọn bác sĩ" showSearch>
//                   {doctors.map((doctor) => (
//                     <Option key={doctor.userId} value={doctor.userId}>
//                       <UserSwitchOutlined /> {doctor.fullName}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           {/* --- Danh sách thuốc --- */}
//           <Divider>Danh sách thuốc</Divider>
//           <Form.List name="medications">
//             {(fields, { add, remove }) => (
//               <>
//                 {fields.map(({ key, name, ...restField }) => (
//                   <Card key={key} size="small" className="mb-4 border border-gray-200">
//                     <Row gutter={16}>
//                       <Col span={8}>
//                         <Form.Item
//                           {...restField}
//                           name={[name, 'name']}
//                           label="Tên thuốc"
//                           rules={[{ required: true, message: 'Nhập tên thuốc' }]}
//                         >
//                           <Input placeholder="Tên thuốc" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={6}>
//                         <Form.Item {...restField} name={[name, 'dose']} label="Liều lượng">
//                           <Input placeholder="VD: 500mg" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={6}>
//                         <Form.Item {...restField} name={[name, 'frequency']} label="Tần suất">
//                           <Select placeholder="Tần suất">
//                             <Option value="1 lần/ngày">1 lần/ngày</Option>
//                             <Option value="2 lần/ngày">2 lần/ngày</Option>
//                             <Option value="3 lần/ngày">3 lần/ngày</Option>
//                             <Option value="Theo chỉ định">Theo chỉ định</Option>
//                           </Select>
//                         </Form.Item>
//                       </Col>
//                       <Col span={4}>
//                         <Button
//                           type="text"
//                           danger
//                           icon={<DeleteOutlined />}
//                           onClick={() => remove(name)}
//                         >
//                           Xóa
//                         </Button>
//                       </Col>
//                     </Row>

//                     <Row gutter={16}>
//                       <Col span={8}>
//                         <Form.Item {...restField} name={[name, 'time']} label="Thời gian uống">
//                           <TimePicker.RangePicker format="HH:mm" className="w-full" />
//                         </Form.Item>
//                       </Col>
//                       {/* <Col span={8}>
//                         <Form.Item
//                           {...restField}
//                           name={[name, 'staffInCharge']}
//                           label="Nhân viên phụ trách"
//                         >
//                           <Select placeholder="Chọn nhân viên">
//                             {staffs.map((s) => (
//                               <Option key={s.staffId} value={s.staffId}>
//                                 <TeamOutlined /> {s.fullName}{' '}
//                                 {s.department && `(${s.department})`}
//                               </Option>
//                             ))}
//                           </Select>
//                         </Form.Item>
//                       </Col> */}
//                       <Col span={8}>
//                         <Form.Item {...restField} name={[name, 'notes']} label="Ghi chú">
//                           <Input placeholder="Ghi chú về thuốc" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Card>
//                 ))}
//                 <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
//                   Thêm thuốc
//                 </Button>
//               </>
//             )}
//           </Form.List>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default PrescriptionManagement;