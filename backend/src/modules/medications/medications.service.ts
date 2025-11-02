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

  async findAll(): Promise<Medication[]> {
    return this.medicationRepository.find({
      relations: ['elder', 'prescriber'],
      order: { startDate: 'DESC' },
    });
  }

  async findByElder(elderId: number): Promise<Medication[]> {
    return this.medicationRepository.find({
      where: { elderId },
      relations: ['prescriber'],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Medication> {
    const medication = await this.medicationRepository.findOne({
      where: { medicationId: id },
      relations: ['elder', 'prescriber'],
    });

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }

    return medication;
  }

  async create(dto: CreateMedicationDto): Promise<Medication> {
  const medication = this.medicationRepository.create({
    elderId: dto.elderId,
    name: dto.name,
    dose: dto.dose || null,
    frequency: dto.frequency || null,
    time: dto.time || null,
    startDate: dto.startDate ? new Date(dto.startDate) : null,
    endDate: dto.endDate ? new Date(dto.endDate) : null,
    notes: dto.notes || null,
    diagnosis: dto.diagnosis || null,         
    prescribedBy: dto.prescribedBy || null,   
  });

  return await this.medicationRepository.save(medication);
}
  async update(id: number, dto: UpdateMedicationDto): Promise<Medication> {
    const medication = await this.findOne(id);

    Object.assign(medication, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : medication.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : medication.endDate,
    });

    return this.medicationRepository.save(medication);
  }

  async remove(id: number): Promise<void> {
    const medication = await this.findOne(id);
    await this.medicationRepository.remove(medication);
  }

  async getStatistics(elderId?: number) {
    const where = elderId ? { elderId } : {};
    const medications = await this.medicationRepository.find({ where });

    const today = new Date();
    const active = medications.filter(m => 
      !m.endDate || new Date(m.endDate) >= today
    ).length;
    
    const expired = medications.filter(m => 
      m.endDate && new Date(m.endDate) < today
    ).length;

    return {
      total: medications.length,
      active,
      expired,
    };
  }
}