import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CareEvent } from '../../entities/care-event.entity';
import { CreateCareEventDto } from './dto/create-care-event.dto';
import { UpdateCareEventDto } from './dto/update-care-event.dto';

@Injectable()
export class CareEventsService {
	constructor(
		@InjectRepository(CareEvent)
		private readonly repo: Repository<CareEvent>,
	) {}

	async create(dto: CreateCareEventDto): Promise<CareEvent> {
		const entity = this.repo.create({
			elderId: dto.elderId,
			scheduleId: dto.scheduleId ?? null,
			type: dto.type,
			notes: dto.notes ?? null,
			timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
			performedBy: dto.performedBy ?? null,
		});
		return this.repo.save(entity);
	}

	async findAll(filters?: { elderId?: number; scheduleId?: number }): Promise<CareEvent[]> {
		const where: FindOptionsWhere<CareEvent> = {};
		if (filters?.elderId) where.elderId = filters.elderId;
		if (filters?.scheduleId) where.scheduleId = filters.scheduleId;
		return this.repo.find({
			where,
			order: { timestamp: 'DESC' },
		});
	}

	async findOne(id: number): Promise<CareEvent> {
		const entity = await this.repo.findOne({ where: { eventId: id } });
		if (!entity) {
			throw new NotFoundException(`CareEvent ${id} not found`);
		}
		return entity;
	}

	async update(id: number, dto: UpdateCareEventDto): Promise<CareEvent> {
		const entity = await this.findOne(id);
		Object.assign(entity, {
			...dto,
			timestamp: dto.timestamp !== undefined ? (dto.timestamp ? new Date(dto.timestamp) : null) : entity.timestamp,
		});
		return this.repo.save(entity);
	}

	async remove(id: number): Promise<void> {
		await this.repo.delete(id);
	}
}










