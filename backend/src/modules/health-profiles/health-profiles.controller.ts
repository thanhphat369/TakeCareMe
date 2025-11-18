import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HealthProfilesService } from './health-profiles.service';
import {
  CreateNutritionProfileDto,
  UpdateNutritionProfileDto,
  CreateExerciseProfileDto,
  UpdateExerciseProfileDto,
  CreateMobilityProfileDto,
  UpdateMobilityProfileDto,
} from './dto/health-profiles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('elders/:elderId/health-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HealthProfilesController {
  constructor(private readonly healthProfilesService: HealthProfilesService) {}

  // ==================== GET ALL PROFILES ====================

  /**
   * GET /elders/:elderId/health-profiles
   * Lấy tất cả hồ sơ sức khỏe (nutrition, exercise, mobility)
   */
  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.FAMILY,
  )
  async getAllProfiles(@Param('elderId') elderId: string) {
    return this.healthProfilesService.getAllProfiles(Number(elderId));
  }

  // ==================== NUTRITION PROFILE ====================

  /**
   * GET /elders/:elderId/health-profiles/nutrition
   * Lấy hồ sơ dinh dưỡng
   */
  @Get('nutrition')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.FAMILY,
  )
  async getNutritionProfile(@Param('elderId') elderId: string) {
    return this.healthProfilesService.getNutritionProfile(Number(elderId));
  }

  /**
   * POST /elders/:elderId/health-profiles/nutrition
   * Tạo hồ sơ dinh dưỡng
   */
  @Post('nutrition')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  async createNutritionProfile(
    @Param('elderId') elderId: string,
    @Body() dto: CreateNutritionProfileDto,
  ) {
    return this.healthProfilesService.createNutritionProfile(
      Number(elderId),
      dto,
    );
  }

  /**
   * PUT /elders/:elderId/health-profiles/nutrition
   * Cập nhật hồ sơ dinh dưỡng
   */
  @Put('nutrition')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  async updateNutritionProfile(
    @Param('elderId') elderId: string,
    @Body() dto: UpdateNutritionProfileDto,
  ) {
    return this.healthProfilesService.updateNutritionProfile(
      Number(elderId),
      dto,
    );
  }

  /**
   * DELETE /elders/:elderId/health-profiles/nutrition
   * Xóa hồ sơ dinh dưỡng
   */
  @Delete('nutrition')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNutritionProfile(@Param('elderId') elderId: string) {
    await this.healthProfilesService.deleteNutritionProfile(Number(elderId));
  }

  // ==================== EXERCISE PROFILE ====================

  /**
   * GET /elders/:elderId/health-profiles/exercise
   * Lấy hồ sơ tập luyện
   */
  @Get('exercise')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.FAMILY,
  )
  async getExerciseProfile(@Param('elderId') elderId: string) {
    return this.healthProfilesService.getExerciseProfile(Number(elderId));
  }

  /**
   * POST /elders/:elderId/health-profiles/exercise
   * Tạo hồ sơ tập luyện
   */
  @Post('exercise')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  async createExerciseProfile(
    @Param('elderId') elderId: string,
    @Body() dto: CreateExerciseProfileDto,
  ) {
    return this.healthProfilesService.createExerciseProfile(
      Number(elderId),
      dto,
    );
  }

  /**
   * PUT /elders/:elderId/health-profiles/exercise
   * Cập nhật hồ sơ tập luyện
   */
  @Put('exercise')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  async updateExerciseProfile(
    @Param('elderId') elderId: string,
    @Body() dto: UpdateExerciseProfileDto,
  ) {
    return this.healthProfilesService.updateExerciseProfile(
      Number(elderId),
      dto,
    );
  }

  /**
   * DELETE /elders/:elderId/health-profiles/exercise
   * Xóa hồ sơ tập luyện
   */
  @Delete('exercise')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExerciseProfile(@Param('elderId') elderId: string) {
    await this.healthProfilesService.deleteExerciseProfile(Number(elderId));
  }

  // ==================== MOBILITY PROFILE ====================

  /**
   * GET /elders/:elderId/health-profiles/mobility
   * Lấy hồ sơ vận động
   */
  @Get('mobility')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.FAMILY,
  )
  async getMobilityProfile(@Param('elderId') elderId: string) {
    return this.healthProfilesService.getMobilityProfile(Number(elderId));
  }

  /**
   * POST /elders/:elderId/health-profiles/mobility
   * Tạo hồ sơ vận động
   */
  @Post('mobility')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  async createMobilityProfile(
    @Param('elderId') elderId: string,
    @Body() dto: CreateMobilityProfileDto,
  ) {
    return this.healthProfilesService.createMobilityProfile(
      Number(elderId),
      dto,
    );
  }

  /**
   * PUT /elders/:elderId/health-profiles/mobility
   * Cập nhật hồ sơ vận động
   */
  @Put('mobility')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  async updateMobilityProfile(
    @Param('elderId') elderId: string,
    @Body() dto: UpdateMobilityProfileDto,
  ) {
    return this.healthProfilesService.updateMobilityProfile(
      Number(elderId),
      dto,
    );
  }

  /**
   * DELETE /elders/:elderId/health-profiles/mobility
   * Xóa hồ sơ vận động
   */
  @Delete('mobility')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMobilityProfile(@Param('elderId') elderId: string) {
    await this.healthProfilesService.deleteMobilityProfile(Number(elderId));
  }
}