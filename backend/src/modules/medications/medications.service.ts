import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Medication } from '../../entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
  ) {}

  async create(createMedicationDto: CreateMedicationDto): Promise<Medication> {
    const medication = this.medicationRepository.create(createMedicationDto);
    return this.medicationRepository.save(medication);
  }

  async update(medicationId: number, updateMedicationDto: UpdateMedicationDto): Promise<Medication> {
    const med = await this.medicationRepository.findOne({ where: { medicationId } });
    if (!med) {
      throw new NotFoundException('Medication not found');
    }
    Object.assign(med, updateMedicationDto);
    return this.medicationRepository.save(med);
  }

  async findByElder(elderId: number): Promise<Medication[]> {
    return this.medicationRepository.find({ where: { elderId }, order: { startDate: 'DESC' } });
  }
}