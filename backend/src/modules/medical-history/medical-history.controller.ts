// src/modules/medical-history/medical-history.controller.ts
import { Controller, Get, Param, Body, Post, Put } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly service: MedicalHistoryService) {}

  @Get(':elderId')
  async getByElder(@Param('elderId') elderId: number) {
    return this.service.findByElder(Number(elderId));
  }

  @Post()
  async create(@Body() dto: CreateMedicalHistoryDto) {
    return this.service.create(dto);
  }

  @Put(':elderId')
  async update(@Param('elderId') elderId: number, @Body() dto: UpdateMedicalHistoryDto) {
    return this.service.upsert(Number(elderId), dto);
  }

 @Put(':elderId')
  async updateMedicalHistory(
    @Param('elderId') elderId: number,
    @Body() dto: UpdateMedicalHistoryDto,
  ) {
    // 👇 Không dùng AuthGuard, nên không có userId (có thể là null)
    return await this.service.updateMedicalHistory(
      Number(elderId),
      dto,
      null, // updatedBy = null
    );
  }
}
