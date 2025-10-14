import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Shift } from '../../entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftRepository.create(createShiftDto);
    return this.shiftRepository.save(shift);
  }

  async findAll(filters?: {
    staffId?: number;
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<Shift[]> {
    const where: any = {};

    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.status) where.status = filters.status;

    if (filters?.from && filters?.to) {
      where.startTime = Between(filters.from, filters.to);
    }

    return this.shiftRepository.find({
      where,
      relations: ['staff', 'elders', 'elders.user'],
      order: { startTime: 'ASC' },
    });
  }

  async findOne(shiftId: number): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { shiftId },
      relations: ['staff', 'elders', 'elders.user'],
    });

    if (!shift) {
      throw new NotFoundException(`Không tìm thấy ca trực với ID ${shiftId}`);
    }

    return shift;
  }

  async update(shiftId: number, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findOne(shiftId);
    Object.assign(shift, updateShiftDto);
    return this.shiftRepository.save(shift);
  }

  async remove(shiftId: number): Promise<void> {
    const shift = await this.findOne(shiftId);
    shift.status = 'Cancelled';
    await this.shiftRepository.save(shift);
  }

  async assignElders(shiftId: number, elderIds: number[]): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { shiftId },
      relations: ['elders'],
    });

    if (!shift) {
      throw new NotFoundException(`Không tìm thấy ca trực với ID ${shiftId}`);
    }

    // Update elders for this shift
    shift.elders = elderIds.map(id => ({ elderId: id } as any));
    return this.shiftRepository.save(shift);
  }

  async getMyShiftsToday(staffId: number): Promise<Shift[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.shiftRepository.find({
      where: {
        staffId,
        startTime: Between(today, tomorrow),
      },
      relations: ['elders', 'elders.user'],
      order: { startTime: 'ASC' },
    });
  }

  async startShift(shiftId: number): Promise<Shift> {
    const shift = await this.findOne(shiftId);
    shift.status = 'InProgress';
    return this.shiftRepository.save(shift);
  }

  async completeShift(shiftId: number): Promise<Shift> {
    const shift = await this.findOne(shiftId);
    shift.status = 'Completed';
    return this.shiftRepository.save(shift);
  }
}