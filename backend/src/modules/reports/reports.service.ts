import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Elder } from '../../entities/elder.entity';
import { VitalReading } from '../../entities/vital-reading.entity';
import { CareEvent } from '../../entities/care-event.entity';
import { Alert } from '../../entities/alert.entity';
import { Medication } from '../../entities/medication.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Elder)
    private elderRepository: Repository<Elder>,
    @InjectRepository(VitalReading)
    private vitalReadingRepository: Repository<VitalReading>,
    @InjectRepository(CareEvent)
    private careEventRepository: Repository<CareEvent>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
  ) {}

  async generateElderReport(
    elderId: number,
    from: Date,
    to: Date,
  ): Promise<any> {
    const elder = await this.elderRepository.findOne({
      where: { elderId },
      relations: ['user', 'medicalHistory', 'contactPerson'],
    });

    if (!elder) {
      throw new Error('Không tìm thấy người cao tuổi');
    }

    // Get vitals
    const vitals = await this.vitalReadingRepository.find({
      where: {
        elderId,
        timestamp: Between(from, to),
      },
      order: { timestamp: 'ASC' },
    });

    // Group vitals by type
    const vitalsByType = vitals.reduce((acc, vital) => {
      if (!acc[vital.type]) acc[vital.type] = [];
      acc[vital.type].push({
        value: vital.value,
        unit: vital.unit,
        timestamp: vital.timestamp,
      });
      return acc;
    }, {});

    // Get care events
    const careEvents = await this.careEventRepository.find({
      where: {
        elderId,
        timestamp: Between(from, to),
      },
      relations: ['performer'],
      order: { timestamp: 'DESC' },
    });

    // Get alerts
    const alerts = await this.alertRepository.find({
      where: {
        elderId,
        triggeredAt: Between(from, to),
      },
      order: { triggeredAt: 'DESC' },
    });

    // Get medications
    const medications = await this.medicationRepository.find({
      where: { elderId },
      relations: ['prescriber'],
    });

    return {
      elder: {
        elderId: elder.elderId,
        fullName: elder.fullName,
        dob: elder.dob,
        gender: elder.gender,
        address: elder.address,
      },
      contactPerson: elder.contactPerson ? {
        fullName: elder.contactPerson.fullName,
        phone: elder.contactPerson.phone,
        email: elder.contactPerson.email,
      } : null,
      medicalHistory: elder.medicalHistory,
      period: { from, to },
      vitals: {
        total: vitals.length,
        byType: vitalsByType,
      },
      careEvents: {
        total: careEvents.length,
        events: careEvents.map(e => ({
          type: e.type,
          notes: e.notes,
          timestamp: e.timestamp,
          performedBy: e.performer?.fullName,
        })),
      },
      alerts: {
        total: alerts.length,
        open: alerts.filter(a => a.status === 'Open').length,
        resolved: alerts.filter(a => a.status === 'Resolved').length,
        details: alerts,
      },
      medications: medications.map(m => ({
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        prescribedBy: m.prescriber?.fullName,
      })),
      generatedAt: new Date(),
    };
  }

  async exportVitalsToCSV(elderId: number, from: Date, to: Date): Promise<string> {
    const vitals = await this.vitalReadingRepository.find({
      where: {
        elderId,
        timestamp: Between(from, to),
      },
      order: { timestamp: 'ASC' },
    });

    let csv = 'Timestamp,Type,Value,Unit,Source\n';
    vitals.forEach(vital => {
      csv += `${vital.timestamp},${vital.type},${vital.value},${vital.unit},${vital.source}\n`;
    });

    return csv;
  }

  async getWeeklyReport(elderId: number): Promise<any> {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const alerts = await this.alertRepository.find({
      where: {
        elderId,
        triggeredAt: Between(weekAgo, today),
      },
      order: { triggeredAt: 'DESC' },
    });

    const vitals = await this.vitalReadingRepository.find({
      where: {
        elderId,
        timestamp: Between(weekAgo, today),
      },
      order: { timestamp: 'DESC' },
    });

    return { alerts, vitals, from: weekAgo, to: today };
  }
}