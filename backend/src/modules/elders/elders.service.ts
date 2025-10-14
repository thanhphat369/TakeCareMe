import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Elder } from '../../entities/elder.entity';
import { MedicalHistory } from '../../entities/medical-history.entity';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';

@Injectable()
export class EldersService {
  constructor(
    @InjectRepository(Elder)
    private elderRepository: Repository<Elder>,
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
  ) {}

  async create(createElderDto: CreateElderDto): Promise<Elder> {
    const elder = this.elderRepository.create(createElderDto);
    const savedElder = await this.elderRepository.save(elder);

    // Create medical history
    const medicalHistory = this.medicalHistoryRepository.create({
      elderId: savedElder.elderId,
      diagnoses: '[]',
      allergies: '[]',
      chronicMedications: '[]',
    });
    await this.medicalHistoryRepository.save(medicalHistory);

    return savedElder;
  }

  async findAll(): Promise<Elder[]> {
    return this.elderRepository.find({
      relations: ['contactPerson', 'medicalHistory'],
    });
  }

  async findOne(id: string | number): Promise<Elder> {
    const elder = await this.elderRepository.findOne({
      where: { elderId: Number(id) },
      relations: ['contactPerson', 'medicalHistory', 'vitalReadings', 'medications'],
    });

    if (!elder) {
      throw new NotFoundException(`Elder with ID ${id} not found`);
    }

    return elder;
  }

  async update(id: string | number, updateElderDto: UpdateElderDto): Promise<Elder> {
    const elder = await this.findOne(id);
    Object.assign(elder, updateElderDto);
    return this.elderRepository.save(elder);
  }

  async remove(id: string | number): Promise<void> {
    await this.elderRepository.delete({ elderId: Number(id) });
  }

  async updateMedicalHistory(
    elderId: string | number,
    medicalHistoryData: Partial<MedicalHistory>,
  ): Promise<MedicalHistory> {
    const elder = await this.findOne(Number(elderId));
    
    let medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { elderId: elder.elderId },
    });

    if (!medicalHistory) {
      medicalHistory = this.medicalHistoryRepository.create({
        elderId: elder.elderId,
        ...medicalHistoryData,
      });
    } else {
      Object.assign(medicalHistory, medicalHistoryData);
    }

    return this.medicalHistoryRepository.save(medicalHistory);
  }
}