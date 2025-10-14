import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Elder } from '../../entities/elder.entity';
import { Alert } from '../../entities/alert.entity';
import { VitalReading } from '../../entities/vital-reading.entity';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Elder)
    private elderRepository: Repository<Elder>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(VitalReading)
    private vitalReadingRepository: Repository<VitalReading>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSummary(): Promise<any> {
    const totalElders = await this.elderRepository.count();

    const totalStaff = await this.userRepository.count({
      where: [
        { role: UserRole.STAFF },
        { role: UserRole.DOCTOR },
      ],
    });

    const openAlerts = await this.alertRepository.count({
      where: { status: 'Open' },
    });

    const criticalAlerts = await this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.status = :status', { status: 'Open' })
      .andWhere('alert.severity IN (:...severities)', { 
        severities: ['high', 'critical'] 
      })
      .getCount();

    // Recent vitals in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentVitals = await this.vitalReadingRepository
      .createQueryBuilder('vital')
      .where('vital.timestamp >= :date', { date: oneDayAgo })
      .getCount();

    return {
      totalElders,
      totalStaff,
      openAlerts,
      criticalAlerts,
      recentVitals,
      lastUpdated: new Date(),
    };
  }

  async getAlertTrends(days = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const alerts = await this.alertRepository
      .createQueryBuilder('alert')
      .select('DATE(alert.triggeredAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('alert.severity', 'severity')
      .where('alert.triggeredAt >= :startDate', { startDate })
      .groupBy('DATE(alert.triggeredAt)')
      .addGroupBy('alert.severity')
      .orderBy('DATE(alert.triggeredAt)', 'ASC')
      .getRawMany();

    return alerts;
  }

  async getElderStatistics(): Promise<any> {
    const elderStats = await this.elderRepository
      .createQueryBuilder('elder')
      .select('elder.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('1=1')
      .groupBy('elder.gender')
      .getRawMany();

    // Age distribution
    const elders = await this.elderRepository.find({
      select: ['dob'],
    });

    const ageGroups = {
      '60-70': 0,
      '71-80': 0,
      '81-90': 0,
      '90+': 0,
    };

    elders.forEach(elder => {
      const age = new Date().getFullYear() - new Date(elder.dob).getFullYear();
      if (age <= 70) ageGroups['60-70']++;
      else if (age <= 80) ageGroups['71-80']++;
      else if (age <= 90) ageGroups['81-90']++;
      else ageGroups['90+']++;
    });

    return {
      genderDistribution: elderStats,
      ageDistribution: ageGroups,
    };
  }

  async getStaffPerformance(): Promise<any> {
    const nurses = await this.userRepository.find({
      where: { role: UserRole.STAFF },
      select: ['userId', 'fullName'],
    });

    const performance = await Promise.all(
      nurses.map(async (nurse) => {
        const alertsHandled = await this.alertRepository.count({
          where: { assignedTo: nurse.userId },
        });

        const avgResponseTime = await this.alertRepository
          .createQueryBuilder('alert')
          .select('AVG(DATEDIFF(minute, alert.triggered_at, alert.acknowledged_at))', 'avgMinutes')
          .where('alert.assigned_to = :nurseId', { nurseId: nurse.userId })
          .andWhere('alert.acknowledgedAt IS NOT NULL')
          .getRawOne();

        return {
          staffId: nurse.userId,
          staffName: nurse.fullName,
          alertsHandled,
          avgResponseTime: avgResponseTime?.avgMinutes || 0,
        };
      }),
    );

    return performance;
  }
}