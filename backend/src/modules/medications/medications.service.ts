import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from '../../entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
  ) {}

  // ✅ Lấy tất cả thuốc (JOIN Elder)
  async findAll(): Promise<Medication[]> {
    return this.medicationRepository.find({
      relations: ['elder'], // join bảng Elder
      order: { startDate: 'DESC' },
    });
  }

  // ✅ Lấy thuốc theo Elder ID
  async findByElder(elderId: number): Promise<Medication[]> {
    const meds = await this.medicationRepository.find({
      where: { elderId },
      relations: ['elder'],
      order: { startDate: 'DESC' },
    });
    if (!meds || meds.length === 0) {
      throw new NotFoundException('Không tìm thấy thuốc cho người này');
    }
    return meds;
  }

  // ✅ Tạo thuốc mới
  async create(dto: CreateMedicationDto): Promise<Medication> {
    const newMed = this.medicationRepository.create(dto);
    return this.medicationRepository.save(newMed);
  }

  // ✅ Cập nhật thuốc
  async update(id: number, dto: UpdateMedicationDto): Promise<Medication> {
    const med = await this.medicationRepository.findOne({ where: { medicationId: id } });
    if (!med) throw new NotFoundException('Không tìm thấy thuốc để cập nhật');
    Object.assign(med, dto);
    return this.medicationRepository.save(med);
  }

  // ✅ Xóa thuốc
  async delete(id: number): Promise<{ message: string }> {
    const med = await this.medicationRepository.findOne({ where: { medicationId: id } });
    if (!med) throw new NotFoundException('Không tìm thấy thuốc để xóa');
    await this.medicationRepository.remove(med);
    return { message: 'Xóa thuốc thành công' };
  }
}
