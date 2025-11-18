import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabResult } from '../../entities/lab-result.entity';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';

@Injectable()
export class LabResultsService {
  constructor(
    @InjectRepository(LabResult)
    private labResultRepository: Repository<LabResult>,
  ) {}

  async create(createDto: CreateLabResultDto): Promise<LabResult> {
    const labResult = this.labResultRepository.create(createDto);
    return this.labResultRepository.save(labResult);
  }

  async findAll(): Promise<LabResult[]> {
    return this.labResultRepository.find({
      relations: ['elder'],
      order: { testDate: 'DESC' },
    });
  }

  async findByElder(elderId: number): Promise<LabResult[]> {
    return this.labResultRepository.find({
      where: { elderId },
      relations: ['elder'],
      order: { testDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LabResult> {
    const labResult = await this.labResultRepository.findOne({
      where: { resultId: id },
      relations: ['elder'],
    });
    if (!labResult) {
      throw new NotFoundException(`Lab result with ID ${id} not found`);
    }
    return labResult;
  }

  async update(id: number, updateDto: UpdateLabResultDto): Promise<LabResult> {
    const labResult = await this.findOne(id);
    Object.assign(labResult, updateDto);
    return this.labResultRepository.save(labResult);
  }

  async remove(id: number): Promise<void> {
    await this.labResultRepository.delete(id);
  }
}








