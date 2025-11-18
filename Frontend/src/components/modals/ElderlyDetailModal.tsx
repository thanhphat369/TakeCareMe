import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Statistic, Timeline, Tabs, Avatar, Button, Form, Input, InputNumber, Select, DatePicker, Upload, message, Space } from 'antd';
import {
  UserOutlined, HeartOutlined, PhoneOutlined, HomeOutlined, MedicineBoxOutlined, CalendarOutlined, ExclamationCircleOutlined, EditOutlined, SaveOutlined,
  CloseOutlined, PlusOutlined, DeleteOutlined, TeamOutlined, MailOutlined
} from '@ant-design/icons';
import { Elderly, FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '../../types';
import { updateElder, fetchEldersController, getElder, updateMedicalHistory } from '../../api/elders';
import { getFamilyMembers, createFamilyMember, updateFamilyMember, deleteFamilyMember, getPrimaryFamilyMember } from '../../api/familyMembers';
import { compressImage } from '../../utils/imageCompress';
import apiClient from '../../api/apiClient';
import {
  getAllHealthProfiles, createNutritionProfile, updateNutritionProfile, createExerciseProfile,
  updateExerciseProfile, createMobilityProfile, updateMobilityProfile
} from '../../api/healthProfiles';
import { fetchMedicationsByElder } from '../../controllers/medicationController';
import FamilyMemberList from '../FamilyMemberList';
import FamilyMemberModal from './FamilyMemberModal';
import dayjs from 'dayjs';
import { Medication } from '../../types/Medication';
import { PrescriptionSummary } from '../../types/Medication';
import { 
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  Appointment, CreateAppointmentDto 
} from '../../api/appointments';
import { 
  getLabResults, createLabResult, updateLabResult, deleteLabResult,
  LabResult, CreateLabResultDto 
} from '../../api/labResults';
import { 
  getRehabilitationRecords, createRehabilitationRecord, updateRehabilitationRecord, deleteRehabilitationRecord,
  RehabilitationRecord, CreateRehabilitationRecordDto 
} from '../../api/rehabilitationRecords';
import { Table, Popconfirm, Radio, Spin } from 'antd';
import { FileTextOutlined, DownloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { fetchVitalReadings, VitalReadingDto } from '../../api/vitals';
import { getAlertsByElder, getAlertStatistics, Alert } from '../../api/alerts';
import { downloadReport } from '../../api/reports';
import VitalSignsChart from '../charts/VitalSignsChart';
import MedicationFrequencyChart from '../charts/MedicationFrequencyChart';
import BMIProgressionChart from '../charts/BMIProgressionChart';
import { getUsers } from '../../api/users';
import { User } from '../../types';


// Định nghĩa kiểu dữ liệu cho ElderlyDetailModal
interface ElderlyDetailModalProps {
  visible: boolean;
  elderly: Elderly | null;
  onClose: () => void;
  onUpdate?: () => void; // Callback để reload danh sách elders từ parent
}
// Định nghĩa component ElderlyDetailModal
const ElderlyDetailModal: React.FC<ElderlyDetailModalProps> = ({
  visible,
  elderly,
  onClose,
  onUpdate,
}) => {
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [basicForm] = Form.useForm();
  const [medicalForm] = Form.useForm();
  const [nutritionForm] = Form.useForm();
  const [exerciseForm] = Form.useForm();
  const [mobilityForm] = Form.useForm();
  const [historyForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);


  const [elderDetail, setElderDetail] = useState<Elderly | null>(null);
  // Family members states
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyMemberModalVisible, setFamilyMemberModalVisible] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null);
  const [familyMembersLoading, setFamilyMembersLoading] = useState(false);
  const [primaryFamilyMember, setPrimaryFamilyMember] = useState<FamilyMember | null>(null);

  // Nutrition / Exercise / Mobility tab control
  const [activeProfile, setActiveProfile] = useState<'nutrition' | 'exercise' | 'mobility'>('nutrition');
  const [healthProfiles, setHealthProfiles] = useState<any>(null);
  const [healthProfilesLoading, setHealthProfilesLoading] = useState(false);

  // Medication states
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionSummary[]>([]);

  // Medical history state
  const [medicalHistoryData, setMedicalHistoryData] = useState<any>(null);
  const [medicalHistoryLoading, setMedicalHistoryLoading] = useState(false);

  // Appointments, Lab Results, Rehabilitation Records states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentForm] = Form.useForm();

  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [labResultsLoading, setLabResultsLoading] = useState(false);
  const [labResultModalVisible, setLabResultModalVisible] = useState(false);
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null);
  const [labResultForm] = Form.useForm();

  const [rehabilitationRecords, setRehabilitationRecords] = useState<RehabilitationRecord[]>([]);
  const [rehabilitationRecordsLoading, setRehabilitationRecordsLoading] = useState(false);
  const [rehabilitationRecordModalVisible, setRehabilitationRecordModalVisible] = useState(false);
  const [selectedRehabilitationRecord, setSelectedRehabilitationRecord] = useState<RehabilitationRecord | null>(null);
  const [rehabilitationRecordForm] = Form.useForm();

  // Reports states
  const [vitalReadings, setVitalReadings] = useState<VitalReadingDto[]>([]);
  const [vitalReadingsLoading, setVitalReadingsLoading] = useState(false);
  const [vitalPeriod, setVitalPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertStats, setAlertStats] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('basic');
  
  // Doctors state
  const [doctors, setDoctors] = useState<User[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Load tất cả dữ liệu khi modal mở
  useEffect(() => {
    if (visible && elderly) {
      loadFamilyMembers();
      loadMedications();
      loadMedicalHistory();
      loadHealthProfiles();
      loadElderDetail();
      loadAppointments();
      loadLabResults();
      loadRehabilitationRecords();
      loadVitalReadings();
      loadAlerts();
      loadDoctors();
      // Set avatar URL when elderly data loads - extract relative path if it's a full URL
      let avatarPath = (elderly as any).avatar || '';
      if (avatarPath && avatarPath.startsWith('http')) {
        try {
          const urlObj = new URL(avatarPath);
          avatarPath = urlObj.pathname;
        } catch {
          // If URL parsing fails, keep original
        }
      }
      setAvatarUrl(avatarPath);
    }
  }, [visible, elderly,]);

  // Reload dữ liệu khi tab "history" được chọn
  useEffect(() => {
    if (visible && elderly?.id && activeTab === 'history') {
      // Reload dữ liệu khi chuyển sang tab history
      loadAppointments();
      loadLabResults();
      loadRehabilitationRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, visible, elderly?.id]);

  // Load toa thuốc khi elderly thay đổi
  useEffect(() => {
    // ✅ Kiểm tra kỹ để tránh lỗi undefined
    if (!elderly?.id) return;
    loadPrescriptionsByElder(Number(elderly.id));
  }, [elderly]);

  const loadElderDetail = async () => {
    if (!elderly?.id) return;
    try {
      const data = await getElder(Number(elderly.id));
      setElderDetail(data);
      // Cập nhật avatar URL từ dữ liệu mới - extract relative path if it's a full URL
      if (data && (data as any).avatar) {
        let avatarPath = (data as any).avatar;
        if (avatarPath && avatarPath.startsWith('http')) {
          try {
            const urlObj = new URL(avatarPath);
            avatarPath = urlObj.pathname;
          } catch {
            // If URL parsing fails, keep original
          }
        }
        setAvatarUrl(avatarPath);
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status !== 404 && status !== 500) {
        console.error('Lỗi khi tải thông tin Elder:', error);
        message.error('Không thể tải lại thông tin người cao tuổi.');
      }
      setElderDetail(null);
    }
  };
  // Load toa thuốc theo elderly
  const loadPrescriptionsByElder = async (elderId: number) => {
    try {
      setMedicationsLoading(true);
      const meds = await fetchMedicationsByElder(elderId);
      // Gom thuốc theo toa (PrescriptionSummary)
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

  // Load thông tin người thân
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
  // Load thông tin thuốc
  const loadMedications = async () => {
    if (!elderly) return;
    try {
      setMedicationsLoading(true);
      const meds = await fetchMedicationsByElder(Number(elderly.id));
      setMedications(meds || []);
    } catch (error: any) {
      const status = error.response?.status;
      if (status !== 404 && status !== 500) {
        console.error("Lỗi khi tải thông tin thuốc", error);
      }
      setMedications([]);
    } finally {
      setMedicationsLoading(false);
    }
  };
  // Load thông tin hồ sơ y tế - Lấy từ elderDetail hoặc từ API medical-history
  const loadMedicalHistory = async () => {
    if (!elderly?.id) return;
    try {
      setMedicalHistoryLoading(true);
      
      // Ưu tiên 1: Kiểm tra medicalHistory trong getElder response (nếu có relation)
      const elderData = await getElder(Number(elderly.id));
      console.log('Elder data from getElder:', elderData);
      
      if (elderData && 'medicalHistory' in elderData) {
        const medicalHistory = (elderData as any).medicalHistory;
        console.log('Medical history from getElder:', medicalHistory);
        // Nếu medicalHistory là object (từ relation), sử dụng trực tiếp
        if (medicalHistory !== null && medicalHistory !== undefined && typeof medicalHistory === 'object') {
          console.log('Setting medicalHistoryData from getElder:', medicalHistory);
          setMedicalHistoryData(medicalHistory);
          return; // Đã có dữ liệu, không cần query thêm
        }
      }
      
      // Ưu tiên 2: Lấy từ API medical-history endpoint (đúng endpoint)
      try {
        const res = await apiClient.get(`/api/medical-history/${elderly.id}`);
        console.log('Medical history from API:', res.data);
        if (res.data) {
          setMedicalHistoryData(res.data);
        } else {
          setMedicalHistoryData(null);
        }
      } catch (apiError: any) {
        const status = apiError.response?.status;
        if (status === 404) {
          // 404 có nghĩa là chưa có dữ liệu medical history, không phải lỗi
          console.log('Medical history not found (404) - no data yet');
          setMedicalHistoryData(null);
        } else {
          console.error('Error loading medical history from API:', apiError);
          setMedicalHistoryData(null);
        }
      }
    } catch (error: any) {
      const status = error.response?.status;
      console.error('Lỗi khi tải lịch sử y tế', error);
      if (status !== 404 && status !== 500) {
        message.error('Không thể tải thông tin y tế');
      }
      setMedicalHistoryData(null);
    } finally {
      setMedicalHistoryLoading(false);
    }
  };
  // Load hồ sơ dinh dưỡng, tập luyện, vận động
  const loadHealthProfiles = async () => {
    if (!elderly?.id) return;
    try {
      setHealthProfilesLoading(true);
      const profiles = await getAllHealthProfiles(Number(elderly.id));
      setHealthProfiles(profiles);
    } catch (error: any) {
      const status = error.response?.status;
      if (status !== 404 && status !== 500) {
        console.error('Lỗi khi tải hồ sơ sức khỏe:', error);
        setHealthProfiles({ nutrition: null, exercise: null, mobility: null });
      }
    } finally {
      setHealthProfilesLoading(false);
    }
  };

  // Load appointments
  const loadAppointments = async () => {
    if (!elderly?.id) return;
    try {
      setAppointmentsLoading(true);
      const data = await getAppointments(Number(elderly.id));
      // Đảm bảo data là array
      if (Array.isArray(data)) {
        setAppointments(data);
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        setAppointments((data as any).data);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải lịch khám bệnh:', error);
      const status = error.response?.status;
      if (status !== 404) {
        message.error('Không thể tải lịch khám bệnh');
      }
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Load lab results
  const loadLabResults = async () => {
    if (!elderly?.id) return;
    try {
      setLabResultsLoading(true);
      const data = await getLabResults(Number(elderly.id));
      // Đảm bảo data là array
      if (Array.isArray(data)) {
        setLabResults(data);
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        setLabResults((data as any).data);
      } else {
        setLabResults([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải kết quả xét nghiệm:', error);
      const status = error.response?.status;
      if (status !== 404) {
        message.error('Không thể tải kết quả xét nghiệm');
      }
      setLabResults([]);
    } finally {
      setLabResultsLoading(false);
    }
  };

  // Load rehabilitation records
  const loadRehabilitationRecords = async () => {
    if (!elderly?.id) return;
    try {
      setRehabilitationRecordsLoading(true);
      const data = await getRehabilitationRecords(Number(elderly.id));
      // Đảm bảo data là array
      if (Array.isArray(data)) {
        setRehabilitationRecords(data);
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        setRehabilitationRecords((data as any).data);
      } else {
        setRehabilitationRecords([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải hồ sơ phục hồi chức năng:', error);
      const status = error.response?.status;
      if (status !== 404) {
        message.error('Không thể tải hồ sơ phục hồi chức năng');
      }
      setRehabilitationRecords([]);
    } finally {
      setRehabilitationRecordsLoading(false);
    }
  };

  // Load vital readings for reports
  const loadVitalReadings = async () => {
    if (!elderly?.id) return;
    try {
      setVitalReadingsLoading(true);
      const now = new Date();
      let from: Date;
      
      if (vitalPeriod === 'day') {
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (vitalPeriod === 'week') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const data = await fetchVitalReadings(Number(elderly.id), {
        from: from.toISOString(),
        to: now.toISOString(),
      });
      setVitalReadings(data || []);
    } catch (error: any) {
      const status = error.response?.status;
      // Chỉ log lỗi nếu không phải 404 (không có dữ liệu)
      if (status !== 404) {
        console.error('Lỗi khi tải dữ liệu sinh hiệu:', error);
      }
      setVitalReadings([]);
    } finally {
      setVitalReadingsLoading(false);
    }
  };

  // Load alerts for reports
  const loadAlerts = async () => {
    if (!elderly?.id) return;
    try {
      setAlertsLoading(true);
      const [alertsData, statsData] = await Promise.all([
        getAlertsByElder(Number(elderly.id)).catch((err) => {
          console.error('Error loading alerts:', err);
          return [];
        }),
        getAlertStatistics(Number(elderly.id)).catch((err) => {
          console.error('Error loading alert statistics:', err);
          return {
            total: 0,
            bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
            byStatus: { Open: 0, Acknowledged: 0, Resolved: 0 },
          };
        }),
      ]);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setAlertStats(statsData);
    } catch (error: any) {
      console.error('Lỗi khi tải dữ liệu cảnh báo:', error);
      setAlerts([]);
      setAlertStats({
        total: 0,
        bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        byStatus: { Open: 0, Acknowledged: 0, Resolved: 0 },
      });
    } finally {
      setAlertsLoading(false);
    }
  };

  // Load doctors list
  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      // Lấy tất cả users từ API (giống như fetchDoctors trong medicationController)
      const response = await apiClient.get('/api/users');
      const raw = response.data?.data || response.data || [];
      
      // Filter chỉ lấy những user có role = 'Doctor'
      const doctorsList = raw
        .filter((user: any) => {
          const role = user.role || (user as any).role;
          return role === 'Doctor' || role === 'DOCTOR';
        })
        .map((user: any) => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          status: user.status,
        }));
      
      setDoctors(doctorsList || []);
      console.log('👨‍⚕️ Danh sách bác sĩ đã load:', doctorsList);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách bác sĩ:', error);
      // Nếu lỗi do không có quyền, thử dùng getUsers (có thể có filter khác)
      try {
        const allUsers = await getUsers();
        const doctorsList = allUsers.filter((user: User) => {
          const role = user.role || (user as any).role;
          return role === 'Doctor';
        });
        setDoctors(doctorsList || []);
        console.log('👨‍⚕️ Danh sách bác sĩ (fallback):', doctorsList);
      } catch (fallbackError: any) {
        console.error('Lỗi khi tải danh sách bác sĩ (fallback):', fallbackError);
        message.error('Không thể tải danh sách bác sĩ. Vui lòng kiểm tra quyền truy cập.');
        setDoctors([]);
      }
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Handle export report
  const handleExportReport = async (format: 'pdf' | 'csv') => {
    if (!elderly?.id) return;
    try {
      setExporting(true);
      const now = new Date();
      let from: Date;
      
      if (vitalPeriod === 'day') {
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (vitalPeriod === 'week') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      await downloadReport(
        Number(elderly.id),
        format,
        vitalPeriod,
        from.toISOString(),
        now.toISOString()
      );
      message.success(`Xuất báo cáo ${format.toUpperCase()} thành công`);
    } catch (error: any) {
      message.error(error.message || 'Xuất báo cáo thất bại');
    } finally {
      setExporting(false);
    }
  };

  // Calculate medication frequency statistics
  const medicationFrequencyStats = useMemo(() => {
    if (!medications || medications.length === 0) {
      return { total: 0, byFrequency: {}, averagePerDay: 0 };
    }

    const byFrequency: Record<string, number> = {};
    let totalDoses = 0;

    medications.forEach((med) => {
      const freq = med.frequency || 'Không rõ';
      byFrequency[freq] = (byFrequency[freq] || 0) + 1;
      
      // Estimate doses per day from frequency string
      const freqMatch = freq.match(/(\d+)/);
      if (freqMatch) {
        totalDoses += parseInt(freqMatch[1]);
      }
    });

    return {
      total: medications.length,
      byFrequency,
      averagePerDay: totalDoses / medications.length || 0,
    };
  }, [medications]);

  // Calculate BMI progression
  const bmiProgression = useMemo(() => {
    // This would ideally come from historical medical history data
    // For now, we'll use the current BMI if available
    const currentBMI = medicalHistoryData?.bmi;
    if (!currentBMI) return null;

    return {
      current: currentBMI,
      trend: 'stable', // Would need historical data to calculate trend
      history: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), value: currentBMI - 0.5 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), value: currentBMI - 0.2 },
        { date: new Date().toISOString(), value: currentBMI },
      ],
    };
  }, [medicalHistoryData]);

  // Reload vitals when period changes
  useEffect(() => {
    if (visible && elderly?.id) {
      loadVitalReadings();
    }
  }, [vitalPeriod, visible, elderly?.id]);
  // Hàm hỗ trợ: Chuyển chuỗi lịch sử bệnh từ backend → mảng (để hiển thị)
  // Xử lý các trường hợp: 0 (số), NULL, string JSON array, hoặc string thường
  const parseMedicalHistoryString = (value: string | number | null | undefined): string[] => {
    // Nếu là null, undefined, hoặc 0 (số), trả về mảng rỗng
    if (value === null || value === undefined || value === 0 || value === '0') {
      return [];
    }
    
    // Nếu đã là mảng, trả về trực tiếp
    if (Array.isArray(value)) {
      return value;
    }
    
    // Chuyển sang string để xử lý
    const str = String(value).trim();
    if (!str || str === '0' || str === 'null' || str === 'NULL') {
      return [];
    }
    
    try {
      // Thử parse JSON (có thể là '["item1", "item2"]' hoặc '["item"]')
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && String(item).trim().length > 0);
      }
      return [];
    } catch {
      // Nếu không phải JSON, thử split bằng dấu phẩy hoặc chấm phẩy
      const parts = str.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
      return parts;
    }
  };
  const arrayToMedicalHistoryString = (arr: string[] | undefined): string | undefined => {
    if (!arr || arr.length === 0) return undefined;
    return JSON.stringify(arr);
  };
  // Thêm người thân mới
  const handleAddFamilyMember = () => {
    setSelectedFamilyMember(null);
    setFamilyMemberModalVisible(true);
  };
  // Chỉnh sửa người thân
  const handleEditFamilyMember = (familyMember: FamilyMember) => {
    setSelectedFamilyMember(familyMember);
    setFamilyMemberModalVisible(true);
  };
  // Lưu người thân (tạo mới hoặc cập nhật)
  const handleSaveFamilyMember = async (data: CreateFamilyMemberRequest | UpdateFamilyMemberRequest) => {
    if (!elderly) return;
    try {
      if (selectedFamilyMember) {
        await updateFamilyMember(selectedFamilyMember.id, data as UpdateFamilyMemberRequest);
      } else {
        await createFamilyMember(elderly.id, data as CreateFamilyMemberRequest);
      }
      await loadFamilyMembers();
    } catch (error: any) {
      throw error;
    }
  };
  // Xóa người thân
  const handleDeleteFamilyMember = async (id: string) => {
    if (!elderly) return;
    await deleteFamilyMember(id, elderly.id);
    await loadFamilyMembers();
  };

  // Appointments handlers
  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    appointmentForm.resetFields();
    setAppointmentModalVisible(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    appointmentForm.setFieldsValue({
      visitDate: appointment.visitDate ? dayjs(appointment.visitDate) : null,
      nextVisitDate: appointment.nextVisitDate ? dayjs(appointment.nextVisitDate) : null,
      doctorId: appointment.doctorId,
      notes: appointment.notes,
      status: appointment.status,
    });
    setAppointmentModalVisible(true);
  };

  const handleSaveAppointment = async () => {
    if (!elderly?.id) return;
    try {
      const values = await appointmentForm.validateFields();
      const data: CreateAppointmentDto = {
        elderId: Number(elderly.id),
        visitDate: values.visitDate ? values.visitDate.toISOString() : new Date().toISOString(),
        nextVisitDate: values.nextVisitDate ? values.nextVisitDate.toISOString() : undefined,
        doctorId: values.doctorId,
        notes: values.notes,
        status: values.status || 'Scheduled',
      };

      if (selectedAppointment) {
        await updateAppointment(selectedAppointment.appointmentId, data);
        message.success('Cập nhật lịch khám bệnh thành công');
      } else {
        await createAppointment(data);
        message.success('Thêm lịch khám bệnh thành công');
      }
      setAppointmentModalVisible(false);
      await loadAppointments();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    try {
      await deleteAppointment(id);
      message.success('Xóa lịch khám bệnh thành công');
      await loadAppointments();
    } catch (error: any) {
      message.error('Xóa thất bại');
    }
  };

  // Lab Results handlers
  const handleAddLabResult = () => {
    setSelectedLabResult(null);
    labResultForm.resetFields();
    setLabResultModalVisible(true);
  };

  const handleEditLabResult = (labResult: LabResult) => {
    setSelectedLabResult(labResult);
    labResultForm.setFieldsValue({
      testDate: labResult.testDate ? dayjs(labResult.testDate) : null,
      testType: labResult.testType,
      result: labResult.result,
      notes: labResult.notes,
    });
    setLabResultModalVisible(true);
  };

  const handleSaveLabResult = async () => {
    if (!elderly?.id) return;
    try {
      const values = await labResultForm.validateFields();
      
      // Chuẩn bị dữ liệu, chỉ gửi các field có giá trị
      const payload: any = {
        elderId: Number(elderly.id),
      };
      
      // Xử lý testDate: convert dayjs sang format YYYY-MM-DD
      // Format YYYY-MM-DD được @IsDateString() validator chấp nhận và đơn giản hơn ISO 8601
      if (values.testDate) {
        if (dayjs.isDayjs(values.testDate)) {
          // Format thành YYYY-MM-DD (ISO date format đơn giản)
          payload.testDate = values.testDate.format('YYYY-MM-DD');
        } else if (typeof values.testDate === 'string') {
          // Nếu đã là string, parse và format lại
          const parsed = dayjs(values.testDate);
          if (parsed.isValid()) {
            payload.testDate = parsed.format('YYYY-MM-DD');
          } else {
            // Fallback: giữ nguyên nếu không parse được
            payload.testDate = values.testDate;
          }
        }
      }
      
      // Chỉ thêm các field có giá trị (không phải undefined, null, hoặc empty string)
      if (values.testType && String(values.testType).trim()) {
        payload.testType = String(values.testType).trim();
      }
      
      if (values.result && String(values.result).trim()) {
        payload.result = String(values.result).trim();
      }
      
      if (values.notes && String(values.notes).trim()) {
        payload.notes = String(values.notes).trim();
      }

      // Loại bỏ các field undefined bằng cách stringify và parse
      const cleanData = JSON.parse(JSON.stringify(payload)) as CreateLabResultDto;

      if (selectedLabResult) {
        await updateLabResult(selectedLabResult.resultId, cleanData);
        message.success('Cập nhật kết quả xét nghiệm thành công');
      } else {
        await createLabResult(cleanData);
        message.success('Thêm kết quả xét nghiệm thành công');
      }
      setLabResultModalVisible(false);
      setSelectedLabResult(null);
      labResultForm.resetFields();
      await loadLabResults();
    } catch (error: any) {
      console.error('Error saving lab result:', error);
      // Hiển thị lỗi chi tiết hơn
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || (error.response?.data?.errors && Array.isArray(error.response.data.errors) 
          ? error.response.data.errors.map((e: any) => e.message || e).join(', ')
          : null)
        || error.message 
        || 'Có lỗi xảy ra khi lưu kết quả xét nghiệm';
      message.error(errorMessage);
    }
  };

  const handleDeleteLabResult = async (id: number) => {
    try {
      await deleteLabResult(id);
      message.success('Xóa kết quả xét nghiệm thành công');
      await loadLabResults();
    } catch (error: any) {
      message.error('Xóa thất bại');
    }
  };

  // Rehabilitation Records handlers
  const handleAddRehabilitationRecord = () => {
    setSelectedRehabilitationRecord(null);
    rehabilitationRecordForm.resetFields();
    setRehabilitationRecordModalVisible(true);
  };

  const handleEditRehabilitationRecord = (record: RehabilitationRecord) => {
    setSelectedRehabilitationRecord(record);
    rehabilitationRecordForm.setFieldsValue({
      startDate: record.startDate ? dayjs(record.startDate) : null,
      status: record.status,
      notes: record.notes,
    });
    setRehabilitationRecordModalVisible(true);
  };

  const handleSaveRehabilitationRecord = async () => {
    if (!elderly?.id) return;
    try {
      const values = await rehabilitationRecordForm.validateFields();
      const data: CreateRehabilitationRecordDto = {
        elderId: Number(elderly.id),
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        status: values.status,
        notes: values.notes,
      };

      if (selectedRehabilitationRecord) {
        await updateRehabilitationRecord(selectedRehabilitationRecord.rehabId, data);
        message.success('Cập nhật hồ sơ phục hồi chức năng thành công');
      } else {
        await createRehabilitationRecord(data);
        message.success('Thêm hồ sơ phục hồi chức năng thành công');
      }
      setRehabilitationRecordModalVisible(false);
      await loadRehabilitationRecords();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteRehabilitationRecord = async (id: number) => {
    try {
      await deleteRehabilitationRecord(id);
      message.success('Xóa hồ sơ phục hồi chức năng thành công');
      await loadRehabilitationRecords();
    } catch (error: any) {
      message.error('Xóa thất bại');
    }
  };

  // Avatar upload handlers
  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      // Compress image before upload
      const compressedFile = await compressImage(file, 800, 800, 0.8);
      
      // Upload to server
      const formData = new FormData();
      formData.append('avatar', compressedFile);
      
      const response = await apiClient.post('/api/elders/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const fileUrl = response.data.url;
      // Store only the relative path, not the full URL
      setAvatarUrl(fileUrl);
      basicForm.setFieldsValue({ avatar: fileUrl });
      message.success('Tải lên hình ảnh thành công');
      return fileUrl;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Tải lên hình ảnh thất bại');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarUrl('');
    basicForm.setFieldsValue({ avatar: '' });
  };
  // Sử dụng elderDetail nếu có (dữ liệu mới nhất), nếu không thì dùng elderly prop
  const displayElderly = elderDetail || elderly;
  
  // Không render nếu không có elderly và modal không visible
  if (!visible || !elderly) return null;

  // Hàm edit theo tab - Load lại thông tin mới nhất trước khi edit
  const handleEdit = async (tab: string) => {
    // Reload thông tin chi tiết trước khi edit để đảm bảo dữ liệu mới nhất
    if (tab === 'basic') {
      await loadElderDetail();
    }
    
    setEditingTab(tab);

    if (tab === 'basic') {
      // Sử dụng elderDetail nếu có, nếu không thì dùng elderly prop
      const dataSource = elderDetail || elderly;
      basicForm.setFieldsValue({
        fullName: dataSource?.fullName,
        gender: dataSource?.gender,
        age: dataSource?.age,
        phone: dataSource?.phone,
        address: dataSource?.address,
        insuranceInfo: (dataSource as any)?.insuranceInfo,
        note: dataSource?.note,
        dob: dataSource?.dob ? dayjs(dataSource.dob) : undefined,
        avatar: avatarUrl || (dataSource as any)?.avatar,
      });
    } else if (tab === 'medical') {
      const diagnoses = medicalHistoryData?.diagnoses
        ? parseMedicalHistoryString(medicalHistoryData.diagnoses)
        : (elderly?.medicalHistory || []);
      const allergies = medicalHistoryData?.allergies
        ? parseMedicalHistoryString(medicalHistoryData.allergies)
        : (elderly?.allergies || []);
      const chronicMedications = medicalHistoryData?.chronicMedications
        ? parseMedicalHistoryString(medicalHistoryData.chronicMedications)
        : [];

      medicalForm.setFieldsValue({
        diagnoses,
        allergies,
        chronicMedications,
        bmi: medicalHistoryData?.bmi || (elderly as any)?.bmi,
      });

    } else if (tab === 'nutrition') {
      nutritionForm.setFieldsValue(healthProfiles?.nutrition || {});
    }
    else if (tab === 'exercise') {
      exerciseForm.setFieldsValue(healthProfiles?.exercise || {});
    }
    else if (tab === 'mobility') {
      mobilityForm.setFieldsValue(healthProfiles?.mobility || {});

    } else if (tab === 'history') {
      historyForm.setFieldsValue({
        lastCheckup: elderly?.lastCheckup ? dayjs(elderly.lastCheckup) : null,
        nextCheckup: elderly?.nextCheckup ? dayjs(elderly.nextCheckup) : null,
        checkupNotes: (elderly as any)?.checkupNotes,
        testDate: (elderly as any)?.testDate ? dayjs((elderly as any).testDate) : null,
        testType: (elderly as any)?.testType,
        testResults: (elderly as any)?.testResults,
        prescriptionDate: (elderly as any)?.prescriptionDate ? dayjs((elderly as any).prescriptionDate) : null,
        doctorName: (elderly as any)?.doctorName,
        prescriptionNotes: (elderly as any)?.prescriptionNotes,
        rehabStartDate: (elderly as any)?.rehabStartDate ? dayjs((elderly as any).rehabStartDate) : null,
        rehabStatus: (elderly as any)?.rehabStatus,
        rehabNotes: (elderly as any)?.rehabNotes,
      });
    }
  };
  // Lưu theo tab
  const handleSave = async (tab: string) => {
    if (!elderly) return;
    try {
      if (tab === 'basic') {
        const values = await basicForm.validateFields();
        values.avatar = avatarUrl || values.avatar || null;
        // Chuyển empty string thành null
        if (values.avatar === '') {
          values.avatar = null;
        }
        // Format dob nếu có
        if (values.dob) {
          if (typeof values.dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(values.dob)) {
            // Already in YYYY-MM-DD format
            values.dob = values.dob;
          } else {
            // Need to format
            values.dob = dayjs(values.dob).format('YYYY-MM-DD');
          }
        }
        
        await updateElder(elderly.id, values);
        message.success('Cập nhật thông tin cơ bản thành công');
        
        // Reload lại TẤT CẢ thông tin từ server
        await Promise.all([
          loadElderDetail(),
          loadFamilyMembers(),
          loadMedications(),
          loadMedicalHistory(),
          loadHealthProfiles(),
          loadPrescriptionsByElder(Number(elderly.id))
        ]);
        
        // Cập nhật lại avatar URL từ dữ liệu mới
        if (elderDetail && (elderDetail as any).avatar) {
          let avatarPath = (elderDetail as any).avatar;
          if (avatarPath && avatarPath.startsWith('http')) {
            try {
              const urlObj = new URL(avatarPath);
              avatarPath = urlObj.pathname;
            } catch {
              // If URL parsing fails, keep original
            }
          }
          setAvatarUrl(avatarPath);
        }
        
        // Gọi callback để reload danh sách elders từ parent component
        if (onUpdate) {
          onUpdate();
        }
        
        // Thoát chế độ edit
        setEditingTab(null);
      } else if (tab === 'medical') {
        const values = await medicalForm.validateFields();
        const payload = {
          diagnoses: values.diagnoses?.length ? arrayToMedicalHistoryString(values.diagnoses) : null,
          allergies: values.allergies?.length ? arrayToMedicalHistoryString(values.allergies) : null,
          chronicMedications: values.chronicMedications?.length ? arrayToMedicalHistoryString(values.chronicMedications) : null,
          bmi: values.bmi ?? null,
        };
        await updateMedicalHistory(Number(elderly.id), payload);
        message.success('Cập nhật hồ sơ y tế thành công');
        await loadMedicalHistory();

      } else if (tab === 'nutrition') {
        const values = await nutritionForm.validateFields();
        if (healthProfiles?.nutrition) {
          await updateNutritionProfile(Number(elderly.id), values);
        } else {
          await createNutritionProfile(Number(elderly.id), values);
        }
        await loadHealthProfiles();
        message.success('Cập nhật hồ sơ dinh dưỡng thành công');
      }

      else if (tab === 'exercise') {
        const values = await exerciseForm.validateFields();
        if (healthProfiles?.exercise) {
          await updateExerciseProfile(Number(elderly.id), values);
        } else {
          await createExerciseProfile(Number(elderly.id), values);
        }
        await loadHealthProfiles();
        message.success('Cập nhật hồ sơ tập luyện thành công');
      }

      else if (tab === 'mobility') {
        const values = await mobilityForm.validateFields();
        if (healthProfiles?.mobility) {
          await updateMobilityProfile(Number(elderly.id), values);
        } else {
          await createMobilityProfile(Number(elderly.id), values);
        }
        await loadHealthProfiles();
        message.success('Cập nhật khả năng vận động thành công');
      }
      else if (tab === 'history') {
        const values = await historyForm.validateFields();
        console.log('History data:', values);
        message.success('Cập nhật lịch sử khám & hồ sơ thành công');
      }
      setEditingTab(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };
  // Hủy edit theo tab
  const handleCancel = (tab: string) => {
    setEditingTab(null);
  };
  // Hàm hỗ trợ hiển thị trạng thái với màu sắc
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
  // Hàm hỗ trợ hiển thị trạng thái với text
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
  // Hàm hỗ trợ hiển thị giới tính
  const getGenderText = (gender: string) => {
    if (!gender) return '-';
    const g = gender.trim().toUpperCase();
    return g === 'M' || g === 'MALE' ? 'Nam' : g === 'F' || g === 'FEMALE' ? 'Nữ' : '-';
  };
  return (
    <Modal
      title={`Thông tin chi tiết - ${displayElderly?.fullName || elderly?.fullName || 'Đang tải...'}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
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
                                src={avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'}${avatarUrl}`) : undefined}
                                icon={<UserOutlined />}
                              >
                                {(displayElderly?.fullName || elderly.fullName)?.charAt(0)}
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

                                    setUploading(true);
                                    handleAvatarUpload(file).finally(() => setUploading(false));
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
                          <Form.Item name="dob" label="Ngày sinh">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="phone" label="Số điện thoại">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
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
                        <div className="flex items-center justify-center">
                          <Avatar 
                            size={120} 
                            src={(avatarUrl || (displayElderly as any)?.avatar || (elderly as any).avatar) ? ((avatarUrl || (displayElderly as any)?.avatar || (elderly as any).avatar).startsWith('http') ? (avatarUrl || (displayElderly as any)?.avatar || (elderly as any).avatar) : `${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'}${avatarUrl || (displayElderly as any)?.avatar || (elderly as any).avatar}`) : undefined}
                            icon={<UserOutlined />}
                            className="border-4 border-blue-200"
                          >
                            {(displayElderly?.fullName || elderly?.fullName)?.charAt(0) || 'U'}
                          </Avatar>
                        </div>
                      </Col>
                      <Col span={20}>
                        <Descriptions column={2} size="small">
                          <Descriptions.Item label="Họ và tên">{displayElderly?.fullName || elderly?.fullName || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Giới tính">{getGenderText(displayElderly?.gender || elderly?.gender || '')}</Descriptions.Item>
                          <Descriptions.Item label="Ngày sinh">{(displayElderly?.dob || elderly?.dob) ? dayjs(displayElderly?.dob || elderly?.dob).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                          <Descriptions.Item label="Tuổi">{(displayElderly?.age || elderly?.age) ? `${displayElderly?.age || elderly?.age} tuổi` : '-'}</Descriptions.Item>
                          <Descriptions.Item label="Email">
                            <MailOutlined className="mr-1" />
                            {(displayElderly as any)?.email || (elderly as any)?.email || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Số điện thoại"><PhoneOutlined className="mr-1" />{displayElderly?.phone || elderly?.phone || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Người liên hệ">
                            {primaryFamilyMember ? (
                              <>
                                <UserOutlined className="mr-1" />{displayElderly?.familyName || elderly?.familyName || '-'}
                                {primaryFamilyMember.relationship && (
                                  <span className="ml-1 text-gray-600">({primaryFamilyMember.relationship})</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">Chưa có người thân chính</span>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="SĐT liên hệ">{displayElderly?.familyPhone || elderly?.familyPhone || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Bảo hiểm" span={2}>{(displayElderly as any)?.insuranceInfo || (elderly as any)?.insuranceInfo || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Địa chỉ" span={2}><HomeOutlined className="mr-1" />{displayElderly?.address || elderly?.address || '-'}</Descriptions.Item>
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
                        value={getStatusText(displayElderly?.status || elderly?.status || '')}
                        valueStyle={{
                          color: getStatusColor(displayElderly?.status || elderly?.status || '') === 'green' ? '#10b981' :
                            getStatusColor(displayElderly?.status || elderly?.status || '') === 'orange' ? '#f59e0b' : '#ef4444'
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
                      <Col span={6}>
                        <h4 className="font-medium mb-2">Bệnh lý nền</h4>
                        <div className="space-y-1">
                          {(() => {
                            let diagnoses: string[] = [];
                            // Ưu tiên lấy từ medicalHistoryData, sau đó từ elderly
                            if (medicalHistoryData && medicalHistoryData.hasOwnProperty('diagnoses')) {
                              diagnoses = parseMedicalHistoryString(medicalHistoryData.diagnoses);
                            } else if (elderly?.medicalHistory && Array.isArray(elderly.medicalHistory)) {
                              diagnoses = elderly.medicalHistory;
                            }
                            console.log('MedicalHistoryData:', medicalHistoryData);
                            console.log('Diagnoses value:', medicalHistoryData?.diagnoses);
                            console.log('Diagnoses parsed:', diagnoses);
                            return diagnoses.length > 0 ? (
                              diagnoses.map((condition, index) => (
                                <Tag key={index} color="red" className="mr-1 mb-1">{condition}</Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">Không có</span>
                            );
                          })()}
                        </div>
                      </Col>
                      <Col span={6}>
                        <h4 className="font-medium mb-2">Dị ứng</h4>
                        <div className="space-y-1">
                          {(() => {
                            let allergies: string[] = [];
                            // Ưu tiên lấy từ medicalHistoryData, sau đó từ elderly
                            if (medicalHistoryData && medicalHistoryData.hasOwnProperty('allergies')) {
                              allergies = parseMedicalHistoryString(medicalHistoryData.allergies);
                            } else if (elderly?.allergies && Array.isArray(elderly.allergies)) {
                              allergies = elderly.allergies;
                            }
                            console.log('Allergies value:', medicalHistoryData?.allergies);
                            console.log('Allergies parsed:', allergies);
                            return allergies.length > 0 ? (
                              allergies.map((allergy, index) => (
                                <Tag key={index} color="orange" className="mr-1 mb-1">{allergy}</Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">Không có</span>
                            );
                          })()}
                        </div>
                      </Col>
                      <Col span={6}>
                        <h4 className="font-medium mb-2">Thuốc điều trị mãn tính</h4>
                        <div className="space-y-1">
                          {(() => {
                            let medications: string[] = [];
                            // Chỉ lấy từ medicalHistoryData vì elderly không có field này
                            if (medicalHistoryData && medicalHistoryData.hasOwnProperty('chronicMedications')) {
                              medications = parseMedicalHistoryString(medicalHistoryData.chronicMedications);
                            }
                            console.log('Chronic medications value:', medicalHistoryData?.chronicMedications);
                            console.log('Chronic medications parsed:', medications);
                            return medications.length > 0 ? (
                              medications.map((med, index) => (
                                <Tag key={index} color="blue" className="mr-1 mb-1">{med}</Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">Không có</span>
                            );
                          })()}
                        </div>
                      </Col>
                      <Col span={6}>
                        <h4 className="font-medium mb-2">Chỉ số BMI</h4>
                        {(() => {
                          const bmi = medicalHistoryData?.bmi;
                          console.log('BMI value:', bmi);
                          // BMI có thể là số hoặc null, kiểm tra cả 0
                          return (bmi !== null && bmi !== undefined && bmi !== 0) ? (
                            <Tag color="green" className="text-lg px-3 py-1">
                              {bmi}
                            </Tag>
                          ) : (
                            <span className="text-gray-500">Không có</span>
                          );
                        })()}
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
                {/* 🔹 Nút chuyển giữa các hồ sơ */}
                <div className="flex gap-3 mb-4">
                  <Button
                    type={activeProfile === 'nutrition' ? 'primary' : 'default'}
                    onClick={() => setActiveProfile('nutrition')}
                  >
                    Dinh dưỡng
                  </Button>
                  <Button
                    type={activeProfile === 'exercise' ? 'primary' : 'default'}
                    onClick={() => setActiveProfile('exercise')}
                  >
                    Tập luyện
                  </Button>
                  <Button
                    type={activeProfile === 'mobility' ? 'primary' : 'default'}
                    onClick={() => setActiveProfile('mobility')}
                  >
                    Vận động
                  </Button>
                </div>

                {/* 🥗 Dinh dưỡng */}
                {activeProfile === 'nutrition' && (
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
                      <div className="text-gray-600">
                        {healthProfiles?.nutrition
                          ? <>
                            <p><b>Hạn chế:</b> {healthProfiles.nutrition.dietaryRestrictions?.join(', ') || 'Không có'}</p>
                            <p><b>Món ưa thích:</b> {healthProfiles.nutrition.preferredFoods?.join(', ') || 'Không có'}</p>
                            <p><b>Ghi chú:</b> {healthProfiles.nutrition.nutritionNotes || 'Không có ghi chú'}</p>
                          </>
                          : 'Chưa có dữ liệu dinh dưỡng. Vui lòng cập nhật sau.'}
                      </div>
                    )}
                  </Card>
                )}

                {/* 🏃 Chế độ tập luyện */}
                {activeProfile === 'exercise' && (
                  <Card
                    size="small"
                    title="Chế độ tập luyện"
                    extra={
                      editingTab !== 'exercise' ? (
                        <Button icon={<EditOutlined />} onClick={() => handleEdit('exercise')}>
                          Chỉnh sửa
                        </Button>
                      ) : (
                        <div className="space-x-2">
                          <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('exercise')}
                          >
                            Lưu
                          </Button>
                          <Button
                            icon={<CloseOutlined />}
                            onClick={() => handleCancel('exercise')}
                          >
                            Hủy
                          </Button>
                        </div>
                      )
                    }
                  >
                    {editingTab === 'exercise' ? (
                      <Form form={exerciseForm} layout="vertical">
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
                      <div className="text-gray-600">
                        {healthProfiles?.exercise
                          ? <>
                            <p><b>Loại hình:</b> {healthProfiles.exercise.exerciseType?.join(', ') || 'Không có'}</p>
                            <p><b>Tần suất:</b> {healthProfiles.exercise.exerciseFrequency || 'Không có'}</p>
                            <p><b>Ghi chú:</b> {healthProfiles.exercise.exerciseNotes || 'Không có ghi chú'}</p>
                          </>
                          : 'Chưa có dữ liệu tập luyện. Vui lòng cập nhật sau.'}
                      </div>
                    )}
                  </Card>
                )}

                {/* 🦿 Khả năng vận động */}
                {activeProfile === 'mobility' && (
                  <Card
                    size="small"
                    title="Khả năng vận động"
                    extra={
                      editingTab !== 'mobility' ? (
                        <Button icon={<EditOutlined />} onClick={() => handleEdit('mobility')}>
                          Chỉnh sửa
                        </Button>
                      ) : (
                        <div className="space-x-2">
                          <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('mobility')}
                          >
                            Lưu
                          </Button>
                          <Button
                            icon={<CloseOutlined />}
                            onClick={() => handleCancel('mobility')}
                          >
                            Hủy
                          </Button>
                        </div>
                      )
                    }
                  >
                    {editingTab === 'mobility' ? (
                      <Form form={mobilityForm} layout="vertical">
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
                      <div className="text-gray-600">
                        {healthProfiles?.mobility
                          ? <>
                            <p><b>Mức độ:</b> {healthProfiles.mobility.mobilityLevel || 'Không có'}</p>
                            <p><b>Thiết bị:</b> {healthProfiles.mobility.assistiveDevices?.join(', ') || 'Không có'}</p>
                            <p><b>Ghi chú:</b> {healthProfiles.mobility.mobilityNotes || 'Không có ghi chú'}</p>
                          </>
                          : 'Chưa có đánh giá vận động. Vui lòng cập nhật sau.'}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            ),
          },

          {
            key: 'history',
            label: 'Lịch sử khám & hồ sơ',
            children: (
              <div className="space-y-6">
                <Card
                  size="small"
                  title="Lịch khám bệnh"
                >
                  {appointmentsLoading ? (
                    <div className="text-center text-gray-500 py-3">Đang tải...</div>
                  ) : appointments.length > 0 ? (
                    <Table
                      dataSource={appointments}
                      rowKey="appointmentId"
                      size="small"
                      pagination={{ pageSize: 5, size: 'small' }}
                      columns={[
                        {
                          title: 'Ngày khám',
                          dataIndex: 'visitDate',
                          key: 'visitDate',
                          render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
                        },
                        {
                          title: 'Bác sĩ',
                          dataIndex: 'doctor',
                          key: 'doctor',
                          render: (doctor: any) => doctor?.fullName || '-',
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status: string) => {
                            const color = status === 'Completed' ? 'green' : status === 'Scheduled' ? 'blue' : 'red';
                            return <Tag color={color}>{status === 'Completed' ? 'Hoàn thành' : status === 'Scheduled' ? 'Đã lên lịch' : 'Đã hủy'}</Tag>;
                          },
                        },
                      ]}
                    />
                  ) : (
                    <div className="text-gray-600 text-center py-3">Chưa có lịch khám bệnh nào</div>
                  )}
                </Card>

                <Card
                  size="small"
                  title="Kết quả xét nghiệm"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLabResult}>
                      Thêm kết quả
                    </Button>
                  }
                >
                  {labResultsLoading ? (
                    <div className="text-center text-gray-500 py-3">Đang tải...</div>
                  ) : labResults.length > 0 ? (
                    <Table
                      dataSource={labResults}
                      rowKey="resultId"
                      size="small"
                      pagination={{ pageSize: 5, size: 'small' }}
                      columns={[
                        {
                          title: 'Ngày xét nghiệm',
                          dataIndex: 'testDate',
                          key: 'testDate',
                          render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
                        },
                        {
                          title: 'Loại xét nghiệm',
                          dataIndex: 'testType',
                          key: 'testType',
                        },
                        {
                          title: 'Kết quả',
                          dataIndex: 'result',
                          key: 'result',
                          ellipsis: true,
                        },
                        {
                          title: 'Thao tác',
                          key: 'action',
                          width: 120,
                          render: (_: any, record: LabResult) => (
                            <Space size="small">
                              <Button size="small" icon={<EditOutlined />} onClick={() => handleEditLabResult(record)} />
                              <Popconfirm
                                title="Xác nhận xóa"
                                onConfirm={() => handleDeleteLabResult(record.resultId)}
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <div className="text-gray-600 text-center py-3">Chưa có kết quả xét nghiệm nào</div>
                  )}
                </Card>

                <Card
                  size="small"
                  title="Đơn thuốc"
                >
                  <div className="text-gray-600 text-center py-3">Xem danh sách ở mục Thuốc đang dùng trong hồ sơ y tế.</div>
                </Card>

                <Card
                  size="small"
                  title="Phục hồi chức năng"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRehabilitationRecord}>
                      Thêm hồ sơ
                    </Button>
                  }
                >
                  {rehabilitationRecordsLoading ? (
                    <div className="text-center text-gray-500 py-3">Đang tải...</div>
                  ) : rehabilitationRecords.length > 0 ? (
                    <Table
                      dataSource={rehabilitationRecords}
                      rowKey="rehabId"
                      size="small"
                      pagination={{ pageSize: 5, size: 'small' }}
                      columns={[
                        {
                          title: 'Ngày bắt đầu',
                          dataIndex: 'startDate',
                          key: 'startDate',
                          render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
                        },
                        {
                          title: 'Tình trạng',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status: string) => {
                            const color = status === 'Hoàn thành' ? 'green' : status === 'Đang thực hiện' ? 'blue' : 'orange';
                            return <Tag color={color}>{status || '-'}</Tag>;
                          },
                        },
                        {
                          title: 'Ghi chú',
                          dataIndex: 'notes',
                          key: 'notes',
                          ellipsis: true,
                        },
                        {
                          title: 'Thao tác',
                          key: 'action',
                          width: 120,
                          render: (_: any, record: RehabilitationRecord) => (
                            <Space size="small">
                              <Button size="small" icon={<EditOutlined />} onClick={() => handleEditRehabilitationRecord(record)} />
                              <Popconfirm
                                title="Xác nhận xóa"
                                onConfirm={() => handleDeleteRehabilitationRecord(record.rehabId)}
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <div className="text-gray-600 text-center py-3">Chưa có hồ sơ phục hồi chức năng nào</div>
                  )}
                </Card>
              </div>
            )
          },
          {
            key: 'reports',
            label: (
              <span>
                <FileTextOutlined /> Báo cáo & Phân tích
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* Export Controls */}
                <Card
                  size="small"
                  title="Xuất báo cáo"
                  extra={
                    <Space>
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={() => handleExportReport('pdf')}
                        loading={exporting}
                      >
                        Xuất PDF
                      </Button>
                      <Button
                        icon={<FileExcelOutlined />}
                        onClick={() => handleExportReport('csv')}
                        loading={exporting}
                      >
                        Xuất CSV
                      </Button>
                    </Space>
                  }
                >
                  <p className="text-gray-600 text-sm">
                    Xuất báo cáo tổng hợp cho người thân hoặc bệnh viện
                  </p>
                </Card>

                {/* Vital Signs Chart */}
                <Card
                  size="small"
                  title="Biểu đồ sinh hiệu theo thời gian"
                  extra={
                    <Radio.Group
                      value={vitalPeriod}
                      onChange={(e) => setVitalPeriod(e.target.value)}
                      size="small"
                    >
                      <Radio.Button value="day">Ngày</Radio.Button>
                      <Radio.Button value="week">Tuần</Radio.Button>
                      <Radio.Button value="month">Tháng</Radio.Button>
                    </Radio.Group>
                  }
                >
                  {vitalReadingsLoading ? (
                    <div className="text-center py-8">
                      <Spin tip="Đang tải dữ liệu..." />
                    </div>
                  ) : (
                    <VitalSignsChart data={vitalReadings} period={vitalPeriod} />
                  )}
                </Card>

                {/* Statistics Row */}
                <Row gutter={16}>
                  {/* Alert Statistics */}
                  <Col span={24}>
                    <Card size="small" title="Thống kê cảnh báo">
                      {alertsLoading ? (
                        <div className="text-center py-4">
                          <Spin size="small" />
                        </div>
                      ) : alertStats ? (
                        <Row gutter={16}>
                          <Col span={6}>
                            <Statistic
                              title="Tổng số cảnh báo"
                              value={alertStats.total}
                              valueStyle={{ color: '#ef4444' }}
                            />
                          </Col>
                          <Col span={6}>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-2">Theo mức độ</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm">Khẩn cấp:</span>
                                  <Tag color="red">{alertStats.bySeverity?.Critical || 0}</Tag>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Cao:</span>
                                  <Tag color="orange">{alertStats.bySeverity?.High || 0}</Tag>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Trung bình:</span>
                                  <Tag color="blue">{alertStats.bySeverity?.Medium || 0}</Tag>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Thấp:</span>
                                  <Tag color="green">{alertStats.bySeverity?.Low || 0}</Tag>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col span={6}>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-2">Theo trạng thái</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm">Mở:</span>
                                  <Tag color="red">{alertStats.byStatus?.Open || 0}</Tag>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Đã xác nhận:</span>
                                  <Tag color="orange">{alertStats.byStatus?.Acknowledged || 0}</Tag>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Đã giải quyết:</span>
                                  <Tag color="green">{alertStats.byStatus?.Resolved || 0}</Tag>
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      ) : (
                        <div className="text-gray-500 text-center py-4">Chưa có dữ liệu</div>
                      )}
                    </Card>
                  </Col>
                </Row>

                {/* Charts Row */}
                <Row gutter={16}>
                  {/* Medication Frequency Chart */}
                  <Col span={12}>
                    <Card size="small" title="Tần suất dùng thuốc">
                      <div className="space-y-2">
                        <Row gutter={16}>
                          <Col span={12}>
                            <Statistic
                              title="Tổng số thuốc"
                              value={medicationFrequencyStats.total}
                              valueStyle={{ color: '#3b82f6' }}
                            />
                          </Col>
                          {medicationFrequencyStats.averagePerDay > 0 && (
                            <Col span={12}>
                              <Statistic
                                title="Trung bình liều/ngày"
                                value={medicationFrequencyStats.averagePerDay.toFixed(1)}
                                precision={1}
                              />
                            </Col>
                          )}
                        </Row>
                        {Object.keys(medicationFrequencyStats.byFrequency).length > 0 ? (
                          <div className="mt-3">
                            <MedicationFrequencyChart byFrequency={medicationFrequencyStats.byFrequency} />
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-4">
                            Chưa có dữ liệu thuốc
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>

                  {/* BMI Progression Chart */}
                  <Col span={12}>
                    <Card size="small" title="Tiến triển BMI">
                      {bmiProgression ? (
                        <div className="space-y-2">
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="BMI hiện tại"
                                value={bmiProgression.current}
                                precision={1}
                                valueStyle={{
                                  color: bmiProgression.current < 18.5
                                    ? '#f59e0b'
                                    : bmiProgression.current > 25
                                    ? '#ef4444'
                                    : '#10b981',
                                }}
                              />
                            </Col>
                            <Col span={12}>
                              <div className="pt-4">
                                <Tag
                                  color={
                                    bmiProgression.trend === 'improving'
                                      ? 'green'
                                      : bmiProgression.trend === 'declining'
                                      ? 'red'
                                      : 'blue'
                                  }
                                >
                                  {bmiProgression.trend === 'improving'
                                    ? 'Cải thiện'
                                    : bmiProgression.trend === 'declining'
                                    ? 'Giảm'
                                    : 'Ổn định'}
                                </Tag>
                              </div>
                            </Col>
                          </Row>
                          {bmiProgression.history && bmiProgression.history.length > 0 && (
                            <div className="mt-3">
                              <BMIProgressionChart
                                history={bmiProgression.history}
                                current={bmiProgression.current}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          Chưa có dữ liệu BMI
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>

                {/* Recent Alerts Table */}
                <Card size="small" title="Cảnh báo gần đây">
                  {alertsLoading ? (
                    <div className="text-center py-4">
                      <Spin size="small" />
                    </div>
                  ) : alerts.length > 0 ? (
                    <Table
                      dataSource={alerts.slice(0, 5)}
                      rowKey="alertId"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: 'Loại',
                          dataIndex: 'type',
                          key: 'type',
                        },
                        {
                          title: 'Mức độ',
                          dataIndex: 'severity',
                          key: 'severity',
                          render: (severity: string) => {
                            const colors: Record<string, string> = {
                              Critical: 'red',
                              High: 'orange',
                              Medium: 'blue',
                              Low: 'green',
                            };
                            return <Tag color={colors[severity] || 'default'}>{severity}</Tag>;
                          },
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status: string) => {
                            const colors: Record<string, string> = {
                              Open: 'red',
                              Acknowledged: 'orange',
                              Resolved: 'green',
                            };
                            return <Tag color={colors[status] || 'default'}>{status}</Tag>;
                          },
                        },
                        {
                          title: 'Thời gian',
                          dataIndex: 'triggeredAt',
                          key: 'triggeredAt',
                          render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                        },
                      ]}
                    />
                  ) : (
                    <div className="text-gray-500 text-center py-4">Không có cảnh báo nào</div>
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
      {/* Lab Result Modal */}
      <Modal
        title={selectedLabResult ? 'Chỉnh sửa kết quả xét nghiệm' : 'Thêm kết quả xét nghiệm'}
        open={labResultModalVisible}
        onOk={handleSaveLabResult}
        onCancel={() => {
          setLabResultModalVisible(false);
          setSelectedLabResult(null);
          labResultForm.resetFields();
        }}
        width={600}
      >
        <Form form={labResultForm} layout="vertical">
          <Form.Item name="testDate" label="Ngày xét nghiệm">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
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
          <Form.Item name="result" label="Kết quả">
            <Input.TextArea rows={4} placeholder="Nhập kết quả xét nghiệm" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Rehabilitation Record Modal */}
      <Modal
        title={selectedRehabilitationRecord ? 'Chỉnh sửa hồ sơ phục hồi chức năng' : 'Thêm hồ sơ phục hồi chức năng'}
        open={rehabilitationRecordModalVisible}
        onOk={handleSaveRehabilitationRecord}
        onCancel={() => {
          setRehabilitationRecordModalVisible(false);
          setSelectedRehabilitationRecord(null);
          rehabilitationRecordForm.resetFields();
        }}
        width={600}
      >
        <Form form={rehabilitationRecordForm} layout="vertical">
          <Form.Item name="startDate" label="Ngày bắt đầu">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="status" label="Tình trạng">
            <Select placeholder="Chọn tình trạng">
              <Select.Option value="Đang thực hiện">Đang thực hiện</Select.Option>
              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
              <Select.Option value="Tạm dừng">Tạm dừng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Ghi chú về quá trình phục hồi chức năng" />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ElderlyDetailModal;
