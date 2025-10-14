import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../../entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      triggeredAt: new Date(),
      status: 'Open',
    });

    const saved = await this.alertRepository.save(alert);

    // TODO: Gửi push notification tới Staff & Family
    // this.notificationService.sendAlert(saved);

    return saved;
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
