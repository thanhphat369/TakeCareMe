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

    // Convert vital readings to type/value/unit format and group by type
    const vitalsByType = vitals.reduce((acc, vital) => {
      // Extract all vital signs from the record
      const vitalEntries: Array<{ type: string; value: number; unit: string; timestamp: Date }> = [];

      if (vital.systolic !== null && vital.systolic !== undefined) {
        vitalEntries.push({ type: 'Systolic', value: vital.systolic, unit: 'mmHg', timestamp: vital.timestamp });
      }
      if (vital.diastolic !== null && vital.diastolic !== undefined) {
        vitalEntries.push({ type: 'Diastolic', value: vital.diastolic, unit: 'mmHg', timestamp: vital.timestamp });
      }
      if (vital.heartRate !== null && vital.heartRate !== undefined) {
        vitalEntries.push({ type: 'Heart Rate', value: vital.heartRate, unit: 'bpm', timestamp: vital.timestamp });
      }
      if (vital.temperature !== null && vital.temperature !== undefined) {
        vitalEntries.push({ type: 'Temperature', value: vital.temperature, unit: '°C', timestamp: vital.timestamp });
      }
      if (vital.spo2 !== null && vital.spo2 !== undefined) {
        vitalEntries.push({ type: 'SpO2', value: vital.spo2, unit: '%', timestamp: vital.timestamp });
      }
      if (vital.bloodGlucose !== null && vital.bloodGlucose !== undefined) {
        vitalEntries.push({ type: 'Blood Glucose', value: vital.bloodGlucose, unit: 'mg/dL', timestamp: vital.timestamp });
      }
      if (vital.weight !== null && vital.weight !== undefined) {
        vitalEntries.push({ type: 'Weight', value: vital.weight, unit: 'kg', timestamp: vital.timestamp });
      }
      if (vital.height !== null && vital.height !== undefined) {
        vitalEntries.push({ type: 'Height', value: vital.height, unit: 'cm', timestamp: vital.timestamp });
      }

      // Group by type
      vitalEntries.forEach(entry => {
        if (!acc[entry.type]) acc[entry.type] = [];
        acc[entry.type].push({
          value: entry.value,
          unit: entry.unit,
          timestamp: entry.timestamp,
        });
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
      // Convert each vital reading to multiple CSV rows (one per vital sign)
      if (vital.systolic !== null && vital.systolic !== undefined) {
        csv += `${vital.timestamp},Systolic,${vital.systolic},mmHg,${vital.source}\n`;
      }
      if (vital.diastolic !== null && vital.diastolic !== undefined) {
        csv += `${vital.timestamp},Diastolic,${vital.diastolic},mmHg,${vital.source}\n`;
      }
      if (vital.heartRate !== null && vital.heartRate !== undefined) {
        csv += `${vital.timestamp},Heart Rate,${vital.heartRate},bpm,${vital.source}\n`;
      }
      if (vital.temperature !== null && vital.temperature !== undefined) {
        csv += `${vital.timestamp},Temperature,${vital.temperature},°C,${vital.source}\n`;
      }
      if (vital.spo2 !== null && vital.spo2 !== undefined) {
        csv += `${vital.timestamp},SpO2,${vital.spo2},%,${vital.source}\n`;
      }
      if (vital.bloodGlucose !== null && vital.bloodGlucose !== undefined) {
        csv += `${vital.timestamp},Blood Glucose,${vital.bloodGlucose},mg/dL,${vital.source}\n`;
      }
      if (vital.weight !== null && vital.weight !== undefined) {
        csv += `${vital.timestamp},Weight,${vital.weight},kg,${vital.source}\n`;
      }
      if (vital.height !== null && vital.height !== undefined) {
        csv += `${vital.timestamp},Height,${vital.height},cm,${vital.source}\n`;
      }
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