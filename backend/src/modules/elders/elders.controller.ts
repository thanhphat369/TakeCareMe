import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { EldersService } from './elders.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('elders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EldersController {
  constructor(private readonly eldersService: EldersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() createElderDto: CreateElderDto) {
    return this.eldersService.create(createElderDto);
  }

  @Get()
  findAll() {
    return this.eldersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eldersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() updateElderDto: UpdateElderDto) {
    return this.eldersService.update(id, updateElderDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.eldersService.remove(id);
  }

  @Patch(':id/medical-history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  updateMedicalHistory(
    @Param('id') id: string,
    @Body() medicalHistoryData: any,
  ) {
    return this.eldersService.updateMedicalHistory(id, medicalHistoryData);
  }
}