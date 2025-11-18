import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../../entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { FamilyElder } from '../../entities/family-elder.entity';
import { User, UserRole } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(FamilyElder)
    private familyElderRepository: Repository<FamilyElder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      triggeredAt: new Date(),
      status: 'Open',
    });

    const saved = await this.alertRepository.save(alert);

    // Notify Staff (nurses/doctors) and Family of the elder
    await this.dispatchNotifications(saved);

    return saved;
  }

  private async dispatchNotifications(alert: Alert): Promise<void> {
    // Staff targets
    const staff = await this.userRepository.find({
      where: [{ role: UserRole.STAFF }, { role: UserRole.DOCTOR }],
      select: ['userId', 'fullName', 'phone', 'email'],
    });

    // Family targets of the elder
    const familyLinks = await this.familyElderRepository.find({
      where: { elderId: alert.elderId },
      relations: ['family'],
    });
    const familyUsers = familyLinks.map(l => l.family).filter(Boolean) as User[];

    const recipients = [...staff, ...familyUsers].map(u => ({
      phone: u.phone || undefined,
      pushToken: undefined, // Integrate if available in Users table
      zaloId: undefined,    // Integrate if available in Users table
      email: u.email || undefined,
    }));

    const payload = {
      title: `Cảnh báo ${alert.type}`,
      message: alert.notes || 'Hệ thống phát hiện chỉ số bất thường. Vui lòng kiểm tra ngay.',
      severity: (alert.severity as any) || 'Low',
      elderId: alert.elderId,
      timestamp: alert.triggeredAt,
      metadata: {
        alertId: alert.alertId,
        assignedTo: alert.assignedTo,
        status: alert.status,
      },
    };

    await this.notificationsService.sendAllChannels(recipients, payload);
  }

  async findAll(filters?: {
    elderId?: number;
    status?: string;
    severity?: string;
    assignedTo?: number;
  }): Promise<Alert[]> {
    const where: any = {};
    
    if (filters?.elderId) where.elderId = filters.elderId;
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

    return this.alertRepository.find({
      where,
      relations: ['elder', 'elder.user', 'assignee'],
      order: { triggeredAt: 'DESC' },
    });
  }

  async findOne(alertId: number): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { alertId },
      relations: ['elder', 'elder.user', 'elder.contactPerson', 'assignee'],
    });

    if (!alert) {
      throw new NotFoundException(`Không tìm thấy cảnh báo với ID ${alertId}`);
    }

    return alert;
  }

  async acknowledge(alertId: number, userId: number): Promise<Alert> {
    const alert = await this.findOne(alertId);
    
    alert.status = 'Acknowledged';
    alert.acknowledgedAt = new Date();
    alert.assignedTo = userId;

    return this.alertRepository.save(alert);
  }

  async resolve(alertId: number, notes?: string): Promise<Alert> {
    const alert = await this.findOne(alertId);
    
    alert.status = 'Resolved';
    alert.resolvedAt = new Date();
    
    if (notes) {
      alert.notes = notes;
    }

    if (!alert.acknowledgedAt) {
      alert.acknowledgedAt = new Date();
    }

    return this.alertRepository.save(alert);
  }

  async assignAlert(alertId: number, staffId: number): Promise<Alert> {
    const alert = await this.findOne(alertId);
    alert.assignedTo = staffId;
    return this.alertRepository.save(alert);
  }

  async getStatistics(elderId?: number): Promise<any> {
    const where: any = {};
    if (elderId) where.elderId = elderId;

    const [total, open, acknowledged, resolved] = await Promise.all([
      this.alertRepository.count({ where }),
      this.alertRepository.count({ where: { ...where, status: 'Open' } }),
      this.alertRepository.count({ where: { ...where, status: 'Acknowledged' } }),
      this.alertRepository.count({ where: { ...where, status: 'Resolved' } }),
    ]);

    // Count by severity
    const critical = await this.alertRepository.count({ 
      where: { ...where, severity: 'Critical', status: 'Open' } 
    });
    const high = await this.alertRepository.count({ 
      where: { ...where, severity: 'High', status: 'Open' } 
    });

    return {
      total,
      open,
      acknowledged,
      resolved,
      criticalOpen: critical,
      highOpen: high,
    };
  }

  async getRecentAlerts(elderId?: number, limit: number = 10): Promise<Alert[]> {
    const where: any = {};
    if (elderId) where.elderId = elderId;

    return this.alertRepository.find({
      where,
      relations: ['elder', 'elder.user', 'assignee'],
      order: { triggeredAt: 'DESC' },
      take: limit,
    });
  }
}
