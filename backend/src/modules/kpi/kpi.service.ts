import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CareEvent } from '../../entities/care-event.entity';
import { Alert } from '../../entities/alert.entity';
import { Staff } from '../../entities/staff.entity';

export interface StaffKPI {
  staffId: number;
  staffName: string;
  role: string;
  totalCareVisits: number;
  careVisitsThisMonth: number;
  careVisitsThisWeek: number;
  averageResponseTimeMinutes: number;
  totalAlertsAssigned: number;
  alertsAcknowledged: number;
  alertsResolved: number;
  averageResponseTime: number; // in minutes
  fastestResponseTime: number; // in minutes
  slowestResponseTime: number; // in minutes
}

export interface KPIFilters {
  staffId?: number;
  from?: Date;
  to?: Date;
  department?: string;
}

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(CareEvent)
    private careEventRepository: Repository<CareEvent>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  /**
   * Lấy KPI cho một nhân viên cụ thể
   */
  async getStaffKPI(staffId: number, filters?: KPIFilters): Promise<StaffKPI> {
    const staff = await this.staffRepository.findOne({
      where: { staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new Error(`Không tìm thấy nhân viên với ID ${staffId}`);
    }

    const fromDate = filters?.from || this.getStartOfMonth();
    const toDate = filters?.to || new Date();

    const userId = staff.userId;

    // Đếm số lượt chăm sóc
    const careVisitsQuery = this.careEventRepository
      .createQueryBuilder('careEvent')
      .where('careEvent.performedBy = :userId', { userId });

    if (filters?.from || filters?.to) {
      careVisitsQuery.andWhere('careEvent.timestamp BETWEEN :from AND :to', {
        from: fromDate,
        to: toDate,
      });
    }

    const totalCareVisits = await careVisitsQuery.getCount();

    // Đếm lượt chăm sóc tháng này
    const thisMonthStart = this.getStartOfMonth();
    const careVisitsThisMonth = await this.careEventRepository.count({
      where: {
        performedBy: userId,
        timestamp: Between(thisMonthStart, new Date()),
      },
    });

    // Đếm lượt chăm sóc tuần này
    const thisWeekStart = this.getStartOfWeek();
    const careVisitsThisWeek = await this.careEventRepository.count({
      where: {
        performedBy: userId,
        timestamp: Between(thisWeekStart, new Date()),
      },
    });

    // Tính thời gian phản hồi cảnh báo
    const alertsQuery = this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.assignedTo = :userId', { userId })
      .andWhere('alert.acknowledgedAt IS NOT NULL');

    if (filters?.from || filters?.to) {
      alertsQuery.andWhere('alert.triggeredAt BETWEEN :from AND :to', {
        from: fromDate,
        to: toDate,
      });
    }

    const alerts = await alertsQuery
      .select([
        'alert.alertId',
        'alert.triggeredAt',
        'alert.acknowledgedAt',
        'alert.status',
      ])
      .getMany();

    const totalAlertsAssigned = await this.alertRepository.count({
      where: {
        assignedTo: userId,
        ...(filters?.from || filters?.to
          ? {
              triggeredAt: Between(fromDate, toDate),
            }
          : {}),
      },
    });

    const alertsAcknowledged = alerts.filter(
      (a) => a.status === 'Acknowledged' || a.status === 'Resolved',
    ).length;

    const alertsResolved = alerts.filter((a) => a.status === 'Resolved').length;

    // Tính thời gian phản hồi (phút)
    const responseTimes = alerts
      .filter((a) => a.acknowledgedAt)
      .map((a) => {
        const triggered = new Date(a.triggeredAt).getTime();
        const acknowledged = new Date(a.acknowledgedAt).getTime();
        return (acknowledged - triggered) / (1000 * 60); // Convert to minutes
      });

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const fastestResponseTime =
      responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponseTime =
      responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    return {
      staffId: staff.staffId,
      staffName: staff.user?.fullName || 'N/A',
      role: staff.user?.role || 'N/A',
      totalCareVisits,
      careVisitsThisMonth,
      careVisitsThisWeek,
      averageResponseTimeMinutes: averageResponseTime,
      totalAlertsAssigned,
      alertsAcknowledged,
      alertsResolved,
      averageResponseTime,
      fastestResponseTime,
      slowestResponseTime,
    };
  }

  /**
   * Lấy KPI cho tất cả nhân viên
   */
  async getAllStaffKPIs(filters?: KPIFilters): Promise<StaffKPI[]> {
    const where: any = {};
    if (filters?.department) {
      where.department = filters.department;
    }

    const staffs = await this.staffRepository.find({
      where,
      relations: ['user'],
    });

    const kpis = await Promise.all(
      staffs.map((staff) => this.getStaffKPI(staff.staffId, filters)),
    );

    return kpis;
  }

  /**
   * Lấy thống kê tổng quan KPI
   */
  async getKPISummary(filters?: KPIFilters) {
    const kpis = await this.getAllStaffKPIs(filters);

    const totalCareVisits = kpis.reduce(
      (sum, kpi) => sum + kpi.totalCareVisits,
      0,
    );
    const totalAlerts = kpis.reduce(
      (sum, kpi) => sum + kpi.totalAlertsAssigned,
      0,
    );
    const averageResponseTime =
      kpis.length > 0
        ? kpis.reduce((sum, kpi) => sum + kpi.averageResponseTime, 0) /
          kpis.length
        : 0;

    const topPerformers = [...kpis]
      .sort((a, b) => b.totalCareVisits - a.totalCareVisits)
      .slice(0, 5);

    const fastestResponders = [...kpis]
      .filter((kpi) => kpi.averageResponseTime > 0)
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime)
      .slice(0, 5);

    return {
      totalStaff: kpis.length,
      totalCareVisits,
      totalAlerts,
      averageResponseTime,
      topPerformers,
      fastestResponders,
    };
  }

  /**
   * Lấy lịch sử chăm sóc của nhân viên
   */
  async getCareHistory(staffId: number, limit: number = 20) {
    const staff = await this.staffRepository.findOne({
      where: { staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new Error(`Không tìm thấy nhân viên với ID ${staffId}`);
    }

    return this.careEventRepository.find({
      where: { performedBy: staff.userId },
      relations: ['elder', 'elder.user'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lấy lịch sử cảnh báo của nhân viên
   */
  async getAlertHistory(staffId: number, limit: number = 20) {
    const staff = await this.staffRepository.findOne({
      where: { staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new Error(`Không tìm thấy nhân viên với ID ${staffId}`);
    }

    return this.alertRepository.find({
      where: { assignedTo: staff.userId },
      relations: ['elder', 'elder.user'],
      order: { triggeredAt: 'DESC' },
      take: limit,
    });
  }

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(now.setDate(diff));
  }
}

