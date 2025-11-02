import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, Select, DatePicker,
  Row, Col, Card, Statistic, message, Spin, Empty, Divider,Popconfirm
} from 'antd';
import {
 DeleteOutlined, PlusOutlined, MedicineBoxOutlined, ReloadOutlined,
 EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fetchElders,
  fetchDoctors,
  fetchMedications,
  fetchMedicationsByElder,
  createMedication,
  updateMedication,
  deleteMedication,
} from '../controllers/medicationController';
import { Medication, Elder, Doctor, PrescriptionSummary } from '../types/Medication';

const { Option } = Select;

const MedicationManagement: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionSummary[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionSummary | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [elders, setElders] = useState<Elder[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadPrescriptions();
  }, []);

  useEffect(() => {
    loadMedications();
    loadPrescriptions();
  }, [selectedElderId]);

  // ===================== LOAD DATA =====================
  const loadData = async () => {
    try {
      setLoading(true);
      const [eldersData, doctorsData] = await Promise.all([
        fetchElders(),
        fetchDoctors(),
      ]);
      setElders(eldersData);
      setDoctors(doctorsData);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = selectedElderId
        ? await fetchMedicationsByElder(selectedElderId)
        : await fetchMedications();
      setMedications(data);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const meds: Medication[] = selectedElderId
        ? await fetchMedicationsByElder(selectedElderId) // 👈 chỉ lấy theo Elder
        : await fetchMedications();

      const grouped: Record<string, PrescriptionSummary> = {};
      meds.forEach((med) => {
        const key = `${med.elderId}-${med.diagnosis || 'nodx'}-${med.prescribedBy || 'nodoctor'}`;

        if (!grouped[key]) {
          grouped[key] = {
            elderId: med.elderId,
            elderName: med.elder?.fullName || 'Không rõ',
            diagnosis: med.diagnosis || 'Không có chẩn đoán',
            prescribedBy: med.prescriber?.fullName || 'Không rõ',
            startDate: med.startDate,
            endDate: med.endDate,
            medications: [],
          };
        }

        grouped[key].medications.push(med);
      });

      setPrescriptionList(Object.values(grouped));

      // 👉 cập nhật lại thống kê theo elder
      const total = meds.length;
      const active = meds.filter(
        (m) => !m.endDate || dayjs(m.endDate).isAfter(dayjs())
      ).length;
      const expired = total - active;

      setStats({ total, active, expired });
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách toa thuốc');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (record: PrescriptionSummary) => {
    setSelectedPrescription(record);
    setIsDetailModalVisible(true);
  };

  // ===================== ADD / EDIT =====================
  const handleAdd = () => {
    setEditingMedication(null);
    form.resetFields();
    if (selectedElderId) form.setFieldsValue({ elderId: selectedElderId });
    setIsFormModalVisible(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    form.setFieldsValue({
      elderId: medication.elderId,
      diagnosis: medication.diagnosis,
      prescribedBy: medication.prescribedBy,
      startDate: medication.startDate ? dayjs(medication.startDate) : null,
      endDate: medication.endDate ? dayjs(medication.endDate) : null,
      notes: medication.notes,
      medications: [
        {
          name: medication.name,
          dose: medication.dose,
          frequency: medication.frequency,
          time: medication.time,
          notes: medication.notes,
        },
      ],
    });
    setIsFormModalVisible(true);
  };

  // ===================== DELETE =====================
  const handleDelete = async (id: number) => {
    try {
      await deleteMedication(id);
      message.success('Xóa thuốc thành công');
      loadMedications();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // ===================== SUBMIT FORM =====================
  const handleSubmit = async () => {
  try {
    setSubmitting(true);
    const values = await form.validateFields();
    const { medications, ...baseInfo } = values;

    if (!medications || medications.length === 0) {
      message.warning('Vui lòng thêm ít nhất một thuốc.');
      return;
    }

    // Nếu đang sửa
    if (editingMedication) {
      const med = medications[0];
      const payload = {
        elderId: Number(baseInfo.elderId),
        name: med.name,
        dose: med.dose || undefined,
        diagnosis: baseInfo.diagnosis,
        frequency: med.frequency || undefined,
        time: med.time || undefined,
        startDate: baseInfo.startDate ? dayjs(baseInfo.startDate).toISOString() : undefined,
        endDate: baseInfo.endDate ? dayjs(baseInfo.endDate).toISOString() : undefined,
        notes: med.notes || baseInfo.notes || undefined,
        prescribedBy: baseInfo.prescribedBy ? Number(baseInfo.prescribedBy) : undefined,
      };

      await updateMedication(editingMedication.medicationId, payload);
      message.success('Cập nhật thuốc thành công');
    } else {
      // Nếu là thêm mới
      for (const med of medications) {
        const payload = {
          elderId: Number(baseInfo.elderId),
          name: med.name,
          dose: med.dose || undefined,
          diagnosis: baseInfo.diagnosis,
          frequency: med.frequency || undefined,
          time: med.time || undefined,
          startDate: baseInfo.startDate ? dayjs(baseInfo.startDate).toISOString() : undefined,
          endDate: baseInfo.endDate ? dayjs(baseInfo.endDate).toISOString() : undefined,
          notes: med.notes || baseInfo.notes || undefined,
          prescribedBy: baseInfo.prescribedBy ? Number(baseInfo.prescribedBy) : undefined,
        };

        await createMedication(payload);
      }
      message.success('Thêm thuốc thành công');
    }

    // ✅ Đóng form + load lại danh sách
    setIsFormModalVisible(false);
    form.resetFields();
    await loadPrescriptions();

  } catch (error: any) {
    if (!error.errorFields) message.error(error.message || 'Lỗi khi lưu thuốc');
  } finally {
    setSubmitting(false);
  }
};


  // 🔹 Xác định trạng thái thuốc
  const getMedicationStatus = (medication: Medication) => {
    if (!medication.endDate) return { label: 'Đang dùng', color: 'green' };
    const today = dayjs();
    const endDate = dayjs(medication.endDate);
    return endDate.isBefore(today)
      ? { label: 'Đã hết hạn', color: 'red' }
      : { label: 'Đang dùng', color: 'green' };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Quản lý thuốc</h1>
            <p className="text-gray-600">Theo dõi và quản lý thuốc cho người cao tuổi</p>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadMedications} loading={loading}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
              Thêm thuốc
            </Button>
          </Space>
        </div>

        {/* Filter by Elder */}
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
                onChange={setSelectedElderId} // 👈 khi đổi Elder sẽ tự trigger useEffect
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {elders.map((elder) => (
                  <Option key={elder.elderId} value={elder.elderId}>
                    {elder.fullName} {elder.age && `(${elder.age} tuổi)`}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số thuốc"
                value={stats.total}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#0ea5e9' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Đang sử dụng" value={stats.active} valueStyle={{ color: '#10b981' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Đã hết hạn" value={stats.expired} valueStyle={{ color: '#ef4444' }} />
            </Card>
          </Col>
        </Row>
      </div>
      {/* Danh sách toa thuốc */}
      <Card>
        <Spin spinning={loading}>
          {prescriptionList.length > 0 ? (
            <Table
              columns={[
                { title: 'Người cao tuổi', dataIndex: 'elderName', key: 'elderName' },
                { title: 'Chẩn đoán', dataIndex: 'diagnosis', key: 'diagnosis' },
                { title: 'Bác sĩ kê toa', dataIndex: 'prescribedBy', key: 'prescribedBy' },
                {
                  title: 'Số lượng thuốc',
                  key: 'count',
                  render: (_, record: PrescriptionSummary) => record.medications.length,
                },
                {
                  title: 'Ngày bắt đầu',
                  dataIndex: 'startDate',
                  render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
                },
                {
                  title: 'Ngày kết thúc',
                  dataIndex: 'endDate',
                  render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
                },
                {
                  title: 'Hành động',
                  key: 'action',
                  render: (_, record: PrescriptionSummary) => (
                     <Button icon={<EyeOutlined />} type="text"  onClick={() => showDetail(record)} />
                  ),
                },
              ]}
              dataSource={prescriptionList}
              rowKey={(r) => `${r.elderId}-${r.diagnosis}-${r.prescribedBy}`}
              pagination={false}
            />
          ) : (
            <Empty description="Chưa có toa thuốc nào" />
          )}
        </Spin>
      </Card>

      <Modal
  title={`Chi tiết toa thuốc - ${selectedPrescription?.elderName || ''}`}
  open={isDetailModalVisible}
  onCancel={() => setIsDetailModalVisible(false)}
  footer={null}
  width={850}
>
  {selectedPrescription ? (
    <>
      <p><strong>Chẩn đoán:</strong> {selectedPrescription.diagnosis}</p>
      <p><strong>Bác sĩ kê toa:</strong> {selectedPrescription.prescribedBy}</p>

      <Table
        dataSource={selectedPrescription.medications}
        rowKey="medicationId"
        pagination={false}
        columns={[
          { title: 'Tên thuốc', dataIndex: 'name' },
          { title: 'Liều lượng', dataIndex: 'dose' },
          { title: 'Tần suất', dataIndex: 'frequency' },
          { title: 'Thời gian uống', dataIndex: 'time' },
          { title: 'Ghi chú', dataIndex: 'notes' },
          {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Medication) => (
              <Space>
                {/* 👁️ Xem hoặc mở chỉnh sửa nhanh */}
                <Button
                  icon={<EyeOutlined />}
                  type="text"
                  onClick={() => {
                    setEditingMedication(record);
                    form.setFieldsValue({
                      elderId: record.elderId,
                      prescribedBy: record.prescribedBy,
                      diagnosis: record.diagnosis,
                      startDate: record.startDate ? dayjs(record.startDate) : undefined,
                      endDate: record.endDate ? dayjs(record.endDate) : undefined,
                      notes: record.notes,
                      medications: [
                        {
                          name: record.name,
                          dose: record.dose,
                          frequency: record.frequency,
                          time: record.time,
                          notes: record.notes,
                        },
                      ],
                    });
                    setIsFormModalVisible(true);
                    setIsDetailModalVisible(false);
                  }}
                />

                {/* ✏️ Nút Sửa */}
                <Button
                  icon={<MedicineBoxOutlined />}
                  type="text"
                  onClick={() => {
                    handleEdit(record);
                    setIsDetailModalVisible(false);
                  }}
                />

                {/* ❌ Nút Xóa */}
                <Popconfirm
                  title="Xóa thuốc này?"
                  okText="Có"
                  cancelText="Không"
                  onConfirm={async () => {
                    await handleDelete(record.medicationId);
                    // Cập nhật lại danh sách hiển thị trong modal
                    setSelectedPrescription((prev) =>
                      prev
                        ? {
                            ...prev,
                            medications: prev.medications.filter(
                              (m) => m.medicationId !== record.medicationId
                            ),
                          }
                        : prev
                    );
                    loadPrescriptions();
                  }}
                >
                  <Button icon={<DeleteOutlined />} type="text" danger />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </>
  ) : (
    <Empty description="Không có dữ liệu" />
  )}
</Modal>
      {/* Modal thêm/sửa */}
      <Modal
        title={editingMedication ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}
        open={isFormModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsFormModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={1000}
        okText={editingMedication ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="elderId"
                label="Người cao tuổi"
                rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
              >
                <Select placeholder="Chọn người cao tuổi">
                  {elders.map((elder) => (
                    <Option key={elder.elderId} value={elder.elderId}>
                      {elder.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="prescribedBy"
                label="Bác sĩ kê toa"
                rules={[{ required: true, message: 'Vui lòng chọn bác sĩ kê toa' }]}
              >
                <Select placeholder="Chọn bác sĩ" allowClear showSearch>
                  {doctors.map((doc) => (
                    <Option key={doc.userId} value={doc.userId}>
                      {doc.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
                          <Select placeholder="Tần suất">
                            <Option value="Sáng">Sáng</Option>
                            <Option value="Sáng - Chiều">Sáng - Trưa</Option>
                            <Option value="Sáng - Trưa - Tối">Sáng - Trưa - Tối</Option>
                            <Option value="Theo chỉ định">Theo chỉ định</Option>
                          </Select>
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

export default MedicationManagement;
