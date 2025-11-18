import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RehabilitationRecord } from '../../entities/rehabilitation-record.entity';
import { CreateRehabilitationRecordDto } from './dto/create-rehabilitation-record.dto';
import { UpdateRehabilitationRecordDto } from './dto/update-rehabilitation-record.dto';

@Injectable()
export class RehabilitationRecordsService {
  constructor(
    @InjectRepository(RehabilitationRecord)
    private rehabilitationRecordRepository: Repository<RehabilitationRecord>,
  ) {}

  async create(createDto: CreateRehabilitationRecordDto): Promise<RehabilitationRecord> {
    const record = this.rehabilitationRecordRepository.create(createDto);
    return this.rehabilitationRecordRepository.save(record);
  }

  async findAll(): Promise<RehabilitationRecord[]> {
    return this.rehabilitationRecordRepository.find({
      relations: ['elder'],
      order: { startDate: 'DESC' },
    });
  }

  async findByElder(elderId: number): Promise<RehabilitationRecord[]> {
    return this.rehabilitationRecordRepository.find({
      where: { elderId },
      relations: ['elder'],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<RehabilitationRecord> {
    const record = await this.rehabilitationRecordRepository.findOne({
      where: { rehabId: id },
      relations: ['elder'],
    });
    if (!record) {
      throw new NotFoundException(`Rehabilitation record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: number, updateDto: UpdateRehabilitationRecordDto): Promise<RehabilitationRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updateDto);
    return this.rehabilitationRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    await this.rehabilitationRecordRepository.delete(id);
  }
}








