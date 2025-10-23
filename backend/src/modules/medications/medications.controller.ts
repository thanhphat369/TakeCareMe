import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  // ✅ Lấy tất cả thuốc
  @Get()
  async findAll() {
    return this.medicationsService.findAll();
  }

  // ✅ Lấy thuốc theo Elder ID
  @Get('elder/:elderId')
  async findByElder(@Param('elderId') elderId: number) {
    return this.medicationsService.findByElder(elderId);
  }

  // ✅ Thêm thuốc
  @Post()
  async create(@Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(dto);
  }

  // ✅ Cập nhật thuốc
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateMedicationDto) {
    return this.medicationsService.update(id, dto);
  }

  // ✅ Xóa thuốc
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.medicationsService.delete(id);
  }
}
