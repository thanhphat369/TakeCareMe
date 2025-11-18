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
import { RehabilitationRecordsService } from './rehabilitation-records.service';
import { CreateRehabilitationRecordDto } from './dto/create-rehabilitation-record.dto';
import { UpdateRehabilitationRecordDto } from './dto/update-rehabilitation-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('rehabilitation-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RehabilitationRecordsController {
  constructor(private readonly rehabilitationRecordsService: RehabilitationRecordsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  create(@Body() createDto: CreateRehabilitationRecordDto) {
    return this.rehabilitationRecordsService.create(createDto);
  }

  @Get()
  findAll(@Query('elderId') elderId?: string) {
    if (elderId) {
      return this.rehabilitationRecordsService.findByElder(Number(elderId));
    }
    return this.rehabilitationRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rehabilitationRecordsService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateDto: UpdateRehabilitationRecordDto) {
    return this.rehabilitationRecordsService.update(Number(id), updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  remove(@Param('id') id: string) {
    return this.rehabilitationRecordsService.remove(Number(id));
  }
}








