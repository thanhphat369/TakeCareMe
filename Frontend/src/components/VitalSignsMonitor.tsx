import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Button,
  Badge,
  Space,
  Tag,
  Timeline,
  Avatar,
  Select,
  Spin,
  Empty,
} from 'antd';
import {
  HeartOutlined,
  FireOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { fetchEldersController } from '../api/elders';
import { fetchVitalReadings, VitalReadingDto } from '../api/vitals';

const { Option } = Select;

type SeverityLevel = 'normal' | 'warning' | 'critical';

interface ElderOption {
  id: number;
  name: string;
}

interface VitalMetric {
  value: number | null;
  unit?: string;
  timestamp?: string;
}

interface VitalSummary {
  bloodPressure?: {
    systolic: number | null;
    diastolic: number | null;
    unit?: string;
    timestamp?: string;
  };
  heartRate?: VitalMetric;
  temperature?: VitalMetric;
  oxygenSaturation?: VitalMetric;
  recordedBy?: string | null;
  source?: string | null;
  lastUpdated?: string | null;
}

interface StatusInfo {
  status: string;
  color: string;
  text: string;
}

const BP_SYSTOLIC_KEYS = ['BP_SYSTOLIC', 'SYSTOLIC', 'BLOOD_PRESSURE_SYSTOLIC'];
const BP_DIASTOLIC_KEYS = ['BP_DIASTOLIC', 'DIASTOLIC', 'BLOOD_PRESSURE_DIASTOLIC'];
const HEART_RATE_KEYS = ['HEART_RATE', 'PULSE'];
const TEMPERATURE_KEYS = ['TEMPERATURE', 'BODY_TEMPERATURE'];
const SPO2_KEYS = ['SPO2', 'OXYGEN_SATURATION'];

const severityPriority: Record<SeverityLevel, number> = {
  normal: 1,
  warning: 2,
  critical: 3,
};

const severityColor: Record<SeverityLevel, string> = {
  normal: '#52c41a',
  warning: '#fa8c16',
  critical: '#ff4d4f',
};

const severityText: Record<SeverityLevel, string> = {
  normal: 'Bình thường',
  warning: 'Cảnh báo',
  critical: 'Khẩn cấp',
};

const normalizeType = (type?: string) => type?.trim().toUpperCase() ?? '';

const getBloodPressureStatus = (systolic: number, diastolic: number): StatusInfo => {
  if (systolic < 120 && diastolic < 80) return { status: 'normal', color: 'green', text: 'Bình thường' };
  if (systolic < 130 && diastolic < 80) return { status: 'elevated', color: 'orange', text: 'Cao nhẹ' };
  if (systolic < 140 && diastolic < 90) return { status: 'stage1', color: 'orange', text: 'Tăng huyết áp giai đoạn 1' };
  if (systolic < 180 && diastolic < 120) return { status: 'stage2', color: 'red', text: 'Tăng huyết áp giai đoạn 2' };
  return { status: 'crisis', color: 'red', text: 'Khủng hoảng tăng huyết áp' };
};

const getHeartRateStatus = (heartRate: number): StatusInfo => {
  if (heartRate < 60) return { status: 'low', color: 'blue', text: 'Chậm' };
  if (heartRate > 100) return { status: 'high', color: 'red', text: 'Nhanh' };
  return { status: 'normal', color: 'green', text: 'Bình thường' };
};

const getTemperatureStatus = (temperature: number): StatusInfo => {
  if (temperature < 36.0) return { status: 'low', color: 'blue', text: 'Thấp' };
  if (temperature > 37.5) return { status: 'high', color: 'red', text: 'Sốt' };
  return { status: 'normal', color: 'green', text: 'Bình thường' };
};

const getOxygenStatus = (oxygen: number): StatusInfo => {
  if (oxygen < 90) return { status: 'low', color: 'red', text: 'Thiếu oxy nặng' };
  if (oxygen < 95) return { status: 'warning', color: 'orange', text: 'Cảnh báo thiếu oxy' };
  return { status: 'normal', color: 'green', text: 'Bình thường' };
};

const mapBpStatusToSeverity = (status: string): SeverityLevel => {
  switch (status) {
    case 'crisis':
      return 'critical';
    case 'stage2':
    case 'stage1':
    case 'elevated':
      return 'warning';
    default:
      return 'normal';
  }
};

const mapSimpleStatusToSeverity = (status: string): SeverityLevel => {
  switch (status) {
    case 'low':
      return 'critical';
    case 'high':
    case 'warning':
      return 'warning';
    default:
      return 'normal';
  }
};

const deriveOverallStatus = (summary?: VitalSummary) => {
  if (!summary) {
    return { status: 'unknown', color: 'default', text: 'Chưa có dữ liệu' };
  }

  let highest: SeverityLevel = 'normal';

  if (
    summary.bloodPressure?.systolic != null &&
    summary.bloodPressure?.diastolic != null
  ) {
    const bpStatus = getBloodPressureStatus(
      summary.bloodPressure.systolic,
      summary.bloodPressure.diastolic,
    );
    const severity = mapBpStatusToSeverity(bpStatus.status);
    if (severityPriority[severity] > severityPriority[highest]) {
      highest = severity;
    }
  }

  if (summary.heartRate?.value != null) {
    const hrStatus = getHeartRateStatus(summary.heartRate.value);
    const severity = mapSimpleStatusToSeverity(hrStatus.status);
    if (severityPriority[severity] > severityPriority[highest]) {
      highest = severity;
    }
  }

  if (summary.temperature?.value != null) {
    const tempStatus = getTemperatureStatus(summary.temperature.value);
    const severity = mapSimpleStatusToSeverity(tempStatus.status);
    if (severityPriority[severity] > severityPriority[highest]) {
      highest = severity;
    }
  }

  if (summary.oxygenSaturation?.value != null) {
    const oxyStatus = getOxygenStatus(summary.oxygenSaturation.value);
    const severity = oxyStatus.status === 'low' ? 'critical' : mapSimpleStatusToSeverity(oxyStatus.status);
    if (severityPriority[severity] > severityPriority[highest]) {
      highest = severity;
    }
  }

  switch (highest) {
    case 'critical':
      return { status: 'critical', color: 'red', text: 'Khẩn cấp' };
    case 'warning':
      return { status: 'warning', color: 'orange', text: 'Cảnh báo' };
    case 'normal':
      return { status: 'normal', color: 'green', text: 'Bình thường' };
    default:
      return { status: 'unknown', color: 'default', text: 'Chưa có dữ liệu' };
  }
};

const classifyVitalReading = (reading: VitalReadingDto): SeverityLevel => {
  const type = normalizeType(reading.type);
  const value = reading.value ?? 0;

  switch (type) {
    case 'BP_SYSTOLIC':
    case 'SYSTOLIC':
    case 'BLOOD_PRESSURE_SYSTOLIC':
      if (value > 180 || value < 90) return 'critical';
      if (value >= 140) return 'warning';
      return 'normal';
    case 'BP_DIASTOLIC':
    case 'DIASTOLIC':
    case 'BLOOD_PRESSURE_DIASTOLIC':
      if (value > 120 || value < 60) return 'critical';
      if (value >= 90) return 'warning';
      return 'normal';
    case 'HEART_RATE':
    case 'PULSE':
      if (value > 120 || value < 50) return 'critical';
      if (value > 100 || value < 60) return 'warning';
      return 'normal';
    case 'TEMPERATURE':
    case 'BODY_TEMPERATURE':
      if (value >= 39 || value <= 35) return 'critical';
      if (value >= 38 || value <= 36) return 'warning';
      return 'normal';
    case 'SPO2':
    case 'OXYGEN_SATURATION':
      if (value < 90) return 'critical';
      if (value < 95) return 'warning';
      return 'normal';
    case 'GLUCOSE':
      if (value > 250 || value < 60) return 'critical';
      if (value > 200 || value < 70) return 'warning';
      return 'normal';
    default:
      return 'normal';
  }
};

const VitalSignsMonitor: React.FC = () => {
  const [elders, setElders] = useState<ElderOption[]>([]);
  const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
  const [vitalHistory, setVitalHistory] = useState<VitalReadingDto[]>([]);
  const [loadingElders, setLoadingElders] = useState(false);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedElder = useMemo(
    () => elders.find(elder => elder.id === selectedElderId),
    [elders, selectedElderId],
  );

  const loadElders = useCallback(async () => {
    setLoadingElders(true);
    try {
      const data = await fetchEldersController();
      const mapped = data.map(elder => ({
        id: Number(elder.id),
        name: elder.fullName || `Người cao tuổi #${elder.id}`,
      }));

      setElders(mapped);

      if (mapped.length > 0) {
        setSelectedElderId(prev => {
          if (prev && mapped.some(item => item.id === prev)) {
            return prev;
          }
          return mapped[0].id;
        });
      } else {
        setSelectedElderId(null);
      }
    } catch (err) {
      console.error('Failed to load elders', err);
      setError('Không thể tải danh sách người cao tuổi');
    } finally {
      setLoadingElders(false);
    }
  }, []);

  const loadVitals = useCallback(async (elderId: number) => {
    setLoadingVitals(true);
    try {
      const data = await fetchVitalReadings(elderId, { limit: 100 });
      const sorted = [...data].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setVitalHistory(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to load vital readings', err);
      setError('Không thể tải dữ liệu sinh hiệu từ hệ thống');
      setVitalHistory([]);
    } finally {
      setLoadingVitals(false);
    }
  }, []);

  useEffect(() => {
    loadElders();
  }, [loadElders]);

  useEffect(() => {
    if (selectedElderId != null) {
      loadVitals(selectedElderId);
    } else {
      setVitalHistory([]);
    }
  }, [selectedElderId, loadVitals]);

  useEffect(() => {
    if (!isRealTime || selectedElderId == null) {
      return;
    }

    const interval = setInterval(() => {
      loadVitals(selectedElderId);
    }, 15000);

    return () => clearInterval(interval);
  }, [isRealTime, selectedElderId, loadVitals]);

  const summary = useMemo<VitalSummary | undefined>(() => {
    if (vitalHistory.length === 0) return undefined;

    // Lấy timestamp mới nhất (vitalHistory đã được sort DESC)
    const latestTimestamp = vitalHistory[0]?.timestamp;
    if (!latestTimestamp) return undefined;

    // So sánh timestamp bằng string để tránh vấn đề với Date objects
    const latestTimestampStr = typeof latestTimestamp === 'string' 
      ? latestTimestamp 
      : new Date(latestTimestamp).toISOString();

    // Chỉ lấy readings từ lần ghi nhận mới nhất (cùng timestamp)
    // Với format mới, backend trả về mỗi vital sign = 1 object nhưng cùng timestamp
    const latestReadings = vitalHistory.filter(reading => {
      const readingTimestampStr = typeof reading.timestamp === 'string'
        ? reading.timestamp
        : new Date(reading.timestamp).toISOString();
      return readingTimestampStr === latestTimestampStr;
    });

    // Tìm reading mới nhất có format mới (có systolic, diastolic, etc. trực tiếp)
    // Hoặc group readings từ cùng timestamp
    let latestReadingWithNewFormat: VitalReadingDto | undefined;
    const map = new Map<string, VitalReadingDto>();
    
    if (latestReadings.length > 0) {
      // Kiểm tra format mới: nếu reading có systolic, diastolic, etc. trực tiếp
      latestReadingWithNewFormat = latestReadings.find(
        r => r.systolic !== undefined || r.diastolic !== undefined || 
             r.heartRate !== undefined || r.temperature !== undefined || 
             r.spo2 !== undefined || r.bloodGlucose !== undefined
      );
      
      // Nếu có format mới, sử dụng nó
      if (latestReadingWithNewFormat) {
        // Format mới: 1 reading chứa nhiều vital signs
        // Không cần map, sẽ dùng trực tiếp
      } else {
        // Format cũ: mỗi vital sign = 1 reading riêng
        latestReadings.forEach(reading => {
          const key = normalizeType(reading.type);
          if (!map.has(key)) {
            map.set(key, reading);
          }
        });
      }
    }

    // Nếu không tìm thấy trong latestReadings, fallback về logic cũ
    if (!latestReadingWithNewFormat && map.size === 0) {
      vitalHistory.forEach(reading => {
        const key = normalizeType(reading.type);
        if (!map.has(key)) {
          map.set(key, reading);
        }
      });
    }

    const findByKeys = (keys: string[]) => {
      for (const key of keys) {
        const reading = map.get(key);
        if (reading) return reading;
      }
      return undefined;
    };

    // Nếu có format mới, dùng trực tiếp từ latestReadingWithNewFormat
    const systolic = latestReadingWithNewFormat 
      ? (latestReadingWithNewFormat.systolic !== null && latestReadingWithNewFormat.systolic !== undefined
          ? { ...latestReadingWithNewFormat, type: 'SYSTOLIC', value: latestReadingWithNewFormat.systolic, unit: 'mmHg' }
          : undefined)
      : findByKeys(BP_SYSTOLIC_KEYS);
    
    const diastolic = latestReadingWithNewFormat
      ? (latestReadingWithNewFormat.diastolic !== null && latestReadingWithNewFormat.diastolic !== undefined
          ? { ...latestReadingWithNewFormat, type: 'DIASTOLIC', value: latestReadingWithNewFormat.diastolic, unit: 'mmHg' }
          : undefined)
      : findByKeys(BP_DIASTOLIC_KEYS);
    
    const heartRate = latestReadingWithNewFormat
      ? (latestReadingWithNewFormat.heartRate !== null && latestReadingWithNewFormat.heartRate !== undefined
          ? { ...latestReadingWithNewFormat, type: 'HEART_RATE', value: latestReadingWithNewFormat.heartRate, unit: 'bpm' }
          : undefined)
      : findByKeys(HEART_RATE_KEYS);
    
    const temperature = latestReadingWithNewFormat
      ? (latestReadingWithNewFormat.temperature !== null && latestReadingWithNewFormat.temperature !== undefined
          ? { ...latestReadingWithNewFormat, type: 'TEMPERATURE', value: latestReadingWithNewFormat.temperature, unit: '°C' }
          : undefined)
      : findByKeys(TEMPERATURE_KEYS);
    
    const spo2 = latestReadingWithNewFormat
      ? (latestReadingWithNewFormat.spo2 !== null && latestReadingWithNewFormat.spo2 !== undefined
          ? { ...latestReadingWithNewFormat, type: 'SPO2', value: latestReadingWithNewFormat.spo2, unit: '%' }
          : undefined)
      : findByKeys(SPO2_KEYS);
    
    const lastReading = vitalHistory[0] || latestReadingWithNewFormat;

    const recordedBy =
      systolic?.recorder?.fullName ||
      diastolic?.recorder?.fullName ||
      heartRate?.recorder?.fullName ||
      spo2?.recorder?.fullName ||
      temperature?.recorder?.fullName ||
      lastReading?.recorder?.fullName ||
      null;

    const source =
      systolic?.source ||
      diastolic?.source ||
      heartRate?.source ||
      spo2?.source ||
      temperature?.source ||
      lastReading?.source ||
      null;

    return {
      bloodPressure:
        systolic || diastolic
          ? {
              systolic: systolic?.value ?? null,
              diastolic: diastolic?.value ?? null,
              unit: systolic?.unit ?? diastolic?.unit ?? 'mmHg',
              timestamp: systolic?.timestamp ?? diastolic?.timestamp,
            }
          : undefined,
      heartRate: heartRate
        ? {
            value: heartRate.value ?? null,
            unit: heartRate.unit ?? 'bpm',
            timestamp: heartRate.timestamp,
          }
        : undefined,
      temperature: temperature
        ? {
            value: temperature.value ?? null,
            unit: temperature.unit ?? '°C',
            timestamp: temperature.timestamp,
          }
        : undefined,
      oxygenSaturation: spo2
        ? {
            value: spo2.value ?? null,
            unit: spo2.unit ?? '%',
            timestamp: spo2.timestamp,
          }
        : undefined,
      recordedBy,
      source,
      lastUpdated: lastReading?.timestamp ?? null,
    };
  }, [vitalHistory]);

  const overallStatus = useMemo(() => deriveOverallStatus(summary), [summary]);

  const systolicValue = summary?.bloodPressure?.systolic ?? null;
  const diastolicValue = summary?.bloodPressure?.diastolic ?? null;
  const bpStatus =
    systolicValue != null && diastolicValue != null
      ? getBloodPressureStatus(systolicValue, diastolicValue)
      : null;
  const heartRateValue = summary?.heartRate?.value ?? null;
  const heartRateStatus =
    heartRateValue != null ? getHeartRateStatus(heartRateValue) : null;
  const temperatureValue = summary?.temperature?.value ?? null;
  const temperatureStatus =
    temperatureValue != null ? getTemperatureStatus(temperatureValue) : null;
  const oxygenValue = summary?.oxygenSaturation?.value ?? null;
  const oxygenStatus = oxygenValue != null ? getOxygenStatus(oxygenValue) : null;

  const cardBorderClass =
    overallStatus.status === 'critical'
      ? 'border-red-500'
      : overallStatus.status === 'warning'
      ? 'border-orange-500'
      : overallStatus.status === 'normal'
      ? 'border-green-500'
      : 'border-gray-200';

  const badgeStatus =
    overallStatus.status === 'critical'
      ? 'error'
      : overallStatus.status === 'warning'
      ? 'warning'
      : overallStatus.status === 'normal'
      ? 'success'
      : 'default';

  const latestTimestamp = summary?.lastUpdated
    ? new Date(summary.lastUpdated).toLocaleString('vi-VN')
    : 'Chưa có dữ liệu';

  const timelineItems = useMemo(() => vitalHistory.slice(0, 10), [vitalHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Theo dõi sinh hiệu</h1>
          <p className="text-gray-600">
            Dữ liệu sinh hiệu được đồng bộ trực tiếp từ bảng VitalReadings trong cơ sở dữ liệu
          </p>
        </div>
        <Space wrap>
          <Select
            showSearch
            placeholder="Chọn người cao tuổi"
            value={selectedElderId ?? undefined}
            onChange={value => setSelectedElderId(value)}
            loading={loadingElders}
            optionFilterProp="children"
            style={{ minWidth: 220 }}
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {elders.map(elder => (
              <Option key={elder.id} value={elder.id}>
                {elder.name}
              </Option>
            ))}
          </Select>
          <Button type={isRealTime ? 'primary' : 'default'} onClick={() => setIsRealTime(prev => !prev)}>
            {isRealTime ? 'Tắt' : 'Bật'} Real-time
          </Button>
          <Button onClick={() => selectedElderId && loadVitals(selectedElderId)} disabled={loadingVitals}>
            Làm mới
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      {!error && overallStatus.status === 'critical' && selectedElder && (
        <Alert
          message="Cảnh báo khẩn cấp"
          description={`Các chỉ số sinh hiệu của ${selectedElder.name} đang ở mức nguy hiểm, cần can thiệp ngay.`}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      {!error && overallStatus.status === 'warning' && selectedElder && (
        <Alert
          message="Cảnh báo theo dõi"
          description={`Một số chỉ số của ${selectedElder.name} đang cần được theo dõi sát.`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className={`border-2 ${cardBorderClass}`}>
            {loadingVitals ? (
              <div className="flex justify-center py-12">
                <Spin tip="Đang tải dữ liệu sinh hiệu..." />
              </div>
            ) : vitalHistory.length === 0 ? (
              <Empty description="Chưa có dữ liệu sinh hiệu cho người cao tuổi này" />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedElder?.name || 'Người cao tuổi chưa xác định'}
                    </h3>
                    <p className="text-sm text-gray-500">{latestTimestamp}</p>
                  </div>
                  <Badge status={badgeStatus} text={overallStatus.text} />
                </div>

                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12} lg={6}>
                    <div className="text-center p-3 bg-gray-50 rounded h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <HeartOutlined className="text-red-500 mr-1" />
                          <span className="text-xs text-gray-600">Huyết áp</span>
                        </div>
                        <div className="font-bold text-xl">
                          {systolicValue != null && diastolicValue != null
                            ? `${Math.round(systolicValue)}/${Math.round(diastolicValue)}`
                            : '--/--'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {summary?.bloodPressure?.unit || 'mmHg'}
                        </div>
                      </div>
                      <Tag color={bpStatus?.color || 'default'} className="text-xs mt-2">
                        {bpStatus?.text || 'Chưa có dữ liệu'}
                      </Tag>
                    </div>
                  </Col>

                  <Col xs={24} md={12} lg={6}>
                    <div className="text-center p-3 bg-gray-50 rounded h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <HeartOutlined className="text-red-500 mr-1" />
                          <span className="text-xs text-gray-600">Nhịp tim</span>
                        </div>
                        <div className="font-bold text-xl">
                          {heartRateValue != null ? Math.round(heartRateValue) : '--'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {summary?.heartRate?.unit || 'bpm'}
                        </div>
                      </div>
                      <Tag color={heartRateStatus?.color || 'default'} className="text-xs mt-2">
                        {heartRateStatus?.text || 'Chưa có dữ liệu'}
                      </Tag>
                    </div>
                  </Col>

                  <Col xs={24} md={12} lg={6}>
                    <div className="text-center p-3 bg-gray-50 rounded h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <FireOutlined className="text-orange-500 mr-1" />
                          <span className="text-xs text-gray-600">Nhiệt độ</span>
                        </div>
                        <div className="font-bold text-xl">
                          {temperatureValue != null ? temperatureValue.toFixed(1) : '--'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {summary?.temperature?.unit || '°C'}
                        </div>
                      </div>
                      <Tag color={temperatureStatus?.color || 'default'} className="text-xs mt-2">
                        {temperatureStatus?.text || 'Chưa có dữ liệu'}
                      </Tag>
                    </div>
                  </Col>

                  <Col xs={24} md={12} lg={6}>
                    <div className="text-center p-3 bg-gray-50 rounded h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <DashboardOutlined className="text-blue-500 mr-1" />
                          <span className="text-xs text-gray-600">SpO₂</span>
                        </div>
                        <div className="font-bold text-xl">
                          {oxygenValue != null ? Math.round(oxygenValue) : '--'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {summary?.oxygenSaturation?.unit || '%'}
                        </div>
                      </div>
                      <Tag color={oxygenStatus?.color || 'default'} className="text-xs mt-2">
                        {oxygenStatus?.text || 'Chưa có dữ liệu'}
                      </Tag>
                    </div>
                  </Col>
                </Row>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserOutlined />
                      {summary?.recordedBy || 'Hệ thống'}
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined />
                      {latestTimestamp}
                    </div>
                    {summary?.source && (
                      <div>
                        <Tag color={summary.source === 'IoT' ? 'blue' : 'geekblue'}>
                          Nguồn: {summary.source}
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bản ghi"
              value={loadingVitals ? '...' : vitalHistory.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cập nhật gần nhất"
              value={summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleTimeString('vi-VN') : '--'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nhịp tim mới nhất"
              value={heartRateValue != null ? Math.round(heartRateValue) : '--'}
              suffix={heartRateValue != null ? ' bpm' : undefined}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SpO₂ mới nhất"
              value={oxygenValue != null ? Math.round(oxygenValue) : '--'}
              suffix={oxygenValue != null ? ' %' : undefined}
              valueStyle={{ color: '#2f54eb' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Lịch sử ghi nhận">
        {loadingVitals ? (
          <div className="flex justify-center py-10">
            <Spin tip="Đang tải lịch sử..." />
          </div>
        ) : timelineItems.length === 0 ? (
          <Empty description="Chưa có lịch sử ghi nhận" />
        ) : (
          <Timeline>
            {timelineItems.map(reading => {
              const severity = classifyVitalReading(reading);

              return (
                <Timeline.Item
                  key={reading.vitalId}
                  dot={
                    <Avatar size="small" style={{ backgroundColor: severityColor[severity] }}>
                      {severity === 'critical' ? (
                        <ExclamationCircleOutlined />
                      ) : severity === 'warning' ? (
                        <ClockCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                    </Avatar>
                  }
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium capitalize">
                      {reading.type?.replace(/_/g, ' ') || 'Chỉ số'} -{' '}
                      {reading.value != null ? reading.value : '--'} {reading.unit || ''}
                    </div>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-2 items-center">
                      <span>{new Date(reading.timestamp).toLocaleString('vi-VN')}</span>
                      <span>•</span>
                      <span>{reading.recorder?.fullName || 'Hệ thống'}</span>
                      <span>•</span>
                      <Tag color={severityColor[severity]}>{severityText[severity]}</Tag>
                      {reading.source && (
                        <Tag color={reading.source === 'IoT' ? 'blue' : 'default'}>{reading.source}</Tag>
                      )}
                    </div>
                  </div>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </Card>
    </div>
  );
};

export default VitalSignsMonitor;
