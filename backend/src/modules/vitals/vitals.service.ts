import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VitalReading } from '../../entities/vital-reading.entity';
import { CreateVitalReadingDto } from './dto/create-vital-reading.dto';
import { AlertsService } from '../alerts/alerts.service';
import { Alert } from '../../entities/alert.entity';

@Injectable()
export class VitalsService {
  constructor(
    @InjectRepository(VitalReading)
    private vitalReadingRepository: Repository<VitalReading>,
    private alertsService: AlertsService,
  ) {}

  async create(createVitalReadingDto: CreateVitalReadingDto): Promise<VitalReading> {
    const vitalReading = this.vitalReadingRepository.create({
      ...createVitalReadingDto,
      timestamp: new Date(),
    });

    const saved = await this.vitalReadingRepository.save(vitalReading);
    await this.checkVitalThresholds(saved);
    return saved;
  }

  private async checkVitalThresholds(vital: VitalReading): Promise<void> {
    let isAbnormal = false;
    let severity: string = 'Low';

    // Define thresholds
    switch (vital.type) {
      case 'BP_SYSTOLIC':
        if (vital.value > 180 || vital.value < 90) {
          isAbnormal = true;
          severity = vital.value > 180 ? 'High' : 'Medium';
        }
        break;
      case 'BP_DIASTOLIC':
        if (vital.value > 120 || vital.value < 60) {
          isAbnormal = true;
          severity = vital.value > 120 ? 'High' : 'Medium';
        }
        break;
      case 'HEART_RATE':
        if (vital.value > 100 || vital.value < 60) {
          isAbnormal = true;
          severity = 'Medium';
        }
        break;
      case 'GLUCOSE':
        if (vital.value > 200 || vital.value < 70) {
          isAbnormal = true;
          severity = vital.value < 70 ? 'High' : 'Medium';
        }
        break;
      case 'SPO2':
        if (vital.value < 90) {
          isAbnormal = true;
          severity = 'High';
        }
        break;
      case 'TEMPERATURE':
        if (vital.value > 38 || vital.value < 36) {
          isAbnormal = true;
          severity = 'Medium';
        }
        break;
    }

    if (isAbnormal) {
      await this.alertsService.create({
        elderId: vital.elderId,
        type: 'VitalAbnormal',
        severity,
        notes: `Abnormal ${vital.type}: ${vital.value} ${vital.unit}`,
      });
    }
  }

  async findByElder(
    elderId: number,
    from?: Date,
    to?: Date,
  ): Promise<VitalReading[]> {
    const where: any = { elderId };

    if (from && to) {
      where.timestamp = Between(from, to);
    }

    return this.vitalReadingRepository.find({
      where,
      order: { timestamp: 'DESC' },
      relations: ['recorder'],
    });
  }

  async getLatestByType(elderId: number, type: string): Promise<VitalReading> {
    return this.vitalReadingRepository.findOne({
      where: { elderId, type },
      order: { timestamp: 'DESC' },
    });
  }
}