import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: 'Pending',
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(filters?: {
    elderId?: number;
    paidBy?: number;
    status?: string;
  }): Promise<Payment[]> {
    const where: any = {};
    
    if (filters?.elderId) where.elderId = filters.elderId;
    if (filters?.paidBy) where.paidBy = filters.paidBy;
    if (filters?.status) where.status = filters.status;

    return this.paymentRepository.find({
      where,
      relations: ['elder', 'elder.user', 'payer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentId },
      relations: ['elder', 'elder.user', 'payer'],
    });

    if (!payment) {
      throw new NotFoundException(`Không tìm thấy thanh toán với ID ${paymentId}`);
    }

    return payment;
  }

  async update(paymentId: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(paymentId);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async markAsPaid(paymentId: number): Promise<Payment> {
    const payment = await this.findOne(paymentId);
    payment.status = 'Paid';
    return this.paymentRepository.save(payment);
  }

  async cancel(paymentId: number): Promise<Payment> {
    const payment = await this.findOne(paymentId);
    payment.status = 'Cancelled';
    return this.paymentRepository.save(payment);
  }

  async getPaymentHistory(elderId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { elderId },
      relations: ['payer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTotalRevenue(from?: Date, to?: Date): Promise<any> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('payment.status = :status', { status: 'Paid' });

    if (from && to) {
      query.andWhere('payment.created_at BETWEEN :from AND :to', { from, to });
    }

    const result = await query.getRawOne();

    return {
      totalRevenue: parseFloat(result?.total ?? '0'),
      totalTransactions: parseInt(result?.count ?? '0'),
    };
  }
}