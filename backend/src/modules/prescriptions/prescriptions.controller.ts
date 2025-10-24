import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  async findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get('elder/:elderId')
  async findByElder(@Param('elderId') elderId: number) {
    return this.prescriptionsService.findByElder(elderId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.prescriptionsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.prescriptionsService.delete(id);
  }
}

