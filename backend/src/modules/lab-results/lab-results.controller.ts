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
import { LabResultsService } from './lab-results.service';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('lab-results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  create(@Body() createDto: CreateLabResultDto) {
    return this.labResultsService.create(createDto);
  }

  @Get()
  findAll(@Query('elderId') elderId?: string) {
    if (elderId) {
      return this.labResultsService.findByElder(Number(elderId));
    }
    return this.labResultsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labResultsService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateDto: UpdateLabResultDto) {
    return this.labResultsService.update(Number(id), updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  remove(@Param('id') id: string) {
    return this.labResultsService.remove(Number(id));
  }
}








