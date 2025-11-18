import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Descriptions,
  Tabs,
  Alert,
  Select,
  Spin,
  Upload,
  List,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  HeartOutlined,
  FireOutlined,
  DashboardOutlined,
  MonitorOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchEldersController } from '../api/elders';
import {
  createVitalReading,
  fetchVitalReadings,
  VitalReadingDto,
  importVitals,
} from '../api/vitals';
import VitalSignsMonitor from './VitalSignsMonitor';

const { Option } = Select;

interface ElderOption {
  id: number;
  name: string;
}

interface Metric {
  value: number;
  unit?: string;
  timestamp?: string;
}

interface BloodPressureMetric {
  systolic?: number;
  diastolic?: number;
  unit?: string;
  timestamp?: string;
}

interface HealthRecordRow {
  id: string;
  elderId: number;
  elderName: string;
  timestamp: string;
  bloodPressure?: BloodPressureMetric;
  heartRate?: Metric;
  temperature?: Metric;
  spo2?: Metric;
  glucose?: Metric;
  weight?: Metric;
  height?: Metric;
  source?: string | null;
  recordedBy?: string | null;
}

const normalizeType = (type?: string) => type?.trim().toUpperCase() ?? '';

const groupVitalReadings = (
  readings: VitalReadingDto[],
  elderMap: Map<number, string>,
): HealthRecordRow[] => {
  const sessions = new Map<string, HealthRecordRow>();

  readings.forEach(reading => {
    const readingTime = dayjs(reading.timestamp);
    const sessionKey = `${reading.elderId}|${readingTime
      .startOf('minute')
      .toISOString()}`;

    let record = sessions.get(sessionKey);

    if (!record) {
      record = {
        id: `${reading.elderId}-${readingTime.valueOf()}`,
        elderId: reading.elderId,
        elderName:
          elderMap.get(reading.elderId) ||
          `Người cao tuổi #${reading.elderId}`,
        timestamp: readingTime.toISOString(),
        source: reading.source ?? null,
        recordedBy: reading.recorder?.fullName ?? null,
      };
      sessions.set(sessionKey, record);
    } else {
      if (!record.recordedBy && reading.recorder?.fullName) {
        record.recordedBy = reading.recorder.fullName;
      }
      if (!record.source && reading.source) {
        record.source = reading.source;
      }
      if (dayjs(record.timestamp).isBefore(readingTime)) {
        record.timestamp = readingTime.toISOString();
      }
    }

    // Xử lý format mới (systolic, diastolic, heartRate, etc.)
    if (reading.systolic !== null && reading.systolic !== undefined) {
      record.bloodPressure = record.bloodPressure ?? {};
      record.bloodPressure.systolic = reading.systolic;
      record.bloodPressure.unit = 'mmHg';
      record.bloodPressure.timestamp = reading.timestamp;
    }

    if (reading.diastolic !== null && reading.diastolic !== undefined) {
      record.bloodPressure = record.bloodPressure ?? {};
      record.bloodPressure.diastolic = reading.diastolic;
      record.bloodPressure.unit = 'mmHg';
      record.bloodPressure.timestamp = reading.timestamp;
    }

    if (reading.heartRate !== null && reading.heartRate !== undefined) {
      record.heartRate = {
        value: reading.heartRate,
        unit: 'bpm',
        timestamp: reading.timestamp,
      };
    }

    if (reading.temperature !== null && reading.temperature !== undefined) {
      record.temperature = {
        value: reading.temperature,
        unit: '°C',
        timestamp: reading.timestamp,
      };
    }

    if (reading.spo2 !== null && reading.spo2 !== undefined) {
      record.spo2 = {
        value: reading.spo2,
        unit: '%',
        timestamp: reading.timestamp,
      };
    }

    if (reading.bloodGlucose !== null && reading.bloodGlucose !== undefined) {
      record.glucose = {
        value: reading.bloodGlucose,
        unit: 'mg/dL',
        timestamp: reading.timestamp,
      };
    }

    if (reading.weight !== null && reading.weight !== undefined) {
      record.weight = {
        value: reading.weight,
        unit: 'kg',
        timestamp: reading.timestamp,
      };
    }

    if (reading.height !== null && reading.height !== undefined) {
      record.height = {
        value: reading.height,
        unit: 'cm',
        timestamp: reading.timestamp,
      };
    }

    // Xử lý format cũ (type/value/unit) để backward compatibility
    if (reading.type && reading.value !== null && reading.value !== undefined) {
      const normalizedType = normalizeType(reading.type);
      const metric: Metric = {
        value: reading.value,
        unit: reading.unit,
        timestamp: reading.timestamp,
      };

      switch (normalizedType) {
      case 'BP_SYSTOLIC':
      case 'SYSTOLIC':
      case 'BLOOD_PRESSURE_SYSTOLIC':
        record.bloodPressure = record.bloodPressure ?? {};
        record.bloodPressure.systolic = reading.value;
        record.bloodPressure.unit =
          reading.unit || record.bloodPressure.unit || 'mmHg';
        record.bloodPressure.timestamp = reading.timestamp;
        break;
      case 'BP_DIASTOLIC':
      case 'DIASTOLIC':
      case 'BLOOD_PRESSURE_DIASTOLIC':
        record.bloodPressure = record.bloodPressure ?? {};
        record.bloodPressure.diastolic = reading.value;
        record.bloodPressure.unit =
          reading.unit || record.bloodPressure.unit || 'mmHg';
        record.bloodPressure.timestamp = reading.timestamp;
        break;
      case 'HEART_RATE':
      case 'PULSE':
        record.heartRate = metric;
        break;
      case 'TEMPERATURE':
      case 'BODY_TEMPERATURE':
        record.temperature = metric;
        break;
      case 'SPO2':
      case 'OXYGEN_SATURATION':
        record.spo2 = metric;
        break;
      case 'GLUCOSE':
      case 'BLOOD_GLUCOSE':
        record.glucose = metric;
        break;
      case 'WEIGHT':
        record.weight = metric;
        break;
      case 'HEIGHT':
        record.height = metric;
        break;
      default:
        break;
      }
    }
  });

  return Array.from(sessions.values()).sort(
    (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
  );
};

const getBloodPressureStatus = (
  systolic?: number,
  diastolic?: number,
): { color: string; text: string } => {
  if (systolic == null || diastolic == null) {
    return { color: 'default', text: 'Chưa có dữ liệu' };
  }
  if (systolic < 120 && diastolic < 80) {
    return { color: 'green', text: 'Bình thường' };
  }
  if (systolic < 130 && diastolic < 80) {
    return { color: 'orange', text: 'Cao nhẹ' };
  }
  if (systolic < 140 && diastolic < 90) {
    return { color: 'orange', text: 'Tăng huyết áp giai đoạn 1' };
  }
  if (systolic < 180 && diastolic < 120) {
    return { color: 'red', text: 'Tăng huyết áp giai đoạn 2' };
  }
  return { color: 'red', text: 'Khủng hoảng tăng huyết áp' };
};

const HealthRecords: React.FC = () => {
  const [elders, setElders] = useState<ElderOption[]>([]);
  const [selectedElderId, setSelectedElderId] = useState<string>('all');
  const [healthRecords, setHealthRecords] = useState<HealthRecordRow[]>([]);
  const [loadingElders, setLoadingElders] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecordRow | null>(
    null,
  );
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  
  // Sử dụng ref để lưu elders hiện tại và tránh vòng lặp dependency
  const eldersRef = useRef<ElderOption[]>([]);
  useEffect(() => {
    eldersRef.current = elders;
  }, [elders]);

  const loadHealthRecords = useCallback(
    async (scope: string, eldersSnapshot?: ElderOption[]) => {
      const elderList = eldersSnapshot ?? eldersRef.current;
      if (scope === 'all' && elderList.length === 0) {
        setHealthRecords([]);
        return;
      }

      setLoadingRecords(true);
      try {
        let readings: VitalReadingDto[] = [];

        if (scope === 'all') {
          const results = await Promise.all(
            elderList.map(async elder => {
              try {
                const res = await fetchVitalReadings(elder.id, { limit: 150 });
                return res;
              } catch (err) {
                console.error(
                  `Failed to fetch vitals for elder ${elder.id}`,
                  err,
                );
                return [];
              }
            }),
          );
          readings = results.flat();
        } else {
          const elderId = Number(scope);
          if (!Number.isFinite(elderId)) {
            setHealthRecords([]);
            return;
          }
          readings = await fetchVitalReadings(elderId, { limit: 200 });
        }

        const elderMap = new Map<number, string>(
          elderList.map(elder => [elder.id, elder.name]),
        );
        setHealthRecords(groupVitalReadings(readings, elderMap));
      } catch (error) {
        console.error('Failed to load health records', error);
        message.error('Không thể tải dữ liệu hồ sơ sức khỏe');
        setHealthRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    },
    [], // Loại bỏ elders khỏi dependency để tránh vòng lặp vô hạn
  );

  const loadElders = useCallback(async () => {
    setLoadingElders(true);
    try {
      const data = await fetchEldersController();
      const mapped = data.map<ElderOption>(elder => ({
        id: Number(elder.id),
        name: elder.fullName || `Người cao tuổi #${elder.id}`,
      }));
      setElders(mapped);
      eldersRef.current = mapped;
      if (mapped.length === 0) {
        setHealthRecords([]);
      } else {
        await loadHealthRecords('all', mapped);
      }
    } catch (error) {
      console.error('Failed to load elders', error);
      message.error('Không thể tải danh sách người cao tuổi');
    } finally {
      setLoadingElders(false);
    }
  }, [loadHealthRecords]);

  // Chỉ load elders một lần khi component mount
  useEffect(() => {
    loadElders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load health records khi selectedElderId thay đổi (không phụ thuộc vào elders để tránh vòng lặp)
  useEffect(() => {
    if (eldersRef.current.length === 0) {
      setHealthRecords([]);
      return;
    }
    loadHealthRecords(selectedElderId, eldersRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElderId]);

  const handleAdd = () => {
    if (elders.length === 0) {
      message.warning('Chưa có người cao tuổi để ghi nhận chỉ số');
      return;
    }
    form.resetFields();
    if (selectedElderId !== 'all') {
      form.setFieldsValue({ elderlyId: Number(selectedElderId) });
    }
    setIsModalVisible(true);
  };

  const handleView = (record: HealthRecordRow) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const elderId = Number(values.elderlyId);
      const source: string = values.source || 'Manual';
      // Notes không được entity hỗ trợ, nên bỏ qua
      // const notes: string | undefined = values.notes || undefined;

      // Gộp tất cả các chỉ số vào 1 payload duy nhất để lưu vào 1 dòng database
      const payload: any = {
        source,
      };

      if (values.bpSystolic != null) {
        payload.systolic = values.bpSystolic;
      }
      if (values.bpDiastolic != null) {
        payload.diastolic = values.bpDiastolic;
      }
      if (values.heartRate != null) {
        payload.heartRate = values.heartRate;
      }
      if (values.temperature != null) {
        payload.temperature = values.temperature;
      }
      if (values.spo2 != null) {
        payload.spo2 = values.spo2;
      }
      if (values.glucose != null) {
        payload.bloodGlucose = values.glucose;
      }
      if (values.weight != null) {
        payload.weight = values.weight;
      }
      if (values.height != null) {
        payload.height = values.height;
      }

      // Kiểm tra có ít nhất 1 chỉ số
      const hasAnyVital = 
        payload.systolic !== undefined ||
        payload.diastolic !== undefined ||
        payload.heartRate !== undefined ||
        payload.temperature !== undefined ||
        payload.spo2 !== undefined ||
        payload.bloodGlucose !== undefined ||
        payload.weight !== undefined ||
        payload.height !== undefined;

      if (!hasAnyVital) {
        message.warning('Vui lòng nhập ít nhất một chỉ số');
        return;
      }

      setSubmitting(true);
      // Gọi API 1 lần duy nhất với tất cả các chỉ số
      await createVitalReading(elderId, payload);
      message.success('Ghi nhận chỉ số thành công');
      setIsModalVisible(false);
      form.resetFields();
      if (selectedElderId === 'all') {
        await loadHealthRecords('all', elders);
      } else if (Number(selectedElderId) === elderId) {
        await loadHealthRecords(selectedElderId, elders);
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      console.error('Failed to create vital readings', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể ghi nhận chỉ số, vui lòng thử lại';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      setImportErrors([]);
      setImportResult(null);
      
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv',
      ];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        message.error('File không hợp lệ. Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)');
        setImporting(false);
        return false;
      }

      const result = await importVitals(file);
      setImportResult({ imported: result.imported, failed: result.failed });
      
      if (result.success) {
        if (result.imported > 0) {
          message.success(
            `Import thành công! Đã tạo ${result.imported} chỉ số sức khỏe. ${result.failed > 0 ? `${result.failed} chỉ số bị lỗi.` : ''}`
          );
          if (selectedElderId === 'all') {
            await loadHealthRecords('all', elders);
          } else {
            await loadHealthRecords(selectedElderId, elders);
          }
        }
        
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
        }
        
        if (result.failed === 0) {
          // All successful, close modal after 2 seconds
          setTimeout(() => {
            setImportModalVisible(false);
            setImportErrors([]);
            setImportResult(null);
          }, 2000);
        }
      } else {
        message.warning(result.message || 'Import thất bại');
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể import file. Vui lòng kiểm tra định dạng file.';
      message.error(errorMessage);
      
      // Try to extract errors from response
      if (error?.response?.data?.errors) {
        setImportErrors(error.response.data.errors);
      }
    } finally {
      setImporting(false);
    }
    return false; // Prevent default upload
  };

  const handleDownloadTemplate = () => {
    // Create template Excel data with examples
    const templateData = [
      ['Mã người cao tuổi', 'Loại chỉ số', 'Giá trị', 'Đơn vị', 'Thời gian', 'Nguồn', 'Người ghi nhận', 'Ghi chú'],
      ['1', 'BP_SYSTOLIC', '120', 'mmHg', '2024-01-15 08:00', 'Manual', '', ''],
      ['1', 'BP_DIASTOLIC', '80', 'mmHg', '2024-01-15 08:00', 'Manual', '', ''],
      ['1', 'HEART_RATE', '72', 'bpm', '2024-01-15 08:00', 'Manual', '', ''],
      ['2', 'TEMPERATURE', '36.5', '°C', '2024-01-15 09:00', 'IoT', '', ''],
      ['2', 'SPO2', '98', '%', '2024-01-15 09:00', 'IoT', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Lưu ý:', '', '', '', '', '', '', ''],
      ['- Mã người cao tuổi: Bắt buộc, phải tồn tại trong hệ thống', '', '', '', '', '', '', ''],
      ['- Loại chỉ số: BP_SYSTOLIC, BP_DIASTOLIC, HEART_RATE, TEMPERATURE, SPO2, GLUCOSE, WEIGHT, HEIGHT', '', '', '', '', '', '', ''],
      ['- Giá trị: Bắt buộc, phải là số', '', '', '', '', '', '', ''],
      ['- Đơn vị: Tùy chọn (mmHg, bpm, °C, %, mg/dL, kg, cm), hệ thống sẽ tự động đặt nếu bỏ trống', '', '', '', '', '', '', ''],
      ['- Thời gian: Hỗ trợ YYYY-MM-DD HH:mm (2024-01-15 08:00) hoặc DD/MM/YYYY HH:mm (15/01/2024 08:00)', '', '', '', '', '', '', ''],
      ['- Nguồn: Tùy chọn (Manual, IoT), mặc định là Manual', '', '', '', '', '', '', ''],
      ['- Người ghi nhận: Tùy chọn, mã người dùng trong hệ thống', '', '', '', '', '', '', ''],
      ['- Dòng đầu tiên là tiêu đề, không được xóa', '', '', '', '', '', '', ''],
    ];

    // Convert to CSV with proper escaping
    const csv = templateData.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr || '';
      }).join(',')
    ).join('\n');
    
    // Add BOM for UTF-8 to ensure Vietnamese characters display correctly in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'mau_import_chi_so_suc_khoe.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã tải file mẫu');
  };

  const stats = useMemo(() => {
    const now = dayjs();
    const total = healthRecords.length;
    const thisMonth = healthRecords.filter(record =>
      dayjs(record.timestamp).isSame(now, 'month'),
    ).length;
    const highBP = healthRecords.filter(record => {
      const { systolic, diastolic } = record.bloodPressure ?? {};
      return (
        (systolic != null && systolic >= 140) ||
        (diastolic != null && diastolic >= 90)
      );
    }).length;
    const normalBP = healthRecords.filter(record => {
      const { systolic, diastolic } = record.bloodPressure ?? {};
      if (systolic == null || diastolic == null) return false;
      return systolic < 120 && diastolic < 80;
    }).length;
    const iotRecords = healthRecords.filter(
      record => record.source?.toLowerCase() === 'iot',
    ).length;

    return { total, thisMonth, highBP, normalBP, iotRecords };
  }, [healthRecords]);

  const columns: ColumnsType<HealthRecordRow> = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) =>
        dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderName',
      key: 'elderName',
    },
    {
      title: 'Huyết áp',
      key: 'bloodPressure',
      render: (_: any, record) => {
        const systolic = record.bloodPressure?.systolic;
        const diastolic = record.bloodPressure?.diastolic;
        if (systolic == null && diastolic == null) {
          return '-';
        }
        const status = getBloodPressureStatus(systolic, diastolic);
        return (
          <div>
            <div className="font-medium">
              {systolic ?? '-'} / {diastolic ?? '-'}{' '}
              {record.bloodPressure?.unit || 'mmHg'}
            </div>
            <Tag color={status.color} className="text-xs">
              {status.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Nhịp tim',
      key: 'heartRate',
      render: (_: any, record) => {
        const hr = record.heartRate?.value;
        if (hr == null) return '-';
        return (
          <div className="flex items-center">
            <HeartOutlined className="mr-1 text-red-500" />
            {hr} {record.heartRate?.unit || 'bpm'}
          </div>
        );
      },
    },
    {
      title: 'Nhiệt độ',
      key: 'temperature',
      render: (_: any, record) => {
        const temp = record.temperature?.value;
        if (temp == null) return '-';
        return (
          <div className="flex items-center">
            <FireOutlined className="mr-1 text-orange-500" />
            {temp.toFixed(1)} {record.temperature?.unit || '°C'}
          </div>
        );
      },
    },
    {
      title: 'SpO₂',
      key: 'spo2',
      render: (_: any, record) => {
        const spo2 = record.spo2?.value;
        if (spo2 == null) return '-';
        return (
          <div className="flex items-center">
            <DashboardOutlined className="mr-1 text-blue-500" />
            {spo2} {record.spo2?.unit || '%'}
          </div>
        );
      },
    },
    {
      title: 'Đường huyết',
      key: 'glucose',
      render: (_: any, record) => {
        const glucose = record.glucose?.value;
        if (glucose == null) return '-';
        return `${glucose} ${record.glucose?.unit || 'mg/dL'}`;
      },
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      render: (source: string | null | undefined) =>
        source ? (
          <Tag color={source === 'IoT' ? 'geekblue' : 'purple'}>{source}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Người ghi nhận',
      dataIndex: 'recordedBy',
      key: 'recordedBy',
      render: (recordedBy: string | null | undefined) => recordedBy ?? '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Theo dõi sức khỏe
          </h1>
          <p className="text-gray-600">
            Giám sát sinh hiệu và quản lý hồ sơ sức khỏe người cao tuổi
          </p>
        </div>
        <Space wrap>
          <Select
            value={selectedElderId}
            onChange={value => setSelectedElderId(String(value))}
            loading={loadingElders}
            style={{ minWidth: 220 }}
          >
            <Option value="all">Tất cả người cao tuổi</Option>
            {elders.map(elder => (
              <Option key={elder.id} value={elder.id}>
                {elder.name}
              </Option>
            ))}
          </Select>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            size="large"
          >
            Tải file mẫu
          </Button>
          <Button
            icon={<UploadOutlined />}
            size="large"
            onClick={() => setImportModalVisible(true)}
          >
            Import dữ liệu
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            disabled={elders.length === 0}
          >
            Ghi nhận chỉ số
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hồ sơ"
              value={stats.total}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#0ea5e9' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Huyết áp cao"
              value={stats.highBP}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nguồn IoT"
              value={stats.iotRecords}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
      </Row>

      {stats.highBP > 0 && (
        <Alert
          message="Cảnh báo sức khỏe"
          description={`Có ${stats.highBP} lần ghi nhận huyết áp cao. Vui lòng theo dõi sát sao và can thiệp kịp thời.`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      <Card>
        <Tabs
          defaultActiveKey="monitor"
          items={[
            {
              key: 'monitor',
              label: (
                <span>
                  <MonitorOutlined />
                  Theo dõi real-time
                </span>
              ),
              children: <VitalSignsMonitor />,
            },
            {
              key: 'records',
              label: (
                <span>
                  <HistoryOutlined />
                  Lịch sử hồ sơ
                </span>
              ),
              children: (
                <Spin spinning={loadingRecords}>
                  <Table
                    columns={columns}
                    dataSource={healthRecords}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} bản ghi`,
                    }}
                    scroll={{ x: 900 }}
                  />
                </Spin>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Ghi nhận chỉ số sinh hiệu"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={720}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            source: 'Manual',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="elderlyId"
                label="Người cao tuổi"
                rules={[
                  { required: true, message: 'Vui lòng chọn người cao tuổi' },
                ]}
              >
                <Select placeholder="Chọn người cao tuổi">
                  {elders.map(elder => (
                    <Option key={elder.id} value={elder.id}>
                      {elder.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="Nguồn ghi nhận">
                <Select>
                  <Option value="Manual">Manual</Option>
                  <Option value="IoT">IoT</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bpSystolic" label="Huyết áp tâm thu (mmHg)">
                <InputNumber
                  min={50}
                  max={260}
                  className="w-full"
                  placeholder="Ví dụ: 120"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bpDiastolic" label="Huyết áp tâm trương (mmHg)">
                <InputNumber
                  min={30}
                  max={200}
                  className="w-full"
                  placeholder="Ví dụ: 80"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="heartRate" label="Nhịp tim (bpm)">
                <InputNumber
                  min={30}
                  max={220}
                  className="w-full"
                  placeholder="Ví dụ: 75"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="temperature" label="Nhiệt độ (°C)">
                <InputNumber
                  min={30}
                  max={45}
                  step={0.1}
                  className="w-full"
                  placeholder="Ví dụ: 36.7"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="spo2" label="SpO₂ (%)">
                <InputNumber
                  min={50}
                  max={100}
                  className="w-full"
                  placeholder="Ví dụ: 97"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="glucose" label="Đường huyết (mg/dL)">
                <InputNumber
                  min={20}
                  max={600}
                  className="w-full"
                  placeholder="Ví dụ: 110"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label="Cân nặng (kg)">
                <InputNumber
                  min={20}
                  max={200}
                  step={0.1}
                  className="w-full"
                  placeholder="Ví dụ: 62.5"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="height" label="Chiều cao (cm)">
                <InputNumber
                  min={100}
                  max={210}
                  className="w-full"
                  placeholder="Ví dụ: 165"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="Lưu ý"
            description="Thời gian ghi nhận sẽ lấy theo thời điểm hiện tại. Bạn có thể chọn nguồn là IoT hoặc Manual để phân loại dữ liệu."
          />
        </Form>
      </Modal>

      <Modal
        title="Chi tiết chỉ số sức khỏe"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              setSelectedRecord(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={640}
      >
        {selectedRecord && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Người cao tuổi">
              {selectedRecord.elderName}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian ghi nhận">
              {dayjs(selectedRecord.timestamp).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Nguồn">
              {selectedRecord.source ? (
                <Tag
                  color={selectedRecord.source === 'IoT' ? 'geekblue' : 'purple'}
                >
                  {selectedRecord.source}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Người ghi nhận">
              {selectedRecord.recordedBy ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Huyết áp">
              {selectedRecord.bloodPressure?.systolic != null ||
              selectedRecord.bloodPressure?.diastolic != null ? (
                <>
                  {selectedRecord.bloodPressure?.systolic ?? '-'} /{' '}
                  {selectedRecord.bloodPressure?.diastolic ?? '-'}{' '}
                  {selectedRecord.bloodPressure?.unit || 'mmHg'}
                </>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nhịp tim">
              {selectedRecord.heartRate?.value != null
                ? `${selectedRecord.heartRate.value} ${
                    selectedRecord.heartRate.unit || 'bpm'
                  }`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Nhiệt độ">
              {selectedRecord.temperature?.value != null
                ? `${selectedRecord.temperature.value.toFixed(1)} ${
                    selectedRecord.temperature.unit || '°C'
                  }`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="SpO₂">
              {selectedRecord.spo2?.value != null
                ? `${selectedRecord.spo2.value} ${
                    selectedRecord.spo2.unit || '%'
                  }`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Đường huyết">
              {selectedRecord.glucose?.value != null
                ? `${selectedRecord.glucose.value} ${
                    selectedRecord.glucose.unit || 'mg/dL'
                  }`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng">
              {selectedRecord.weight?.value != null
                ? `${selectedRecord.weight.value} ${
                    selectedRecord.weight.unit || 'kg'
                  }`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Chiều cao">
              {selectedRecord.height?.value != null
                ? `${selectedRecord.height.value} ${
                    selectedRecord.height.unit || 'cm'
                  }`
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import dữ liệu chỉ số sức khỏe"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setImportErrors([]);
          setImportResult(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setImportModalVisible(false);
              setImportErrors([]);
              setImportResult(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={700}
      >
        <div className="space-y-4">
          <Upload
            beforeUpload={handleImport}
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            disabled={importing}
          >
            <Button
              icon={<UploadOutlined />}
              loading={importing}
              type="primary"
              block
            >
              {importing ? 'Đang import...' : 'Chọn file để import'}
            </Button>
          </Upload>

          {importResult && (
            <Alert
              message="Kết quả import"
              description={
                <div>
                  <p>✅ Đã import thành công: {importResult.imported} chỉ số</p>
                  {importResult.failed > 0 && (
                    <p>❌ Bị lỗi: {importResult.failed} chỉ số</p>
                  )}
                </div>
              }
              type={importResult.failed === 0 ? 'success' : 'warning'}
              showIcon
            />
          )}

          {importErrors.length > 0 && (
            <div>
              <Alert
                message="Danh sách lỗi (hiển thị tối đa 10 lỗi đầu tiên)"
                type="error"
                showIcon
                className="mb-2"
              />
              <List
                size="small"
                bordered
                dataSource={importErrors}
                renderItem={(error, index) => (
                  <List.Item className="text-red-600 text-xs">
                    {index + 1}. {error}
                  </List.Item>
                )}
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              />
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Hướng dẫn:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
              <li>File phải là định dạng Excel (.xlsx, .xls) hoặc CSV (.csv)</li>
              <li>Dòng đầu tiên phải là tiêu đề các cột</li>
              <li>Các cột bắt buộc: Mã người cao tuổi, Loại chỉ số, Giá trị</li>
              <li>Các cột tùy chọn: Đơn vị, Thời gian, Nguồn, Người ghi nhận, Ghi chú</li>
              <li>Nhấn nút "Tải file mẫu" để xem cấu trúc file mẫu</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HealthRecords;
