// src/modules/medical-history/medical-history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from '../../entities/medical-history.entity';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private historyRepo: Repository<MedicalHistory>,
  ) {}

  async findByElder(elderId: number): Promise<MedicalHistory | null> {
    return this.historyRepo.findOne({ where: { elderId } });
  }

  async create(dto: CreateMedicalHistoryDto): Promise<MedicalHistory> {
    const history = this.historyRepo.create(dto);
    return this.historyRepo.save(history);
  }

  async update(elderId: number, dto: UpdateMedicalHistoryDto): Promise<MedicalHistory> {
    const existing = await this.historyRepo.findOne({ where: { elderId } });
    if (!existing) throw new NotFoundException('Không tìm thấy hồ sơ y tế của người này');

    Object.assign(existing, dto, { lastUpdate: new Date() });
    return this.historyRepo.save(existing);
  }

  async upsert(elderId: number, dto: UpdateMedicalHistoryDto): Promise<MedicalHistory> {
    const existing = await this.findByElder(elderId);
    if (existing) return this.update(elderId, dto);
    return this.create({ ...dto, elderId });
  }
    async updateMedicalHistory(elderId: number, dto: UpdateMedicalHistoryDto, userId?: number) {
    let history = await this.historyRepo.findOne({ where: { elderId } });

    if (!history) {
      // Nếu chưa có hồ sơ → tạo mới
      history = this.historyRepo.create({
        elderId,
        ...dto,
        updatedBy: userId || null,
      });
    } else {
      // Nếu có rồi → cập nhật
      Object.assign(history, {
        ...dto,
        updatedBy: userId || history.updatedBy || null,
        lastUpdate: new Date(),
      });
    }

    return await this.historyRepo.save(history);
  }
}
