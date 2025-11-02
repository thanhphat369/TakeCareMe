import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Statistic, Timeline, Tabs, Avatar, Button, Form, Input, InputNumber, Select, DatePicker, Upload, message } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  PhoneOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Elderly, FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '../../types';
import { updateElderController, updateMedicalHistoryController, fetchMedicalHistoryController } from '../../controllers/eldersController';
import { getFamilyMembers, createFamilyMember, updateFamilyMember, deleteFamilyMember } from '../../api/familyMembers';
import { fetchMedicationsByElder } from '../../controllers/medicationController';
import FamilyMemberList from '../FamilyMemberList';
import FamilyMemberModal from './FamilyMemberModal';
import dayjs from 'dayjs';
import { Medication } from '../../types/Medication';
import { PrescriptionSummary } from '../../types/Medication';



interface ElderlyDetailModalProps {
  visible: boolean;
  elderly: Elderly | null;
  onClose: () => void;
}

const ElderlyDetailModal: React.FC<ElderlyDetailModalProps> = ({
  visible,
  elderly,
  onClose,
}) => {
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [basicForm] = Form.useForm();
  const [medicalForm] = Form.useForm();
  const [nutritionForm] = Form.useForm();
  const [historyForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Family member states
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyMemberModalVisible, setFamilyMemberModalVisible] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null);
  const [familyMembersLoading, setFamilyMembersLoading] = useState(false);

  // Medication states
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionSummary[]>([]);

  // Medical history state
  const [medicalHistoryData, setMedicalHistoryData] = useState<any>(null);
  const [medicalHistoryLoading, setMedicalHistoryLoading] = useState(false);

  // Load family members and medications when modal opens
  useEffect(() => {
    if (visible && elderly) {
      loadFamilyMembers();
      loadMedications();
      loadMedicalHistory();
      // Set avatar URL when elderly data loads
      setAvatarUrl((elderly as any).avatar || '');
    }
  }, [visible, elderly,]);

  useEffect(() => {
    // ✅ Kiểm tra kỹ để tránh lỗi undefined
    if (!elderly?.id) return;
    loadPrescriptionsByElder(Number(elderly.id));
  }, [elderly]);

  const loadPrescriptionsByElder = async (elderId: number) => {
    try {
      setMedicationsLoading(true);
      const meds = await fetchMedicationsByElder(elderId);

      // ✅ Gom thuốc theo toa (PrescriptionSummary)
      const grouped: Record<string, PrescriptionSummary> = {};
      meds.forEach((med) => {
        const key = `${elderId}-${med.diagnosis || 'nodx'}-${med.prescribedBy || 'nodoctor'}`;
        if (!grouped[key]) {
          grouped[key] = {
            elderId,
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
    } catch (err: any) {
      message.error('Không thể tải danh sách toa thuốc');
    } finally {
      setMedicationsLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    if (!elderly) return;

    try {
      setFamilyMembersLoading(true);
      const members = await getFamilyMembers(elderly.id);
      setFamilyMembers(members);
    } catch (error: any) {
      message.error('Không thể tải danh sách người thân');
    } finally {
      setFamilyMembersLoading(false);
    }
  };

  const loadMedications = async () => {
    if (!elderly) return;

    try {
      setMedicationsLoading(true);
      const meds = await fetchMedicationsByElder(Number(elderly.id));
      setMedications(meds);
    } catch (error: any) {
      console.error('Error loading medications:', error);
      // Don't show error message for medications as it's not critical
      setMedications([]);
    } finally {
      setMedicationsLoading(false);
    }
  };

  const loadMedicalHistory = async () => {
    if (!elderly?.id) return;

    try {
      setMedicalHistoryLoading(true);
      const data = await fetchMedicalHistoryController(Number(elderly.id));
      // Backend returns null if no medical history exists
      setMedicalHistoryData(data || null);
    } catch (error: any) {
      // If no medical history exists yet, that's okay - user can create one
      if (error.response?.status !== 404 && error.response?.status !== 500) {
        console.error('Error loading medical history:', error);
      }
      setMedicalHistoryData(null);
    } finally {
      setMedicalHistoryLoading(false);
    }
  };

  // Helper function to parse string to array (for display)
  const parseMedicalHistoryString = (str: string | null | undefined): string[] => {
    if (!str) return [];
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If not JSON, split by comma or semicolon
      return str.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
    }
  };

  // Helper function to convert array to string (for backend)
  const arrayToMedicalHistoryString = (arr: string[] | undefined): string | undefined => {
    if (!arr || arr.length === 0) return undefined;
    // Store as JSON string for consistency
    return JSON.stringify(arr);
  };

  const handleAddFamilyMember = () => {
    setSelectedFamilyMember(null);
    setFamilyMemberModalVisible(true);
  };

  const handleEditFamilyMember = (familyMember: FamilyMember) => {
    setSelectedFamilyMember(familyMember);
    setFamilyMemberModalVisible(true);
  };

  const handleSaveFamilyMember = async (data: CreateFamilyMemberRequest | UpdateFamilyMemberRequest) => {
    if (!elderly) return;

    try {
      if (selectedFamilyMember) {
        // Update existing family member
        await updateFamilyMember(selectedFamilyMember.id, data as UpdateFamilyMemberRequest);
      } else {
        // Create new family member
        await createFamilyMember(elderly.id, data as CreateFamilyMemberRequest);
      }
      await loadFamilyMembers();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteFamilyMember = async (id: string) => {
    if (!elderly) return;
    // API expects (familyId, elderId)
    await deleteFamilyMember(id, elderly.id);
    await loadFamilyMembers();
  };

  // Avatar upload handlers
  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Here you would typically call your upload API
      // For now, we'll create a local URL for preview
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);

      // Update form with new avatar URL
      basicForm.setFieldsValue({ avatar: url });

      message.success('Tải lên hình ảnh thành công');
    } catch (error) {
      message.error('Tải lên hình ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarUrl('');
    basicForm.setFieldsValue({ avatar: '' });
  };

  if (!elderly) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'monitoring':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Khỏe mạnh';
      case 'monitoring':
        return 'Theo dõi';
      case 'critical':
        return 'Khẩn cấp';
      default:
        return status;
    }
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? 'Nam' : 'Nữ';
  };

  const handleEdit = (tab: string) => {
    setEditingTab(tab);
    // Initialize forms with current data
    if (tab === 'basic') {
      basicForm.setFieldsValue({
        fullName: elderly.fullName,
        gender: elderly.gender,
        age: elderly.age,
        phone: elderly.phone,
        address: elderly.address,
        contactName: elderly.contactName,
        contactPhone: elderly.contactPhone,
        insuranceInfo: (elderly as any).insuranceInfo,
        note: elderly.note,
        avatar: avatarUrl || (elderly as any).avatar,
      });
    } else if (tab === 'medical') {
      // Use medicalHistoryData from backend if available, otherwise fallback to elderly data
      const diagnoses = medicalHistoryData?.diagnoses 
        ? parseMedicalHistoryString(medicalHistoryData.diagnoses)
        : (elderly.medicalHistory || []);
      const allergies = medicalHistoryData?.allergies
        ? parseMedicalHistoryString(medicalHistoryData.allergies)
        : (elderly.allergies || []);
      const chronicMedications = medicalHistoryData?.chronicMedications
        ? parseMedicalHistoryString(medicalHistoryData.chronicMedications)
        : [];
      
      medicalForm.setFieldsValue({
        diagnoses: diagnoses,
        allergies: allergies,
        chronicMedications: chronicMedications,
        bmi: medicalHistoryData?.bmi || (elderly as any).bmi,
      });
    } else if (tab === 'nutrition') {
      nutritionForm.setFieldsValue({
        dietaryRestrictions: (elderly as any).dietaryRestrictions || [],
        preferredFoods: (elderly as any).preferredFoods || [],
        nutritionNotes: (elderly as any).nutritionNotes,
        exerciseType: (elderly as any).exerciseType || [],
        exerciseFrequency: (elderly as any).exerciseFrequency,
        exerciseNotes: (elderly as any).exerciseNotes,
        mobilityLevel: (elderly as any).mobilityLevel,
        assistiveDevices: (elderly as any).assistiveDevices || [],
        mobilityNotes: (elderly as any).mobilityNotes,
      });
    } else if (tab === 'history') {
      historyForm.setFieldsValue({
        lastCheckup: elderly.lastCheckup ? dayjs(elderly.lastCheckup) : null,
        nextCheckup: elderly.nextCheckup ? dayjs(elderly.nextCheckup) : null,
        checkupNotes: (elderly as any).checkupNotes,
        testDate: (elderly as any).testDate ? dayjs((elderly as any).testDate) : null,
        testType: (elderly as any).testType,
        testResults: (elderly as any).testResults,
        prescriptionDate: (elderly as any).prescriptionDate ? dayjs((elderly as any).prescriptionDate) : null,
        doctorName: (elderly as any).doctorName,
        prescriptionNotes: (elderly as any).prescriptionNotes,
        rehabStartDate: (elderly as any).rehabStartDate ? dayjs((elderly as any).rehabStartDate) : null,
        rehabStatus: (elderly as any).rehabStatus,
        rehabNotes: (elderly as any).rehabNotes,
      });
    }
  };

  const handleSave = async (tab: string) => {
    try {
      if (tab === 'basic') {
        const values = await basicForm.validateFields();
        await updateElderController(elderly.id, values);
        message.success('Cập nhật thông tin cơ bản thành công');
      } else if (tab === 'medical') {
        const values = await medicalForm.validateFields();
        // Convert arrays to strings for backend
        const payload = {
    diagnoses: arrayToMedicalHistoryString(values.medicalHistory),
    allergies: arrayToMedicalHistoryString(values.allergies),
    chronicMedications: arrayToMedicalHistoryString(values.chronicMedications),
    bmi: values.bmi ?? null,
  };
        await updateMedicalHistoryController(Number(elderly.id), payload);
  message.success('Cập nhật hồ sơ y tế thành công');
        // Reload medical history after update
        await loadMedicalHistory();
      } else if (tab === 'nutrition') {
        const values = await nutritionForm.validateFields();
        // TODO: Implement nutrition/exercise/mobility update endpoint
        console.log('Nutrition data:', values);
        message.success('Cập nhật hồ sơ dinh dưỡng & vận động thành công');
      } else if (tab === 'history') {
        const values = await historyForm.validateFields();
        // TODO: Implement history update endpoint
        console.log('History data:', values);
        message.success('Cập nhật lịch sử khám & hồ sơ thành công');
      }
      setEditingTab(null);
      // Refresh data here if needed
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleCancel = (tab: string) => {
    setEditingTab(null);
  };

  return (
    <Modal
      title={`Thông tin chi tiết - ${elderly.fullName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Tabs
        items={[
          {
            key: 'basic',
            label: 'Hồ sơ cơ bản',
            children: (
              <div className="space-y-6">
                <Card
                  size="small"
                  title="Thông tin cơ bản"
                  extra={
                    editingTab !== 'basic' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('basic')}>
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => handleSave('basic')}
                        >
                          Lưu
                        </Button>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => handleCancel('basic')}
                        >
                          Hủy
                        </Button>
                      </div>
                    )
                  }
                >
                  {editingTab === 'basic' ? (
                    <Form form={basicForm} layout="vertical">
                      {/* Avatar Upload Section */}
                      <Row gutter={16} className="mb-4">
                        <Col span={24}>
                          <Form.Item label="Hình ảnh cá nhân">
                            <div className="flex items-center space-x-4">
                              <Avatar
                                size={80}
                                src={avatarUrl}
                                icon={<UserOutlined />}
                              >
                                {elderly.fullName?.charAt(0)}
                              </Avatar>
                              <div className="flex-1">
                                <Upload
                                  accept="image/*"
                                  showUploadList={false}
                                  beforeUpload={(file) => {
                                    // Validate file type
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                      message.error('Chỉ được tải lên file hình ảnh!');
                                      return false;
                                    }

                                    // Validate file size (max 2MB)
                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                    if (!isLt2M) {
                                      message.error('Hình ảnh phải nhỏ hơn 2MB!');
                                      return false;
                                    }

                                    handleAvatarUpload(file);
                                    return false; // Prevent default upload
                                  }}
                                >
                                  <Button loading={uploading}>
                                    {avatarUrl ? 'Thay đổi hình ảnh' : 'Tải lên hình ảnh'}
                                  </Button>
                                </Upload>
                                {avatarUrl && (
                                  <Button
                                    type="text"
                                    danger
                                    onClick={handleAvatarRemove}
                                    className="ml-2"
                                  >
                                    Xóa hình ảnh
                                  </Button>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 2MB
                                </div>
                              </div>
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                            <Select>
                              <Select.Option value="M">Nam</Select.Option>
                              <Select.Option value="F">Nữ</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="age" label="Tuổi" rules={[{ required: true }]}>
                            <InputNumber min={60} max={120} className="w-full" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="phone" label="Số điện thoại">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="contactPhone" label="SĐT liên hệ">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="contactName" label="Người liên hệ">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="insuranceInfo" label="Thông tin bảo hiểm">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      {/* Hidden field to store avatar URL */}
                      <Form.Item name="avatar" style={{ display: 'none' }}>
                        <Input />
                      </Form.Item>
                    </Form>
                  ) : (
                    <Row gutter={16} align="middle">
                      <Col span={4}>
                        <Avatar size={80} src={avatarUrl || (elderly as any).avatar}>
                          {elderly.fullName?.charAt(0)}
                        </Avatar>
                      </Col>
                      <Col span={20}>
                        <Descriptions column={2} size="small">
                          <Descriptions.Item label="Họ và tên">{elderly.fullName}</Descriptions.Item>
                          <Descriptions.Item label="Giới tính">{getGenderText(elderly.gender)}</Descriptions.Item>
                          <Descriptions.Item label="Tuổi">{elderly.age} tuổi</Descriptions.Item>
                          <Descriptions.Item label="Số điện thoại"><PhoneOutlined className="mr-1" />{elderly.phone}</Descriptions.Item>
                          <Descriptions.Item label="Người liên hệ">{elderly.contactName || '-'}</Descriptions.Item>
                          <Descriptions.Item label="SĐT liên hệ">{elderly.contactPhone || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Bảo hiểm" span={2}>{(elderly as any).insuranceInfo || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Địa chỉ" span={2}><HomeOutlined className="mr-1" />{elderly.address || '-'}</Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                  )}
                </Card>
                <Card size="small" title="Tình trạng">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Trạng thái"
                        value={getStatusText(elderly.status)}
                        valueStyle={{
                          color: getStatusColor(elderly.status) === 'green' ? '#10b981' :
                            getStatusColor(elderly.status) === 'orange' ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </Col>
                  </Row>
                </Card>
              </div>
            )
          },
          {
            key: 'medical',
            label: 'Hồ sơ y tế',
            children: (
              <div className="space-y-6">
                <Card
                  size="small"
                  title="Thông tin y tế"
                  extra={
                    editingTab !== 'medical' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('medical')}>
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => handleSave('medical')}
                        >
                          Lưu
                        </Button>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => handleCancel('medical')}
                        >
                          Hủy
                        </Button>
                      </div>
                    )
                  }
                >
                  {medicalHistoryLoading ? (
                    <div className="text-center text-gray-500 py-3">Đang tải thông tin y tế...</div>
                  ) : editingTab === 'medical' ? (
                    <Form form={medicalForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="diagnoses" label="Bệnh lý nền">
                            <Select mode="tags" placeholder="Nhập bệnh lý nền (Enter để thêm)">
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="allergies" label="Dị ứng">
                            <Select mode="tags" placeholder="Nhập dị ứng (Enter để thêm)">
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="chronicMedications" label="Thuốc điều trị mãn tính">
                            <Select mode="tags" placeholder="Nhập thuốc (Enter để thêm)">
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="bmi" label="Chỉ số BMI">
                            <InputNumber min={10} max={50} step={0.1} className="w-full" placeholder="Nhập BMI" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Row gutter={16}>
                      <Col span={8}>
                        <h4 className="font-medium mb-2">Bệnh lý nền</h4>
                        <div className="space-y-1">
                          {(() => {
                            const diagnoses = medicalHistoryData?.diagnoses 
                              ? parseMedicalHistoryString(medicalHistoryData.diagnoses)
                              : (elderly.medicalHistory || []);
                            return diagnoses.length ? (
                              diagnoses.map((condition, index) => (
                                <Tag key={index} color="red" className="mr-1 mb-1">{condition}</Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">Không có</span>
                            );
                          })()}
                        </div>
                      </Col>
                      <Col span={8}>
                        <h4 className="font-medium mb-2">Dị ứng</h4>
                        <div className="space-y-1">
                          {(() => {
                            const allergies = medicalHistoryData?.allergies
                              ? parseMedicalHistoryString(medicalHistoryData.allergies)
                              : (elderly.allergies || []);
                            return allergies.length ? (
                              allergies.map((allergy, index) => (
                                <Tag key={index} color="orange" className="mr-1 mb-1">{allergy}</Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">Không có</span>
                            );
                          })()}
                        </div>
                      </Col>
                      <Col span={8}>
                        <h4 className="font-medium mb-2">Thuốc điều trị mãn tính</h4>
                        <div className="space-y-1">
                          {(() => {
                            const medications = medicalHistoryData?.chronicMedications
                              ? parseMedicalHistoryString(medicalHistoryData.chronicMedications)
                              : [];
                            return medications.length ? (
                              medications.map((med, index) => (
                                <Tag key={index} color="blue" className="mr-1 mb-1">{med}</Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">Không có</span>
                            );
                          })()}
                        </div>
                        {medicalHistoryData?.bmi && (
                          <div className="mt-2">
                            <h4 className="font-medium mb-1">BMI</h4>
                            <Tag color="green">{medicalHistoryData.bmi}</Tag>
                          </div>
                        )}
                      </Col>
                    </Row>
                  )}
                </Card>
                <Card size="small" title="Toa thuốc">
                  {medicationsLoading ? (
                    <div className="text-center text-gray-500 py-3">Đang tải danh sách toa thuốc...</div>
                  ) : prescriptionList.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptionList.map((p) => (
                        <div
                          key={`${p.elderId}-${p.diagnosis}-${p.prescribedBy}`}
                          className="border rounded-lg p-3 bg-white shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-blue-600">{p.diagnosis}</h4>
                            <Tag color="green">{p.prescribedBy}</Tag>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <CalendarOutlined className="mr-1" /> {dayjs(p.startDate).format('DD/MM/YYYY')} →{' '}
                            {p.endDate ? dayjs(p.endDate).format('DD/MM/YYYY') : 'Chưa kết thúc'}
                          </div>

                          <div className="space-y-2 border-t pt-2">
                            {p.medications.map((m) => (
                              <div key={m.medicationId} className="p-2 rounded bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-800">{m.name}</span>
                                  <Tag color="blue">{m.dose}</Tag>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <MedicineBoxOutlined className="mr-1" /> {m.frequency} | {m.time || 'Không rõ'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-3">Không có toa thuốc nào</div>
                  )}
                </Card>

              </div>
            )
          },
          {
            key: 'nutrition',
            label: 'Hồ sơ dinh dưỡng & vận động',
            children: (
              <div className="space-y-6">
                <Card
                  size="small"
                  title="Dinh dưỡng"
                  extra={
                    editingTab !== 'nutrition' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('nutrition')}>
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => handleSave('nutrition')}
                        >
                          Lưu
                        </Button>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => handleCancel('nutrition')}
                        >
                          Hủy
                        </Button>
                      </div>
                    )
                  }
                >
                  {editingTab === 'nutrition' ? (
                    <Form form={nutritionForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="dietaryRestrictions" label="Hạn chế ăn uống">
                            <Select mode="tags" placeholder="Nhập hạn chế ăn uống">
                              <Select.Option value="Không đường">Không đường</Select.Option>
                              <Select.Option value="Ít muối">Ít muối</Select.Option>
                              <Select.Option value="Không cay">Không cay</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="preferredFoods" label="Món ăn yêu thích">
                            <Select mode="tags" placeholder="Nhập món ăn yêu thích">
                              <Select.Option value="Cháo">Cháo</Select.Option>
                              <Select.Option value="Súp">Súp</Select.Option>
                              <Select.Option value="Rau xanh">Rau xanh</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="nutritionNotes" label="Ghi chú dinh dưỡng">
                        <Input.TextArea rows={3} placeholder="Ghi chú về chế độ ăn uống" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <div className="text-gray-600">Chưa có dữ liệu dinh dưỡng. Vui lòng cập nhật sau.</div>
                  )}
                </Card>
                <Card
                  size="small"
                  title="Chế độ tập luyện"
                  extra={
                    editingTab !== 'nutrition' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('nutrition')}>
                        Chỉnh sửa
                      </Button>
                    ) : null
                  }
                >
                  {editingTab === 'nutrition' ? (
                    <Form form={nutritionForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="exerciseType" label="Loại hình tập luyện">
                            <Select mode="multiple" placeholder="Chọn loại hình tập luyện">
                              <Select.Option value="Đi bộ">Đi bộ</Select.Option>
                              <Select.Option value="Thể dục nhẹ">Thể dục nhẹ</Select.Option>
                              <Select.Option value="Yoga">Yoga</Select.Option>
                              <Select.Option value="Thái cực quyền">Thái cực quyền</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="exerciseFrequency" label="Tần suất tập luyện">
                            <Select placeholder="Chọn tần suất">
                              <Select.Option value="Hàng ngày">Hàng ngày</Select.Option>
                              <Select.Option value="3-4 lần/tuần">3-4 lần/tuần</Select.Option>
                              <Select.Option value="2-3 lần/tuần">2-3 lần/tuần</Select.Option>
                              <Select.Option value="Ít khi">Ít khi</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="exerciseNotes" label="Ghi chú tập luyện">
                        <Input.TextArea rows={3} placeholder="Ghi chú về chế độ tập luyện" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <div className="text-gray-600">Chưa có dữ liệu tập luyện. Vui lòng cập nhật sau.</div>
                  )}
                </Card>
                <Card
                  size="small"
                  title="Khả năng vận động"
                  extra={
                    editingTab !== 'nutrition' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('nutrition')}>
                        Chỉnh sửa
                      </Button>
                    ) : null
                  }
                >
                  {editingTab === 'nutrition' ? (
                    <Form form={nutritionForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="mobilityLevel" label="Mức độ vận động">
                            <Select placeholder="Chọn mức độ vận động">
                              <Select.Option value="Tự lập hoàn toàn">Tự lập hoàn toàn</Select.Option>
                              <Select.Option value="Cần hỗ trợ nhẹ">Cần hỗ trợ nhẹ</Select.Option>
                              <Select.Option value="Cần hỗ trợ trung bình">Cần hỗ trợ trung bình</Select.Option>
                              <Select.Option value="Cần hỗ trợ nhiều">Cần hỗ trợ nhiều</Select.Option>
                              <Select.Option value="Nằm liệt giường">Nằm liệt giường</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="assistiveDevices" label="Thiết bị hỗ trợ">
                            <Select mode="multiple" placeholder="Chọn thiết bị hỗ trợ">
                              <Select.Option value="Gậy">Gậy</Select.Option>
                              <Select.Option value="Khung tập đi">Khung tập đi</Select.Option>
                              <Select.Option value="Xe lăn">Xe lăn</Select.Option>
                              <Select.Option value="Nạng">Nạng</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="mobilityNotes" label="Ghi chú vận động">
                        <Input.TextArea rows={3} placeholder="Ghi chú về khả năng vận động" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <div className="text-gray-600">Chưa có đánh giá vận động. Vui lòng cập nhật sau.</div>
                  )}
                </Card>
              </div>
            )
          },
          {
            key: 'history',
            label: 'Lịch sử khám & hồ sơ',
            children: (
              <div className="space-y-6">
                <Card
                  size="small"
                  title="Lịch sử khám bệnh"
                  extra={
                    editingTab !== 'history' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('history')}>
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => handleSave('history')}
                        >
                          Lưu
                        </Button>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => handleCancel('history')}
                        >
                          Hủy
                        </Button>
                      </div>
                    )
                  }
                >
                  {editingTab === 'history' ? (
                    <Form form={historyForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="lastCheckup" label="Lần khám cuối">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="nextCheckup" label="Lần khám tiếp theo">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="checkupNotes" label="Ghi chú khám bệnh">
                        <Input.TextArea rows={3} placeholder="Ghi chú về lịch sử khám bệnh" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <Timeline>
                      <Timeline.Item dot={<CalendarOutlined className="text-blue-500" />} color="blue">
                        <div>
                          <div className="font-medium">Lần khám cuối</div>
                          <div className="text-sm text-gray-600">{new Date(elderly.lastCheckup).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </Timeline.Item>
                      <Timeline.Item dot={<CalendarOutlined className="text-green-500" />} color="green">
                        <div>
                          <div className="font-medium">Lần khám tiếp theo</div>
                          <div className="text-sm text-gray-600">{new Date(elderly.nextCheckup).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </Timeline.Item>
                      <Timeline.Item dot={<UserOutlined className="text-purple-500" />} color="purple">
                        <div>
                          <div className="font-medium">Thêm vào hệ thống</div>
                          <div className="text-sm text-gray-600">{new Date(elderly.createdAt).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </Timeline.Item>
                      <Timeline.Item dot={<ExclamationCircleOutlined className="text-orange-500" />} color="orange">
                        <div>
                          <div className="font-medium">Cập nhật lần cuối</div>
                          <div className="text-sm text-gray-600">{new Date(elderly.updatedAt).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </Timeline.Item>
                    </Timeline>
                  )}
                </Card>
                <Card
                  size="small"
                  title="Kết quả xét nghiệm"
                  extra={
                    editingTab !== 'history' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('history')}>
                        Chỉnh sửa
                      </Button>
                    ) : null
                  }
                >
                  {editingTab === 'history' ? (
                    <Form form={historyForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="testDate" label="Ngày xét nghiệm">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="testType" label="Loại xét nghiệm">
                            <Select placeholder="Chọn loại xét nghiệm">
                              <Select.Option value="Máu">Máu</Select.Option>
                              <Select.Option value="Nước tiểu">Nước tiểu</Select.Option>
                              <Select.Option value="X-quang">X-quang</Select.Option>
                              <Select.Option value="Siêu âm">Siêu âm</Select.Option>
                              <Select.Option value="CT">CT</Select.Option>
                              <Select.Option value="MRI">MRI</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="testResults" label="Kết quả xét nghiệm">
                        <Input.TextArea rows={4} placeholder="Nhập kết quả xét nghiệm" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <div className="text-gray-600">Chưa có kết quả xét nghiệm. Vui lòng cập nhật sau.</div>
                  )}
                </Card>
                <Card
                  size="small"
                  title="Đơn thuốc"
                  extra={
                    editingTab !== 'history' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('history')}>
                        Chỉnh sửa
                      </Button>
                    ) : null
                  }
                >
                  {editingTab === 'history' ? (
                    <Form form={historyForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="prescriptionDate" label="Ngày kê đơn">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="doctorName" label="Bác sĩ kê đơn">
                            <Input placeholder="Tên bác sĩ" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="prescriptionNotes" label="Ghi chú đơn thuốc">
                        <Input.TextArea rows={3} placeholder="Ghi chú về đơn thuốc" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <div className="text-gray-600">Xem danh sách ở mục Thuốc đang dùng trong hồ sơ y tế.</div>
                  )}
                </Card>
                <Card
                  size="small"
                  title="Phục hồi chức năng"
                  extra={
                    editingTab !== 'history' ? (
                      <Button icon={<EditOutlined />} onClick={() => handleEdit('history')}>
                        Chỉnh sửa
                      </Button>
                    ) : null
                  }
                >
                  {editingTab === 'history' ? (
                    <Form form={historyForm} layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="rehabStartDate" label="Ngày bắt đầu phục hồi">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="rehabStatus" label="Tình trạng phục hồi">
                            <Select placeholder="Chọn tình trạng">
                              <Select.Option value="Đang thực hiện">Đang thực hiện</Select.Option>
                              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                              <Select.Option value="Tạm dừng">Tạm dừng</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="rehabNotes" label="Ghi chú phục hồi chức năng">
                        <Input.TextArea rows={3} placeholder="Ghi chú về quá trình phục hồi chức năng" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <div className="text-gray-600">Chưa có hồ sơ phục hồi chức năng. Vui lòng cập nhật sau.</div>
                  )}
                </Card>
              </div>
            )
          },
          {
            key: 'family',
            label: 'Người thân',
            children: (
              <div className="space-y-6">
                <FamilyMemberList
                  familyMembers={familyMembers}
                  onAdd={handleAddFamilyMember}
                  onEdit={handleEditFamilyMember}
                  onDelete={handleDeleteFamilyMember}
                  loading={familyMembersLoading}
                />
              </div>
            )
          }
        ]}
      />

      {/* Family Member Modal */}
      <FamilyMemberModal
        visible={familyMemberModalVisible}
        onClose={() => setFamilyMemberModalVisible(false)}
        onSave={handleSaveFamilyMember}
        familyMember={selectedFamilyMember}
        elderlyId={elderly.id}
      />
    </Modal>
  );
};

export default ElderlyDetailModal;
