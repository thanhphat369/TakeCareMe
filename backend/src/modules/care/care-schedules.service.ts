import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CareSchedule } from '../../entities/care-schedule.entity';
import { CreateCareScheduleDto } from './dto/create-care-schedule.dto';
import { UpdateCareScheduleDto } from './dto/update-care-schedule.dto';

@Injectable()
export class CareSchedulesService {
	constructor(
		@InjectRepository(CareSchedule)
		private readonly repo: Repository<CareSchedule>,
	) {}

	async create(dto: CreateCareScheduleDto): Promise<CareSchedule> {
		const entity = this.repo.create({
			elderId: dto.elderId,
			type: dto.type,
			recurrence: dto.recurrence,
			startTime: dto.startTime ? new Date(dto.startTime) : null,
			endTime: dto.endTime ? new Date(dto.endTime) : null,
			assignedTo: dto.assignedTo ?? null,
			status: dto.status ?? 'Active',
		});
		return this.repo.save(entity);
	}

	async findAll(filters?: { elderId?: number; status?: string }): Promise<CareSchedule[]> {
		const where: FindOptionsWhere<CareSchedule> = {};
		if (filters?.elderId) where.elderId = filters.elderId;
		if (filters?.status) where.status = filters.status;
		return this.repo.find({
			where,
			relations: ['elder', 'assignee'],
			order: { startTime: 'DESC' },
		});
	}

	async findOne(id: number): Promise<CareSchedule> {
		const entity = await this.repo.findOne({ where: { scheduleId: id } });
		if (!entity) {
			throw new NotFoundException(`CareSchedule ${id} not found`);
		}
		return entity;
	}

	async update(id: number, dto: UpdateCareScheduleDto): Promise<CareSchedule> {
		const entity = await this.findOne(id);
		Object.assign(entity, {
			...dto,
			startTime: dto.startTime !== undefined ? (dto.startTime ? new Date(dto.startTime) : null) : entity.startTime,
			endTime: dto.endTime !== undefined ? (dto.endTime ? new Date(dto.endTime) : null) : entity.endTime,
		});
		return this.repo.save(entity);
	}

	async remove(id: number): Promise<void> {
		await this.repo.delete(id);
	}
}


