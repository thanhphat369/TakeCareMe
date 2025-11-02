import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('medications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  create(@Body() createMedicationDto: CreateMedicationDto) {
  return this.medicationsService.create(createMedicationDto);
}

  @Get()
  findAll(@Query('elderId') elderId?: string) {
    if (elderId) {
      return this.medicationsService.findByElder(Number(elderId));
    }
    return this.medicationsService.findAll();
  }

  @Get('statistics')
  getStatistics(@Query('elderId') elderId?: string) {
    return this.medicationsService.getStatistics(
      elderId ? Number(elderId) : undefined
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateDto: UpdateMedicationDto) {
    return this.medicationsService.update(Number(id), updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DOCTOR)
  remove(@Param('id') id: string) {
    return this.medicationsService.remove(Number(id));
  }
}