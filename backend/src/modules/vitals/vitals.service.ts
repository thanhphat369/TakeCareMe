import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VitalReading } from '../../entities/vital-reading.entity';
import { Elder } from '../../entities/elder.entity';
import { User } from '../../entities/user.entity';
import { CreateVitalReadingDto } from './dto/create-vital-reading.dto';
import { AlertsService } from '../alerts/alerts.service';
import * as XLSX from 'xlsx';

interface RecorderInfo {
  userId: number;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface VitalReadingResponse {
  recordId: number;
  elderId: number;
  source: string;
  recordedBy: number | null;
  systolic: number | null;
  diastolic: number | null;
  heartRate: number | null;
  temperature: number | null;
  spo2: number | null;
  bloodGlucose: number | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
  timestamp: Date;
  recorder: RecorderInfo | null;
  // Legacy fields for backward compatibility
  type?: string;
  value?: number;
  unit?: string;
  vitalId?: number; // Alias for recordId
}

@Injectable()
export class VitalsService {
  constructor(
    @InjectRepository(VitalReading)
    private vitalReadingRepository: Repository<VitalReading>,
    @InjectRepository(Elder)
    private elderRepository: Repository<Elder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private alertsService: AlertsService,
  ) {}

  async create(createVitalReadingDto: CreateVitalReadingDto): Promise<VitalReadingResponse> {
    // Convert old format (type/value/unit) to new format if needed
    let convertedDto: any = { ...createVitalReadingDto };

    // If using old format (type/value/unit), convert to new format
    if (createVitalReadingDto.type && createVitalReadingDto.value !== undefined) {
      const type = createVitalReadingDto.type.toUpperCase();
      const value = createVitalReadingDto.value;

      switch (type) {
        case 'BP_SYSTOLIC':
        case 'SYSTOLIC':
          convertedDto.systolic = value;
          break;
        case 'BP_DIASTOLIC':
        case 'DIASTOLIC':
          convertedDto.diastolic = value;
          break;
        case 'HEART_RATE':
        case 'PULSE':
          convertedDto.heartRate = value;
          break;
        case 'TEMPERATURE':
        case 'BODY_TEMPERATURE':
          convertedDto.temperature = value;
          break;
        case 'SPO2':
        case 'OXYGEN_SATURATION':
          convertedDto.spo2 = value;
          break;
        case 'GLUCOSE':
        case 'BLOOD_GLUCOSE':
          convertedDto.bloodGlucose = value;
          break;
        case 'WEIGHT':
          convertedDto.weight = value;
          break;
        case 'HEIGHT':
          convertedDto.height = value;
          break;
      }

      // Remove old format fields
      delete convertedDto.type;
      delete convertedDto.value;
      delete convertedDto.unit;
    }

    // Validate that at least one vital sign is provided
    const hasVitalSign = 
      convertedDto.systolic !== undefined ||
      convertedDto.diastolic !== undefined ||
      convertedDto.heartRate !== undefined ||
      convertedDto.temperature !== undefined ||
      convertedDto.spo2 !== undefined ||
      convertedDto.bloodGlucose !== undefined ||
      convertedDto.weight !== undefined ||
      convertedDto.height !== undefined;

    if (!hasVitalSign) {
      throw new BadRequestException('Phải cung cấp ít nhất một chỉ số sinh hiệu');
    }

    const vitalReading = this.vitalReadingRepository.create({
      ...convertedDto,
      source: convertedDto.source || 'Manual',
      timestamp: new Date(),
    });

    const saved = await this.vitalReadingRepository.save(vitalReading);
    
    // Ensure saved is a single entity, not an array
    const savedEntity = Array.isArray(saved) ? saved[0] : saved;
    
    await this.checkVitalThresholds(savedEntity);

    const reloaded = await this.vitalReadingRepository.findOne({
      where: { recordId: savedEntity.recordId },
      relations: ['recorder'],
    });

    return this.toResponse(reloaded ?? savedEntity);
  }

  private async checkVitalThresholds(vital: VitalReading): Promise<void> {
    // Thresholds driven by environment variables with sensible defaults
    const envNum = (key: string, fallback: number) => {
      const raw = process.env[key];
      const n = raw ? Number(raw) : NaN;
      return Number.isFinite(n) ? n : fallback;
    };

    const BP_SYS_HIGH = envNum('VITAL_BP_SYS_HIGH', 180);
    const BP_SYS_LOW = envNum('VITAL_BP_SYS_LOW', 90);
    const BP_DIA_HIGH = envNum('VITAL_BP_DIA_HIGH', 120);
    const BP_DIA_LOW = envNum('VITAL_BP_DIA_LOW', 60);
    const HR_HIGH = envNum('VITAL_HR_HIGH', 100);
    const HR_LOW = envNum('VITAL_HR_LOW', 60);
    const GLU_HIGH = envNum('VITAL_GLU_HIGH', 200);
    const GLU_LOW = envNum('VITAL_GLU_LOW', 70);
    const SPO2_LOW = envNum('VITAL_SPO2_LOW', 90);
    const TEMP_HIGH = envNum('VITAL_TEMP_HIGH', 38);
    const TEMP_LOW = envNum('VITAL_TEMP_LOW', 36);

    const abnormalSigns: string[] = [];
    let maxSeverity: string = 'Low';

    // Check systolic blood pressure
    if (vital.systolic !== null && vital.systolic !== undefined) {
      if (vital.systolic > BP_SYS_HIGH || vital.systolic < BP_SYS_LOW) {
        const severity = vital.systolic > BP_SYS_HIGH ? 'High' : 'Medium';
        if (severity === 'High' || (severity === 'Medium' && maxSeverity === 'Low')) {
          maxSeverity = severity;
        }
        abnormalSigns.push(`Huyết áp tâm thu: ${vital.systolic} mmHg`);
      }
    }

    // Check diastolic blood pressure
    if (vital.diastolic !== null && vital.diastolic !== undefined) {
      if (vital.diastolic > BP_DIA_HIGH || vital.diastolic < BP_DIA_LOW) {
        const severity = vital.diastolic > BP_DIA_HIGH ? 'High' : 'Medium';
        if (severity === 'High' || (severity === 'Medium' && maxSeverity === 'Low')) {
          maxSeverity = severity;
        }
        abnormalSigns.push(`Huyết áp tâm trương: ${vital.diastolic} mmHg`);
      }
    }

    // Check heart rate
    if (vital.heartRate !== null && vital.heartRate !== undefined) {
      if (vital.heartRate > HR_HIGH || vital.heartRate < HR_LOW) {
        if (maxSeverity === 'Low') {
          maxSeverity = 'Medium';
        }
        abnormalSigns.push(`Nhịp tim: ${vital.heartRate} bpm`);
      }
    }

    // Check blood glucose
    if (vital.bloodGlucose !== null && vital.bloodGlucose !== undefined) {
      if (vital.bloodGlucose > GLU_HIGH || vital.bloodGlucose < GLU_LOW) {
        const severity = vital.bloodGlucose < GLU_LOW ? 'High' : 'Medium';
        if (severity === 'High' || (severity === 'Medium' && maxSeverity === 'Low')) {
          maxSeverity = severity;
        }
        abnormalSigns.push(`Đường huyết: ${vital.bloodGlucose} mg/dL`);
      }
    }

    // Check SpO2
    if (vital.spo2 !== null && vital.spo2 !== undefined) {
      if (vital.spo2 < SPO2_LOW) {
        maxSeverity = 'High';
        abnormalSigns.push(`SpO2: ${vital.spo2}%`);
      }
    }

    // Check temperature
    if (vital.temperature !== null && vital.temperature !== undefined) {
      if (vital.temperature > TEMP_HIGH || vital.temperature < TEMP_LOW) {
        if (maxSeverity === 'Low') {
          maxSeverity = 'Medium';
        }
        abnormalSigns.push(`Nhiệt độ: ${vital.temperature}°C`);
      }
    }

    // Create alert if any abnormal signs found
    if (abnormalSigns.length > 0) {
      await this.alertsService.create({
        elderId: vital.elderId,
        type: 'VitalAbnormal',
        severity: maxSeverity,
        notes: `Chỉ số bất thường: ${abnormalSigns.join(', ')}`,
      });
    }
  }

  async findByElder(
    elderId: number,
    from?: Date,
    to?: Date,
    limit?: number,
  ): Promise<VitalReadingResponse[]> {
    const where: any = { elderId };

    if (from && to) {
      where.timestamp = Between(from, to);
    }

    const results = await this.vitalReadingRepository.find({
      where,
      order: { timestamp: 'DESC' },
      relations: ['recorder'],
      take: limit,
    });

    // Convert format mới thành format cũ (mỗi vital sign = 1 object) để tương thích với frontend
    const responses: VitalReadingResponse[] = [];
    
    results.forEach(vital => {
      const baseResponse = this.toResponse(vital);
      
      // Tạo một response cho mỗi vital sign có giá trị
      if (vital.systolic !== null && vital.systolic !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'SYSTOLIC',
          value: vital.systolic,
          unit: 'mmHg',
        });
      }
      
      if (vital.diastolic !== null && vital.diastolic !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'DIASTOLIC',
          value: vital.diastolic,
          unit: 'mmHg',
        });
      }
      
      if (vital.heartRate !== null && vital.heartRate !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'HEART_RATE',
          value: vital.heartRate,
          unit: 'bpm',
        });
      }
      
      if (vital.temperature !== null && vital.temperature !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'TEMPERATURE',
          value: vital.temperature,
          unit: '°C',
        });
      }
      
      if (vital.spo2 !== null && vital.spo2 !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'SPO2',
          value: vital.spo2,
          unit: '%',
        });
      }
      
      if (vital.bloodGlucose !== null && vital.bloodGlucose !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'BLOOD_GLUCOSE',
          value: vital.bloodGlucose,
          unit: 'mg/dL',
        });
      }
      
      if (vital.weight !== null && vital.weight !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'WEIGHT',
          value: vital.weight,
          unit: 'kg',
        });
      }
      
      if (vital.height !== null && vital.height !== undefined) {
        responses.push({
          ...baseResponse,
          type: 'HEIGHT',
          value: vital.height,
          unit: 'cm',
        });
      }
    });

    return responses;
  }

  async getLatestByType(elderId: number, type: string): Promise<VitalReading | null> {
    // This method is kept for backward compatibility
    // For the new structure, we return the latest record with the requested vital sign
    const records = await this.vitalReadingRepository.find({
      where: { elderId },
      order: { timestamp: 'DESC' },
      take: 100, // Get recent records to find one with the requested type
    });

    // Find the first record that has the requested vital sign
    for (const record of records) {
      switch (type.toUpperCase()) {
        case 'BP_SYSTOLIC':
        case 'SYSTOLIC':
          if (record.systolic !== null && record.systolic !== undefined) return record;
          break;
        case 'BP_DIASTOLIC':
        case 'DIASTOLIC':
          if (record.diastolic !== null && record.diastolic !== undefined) return record;
          break;
        case 'HEART_RATE':
        case 'PULSE':
          if (record.heartRate !== null && record.heartRate !== undefined) return record;
          break;
        case 'TEMPERATURE':
          if (record.temperature !== null && record.temperature !== undefined) return record;
          break;
        case 'SPO2':
          if (record.spo2 !== null && record.spo2 !== undefined) return record;
          break;
        case 'GLUCOSE':
        case 'BLOOD_GLUCOSE':
          if (record.bloodGlucose !== null && record.bloodGlucose !== undefined) return record;
          break;
        case 'WEIGHT':
          if (record.weight !== null && record.weight !== undefined) return record;
          break;
        case 'HEIGHT':
          if (record.height !== null && record.height !== undefined) return record;
          break;
      }
    }

    return null;
  }

  private toResponse(vital: VitalReading): VitalReadingResponse {
    return {
      recordId: vital.recordId,
      elderId: vital.elderId,
      source: vital.source,
      recordedBy: vital.recordedBy,
      systolic: vital.systolic,
      diastolic: vital.diastolic,
      heartRate: vital.heartRate,
      temperature: vital.temperature,
      spo2: vital.spo2,
      bloodGlucose: vital.bloodGlucose,
      weight: vital.weight,
      height: vital.height,
      notes: vital.notes,
      timestamp: vital.timestamp,
      recorder: vital.recorder
        ? {
            userId: vital.recorder.userId,
            fullName: vital.recorder.fullName,
            role: vital.recorder.role,
            email: vital.recorder.email,
            phone: vital.recorder.phone,
          }
        : null,
      // Legacy fields for backward compatibility
      vitalId: vital.recordId,
    };
  }

  async importVitals(file: Express.Multer.File): Promise<{
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors: string[];
  }> {
    // Import logic remains the same but needs to be updated to use new format
    // For now, keeping the old import logic but it should be updated later
    throw new BadRequestException('Import chức năng đang được cập nhật');
  }
}
