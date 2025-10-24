import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('elder/:elderId')
  getAllProfiles(@Param('elderId') elderId: string) {
    return this.profilesService.getAllProfilesByElder(Number(elderId));
  }

  // Nutrition
  @Get('nutrition/:elderId')
  getNutrition(@Param('elderId') elderId: string) {
    return this.profilesService.getNutritionByElder(Number(elderId));
  }

  @Post('nutrition/:elderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  createNutrition(@Param('elderId') elderId: string, @Body() data: any) {
    return this.profilesService.createNutrition(Number(elderId), data);
  }

  @Patch('nutrition/:elderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  updateNutrition(@Param('elderId') elderId: string, @Body() data: any) {
    return this.profilesService.updateNutrition(Number(elderId), data);
  }

  // Exercise
  @Get('exercise/:elderId')
  getExercise(@Param('elderId') elderId: string) {
    return this.profilesService.getExerciseByElder(Number(elderId));
  }

  @Post('exercise/:elderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  createExercise(@Param('elderId') elderId: string, @Body() data: any) {
    return this.profilesService.createExercise(Number(elderId), data);
  }

  @Patch('exercise/:elderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  updateExercise(@Param('elderId') elderId: string, @Body() data: any) {
    return this.profilesService.updateExercise(Number(elderId), data);
  }

  // Mobility
  @Get('mobility/:elderId')
  getMobility(@Param('elderId') elderId: string) {
    return this.profilesService.getMobilityByElder(Number(elderId));
  }

  @Post('mobility/:elderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  createMobility(@Param('elderId') elderId: string, @Body() data: any) {
    return this.profilesService.createMobility(Number(elderId), data);
  }

  @Patch('mobility/:elderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  updateMobility(@Param('elderId') elderId: string, @Body() data: any) {
    return this.profilesService.updateMobility(Number(elderId), data);
  }
}