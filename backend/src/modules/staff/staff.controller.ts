import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * Tạo nhân viên mới
   * POST /api/staff
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  /**
   * Lấy danh sách nhân viên (có filter & pagination)
   * GET /api/staff?role=Doctor&status=Active&page=1&limit=10
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  findAll(@Query() query: QueryStaffDto) {
    return this.staffService.findAll(query);
  }

  /**
   * Lấy thống kê nhân viên
   * GET /api/staff/statistics
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getStatistics() {
    return this.staffService.getStatistics();
  }

  /**
   * Lấy nhân viên theo ca làm việc
   * GET /api/staff/by-shift/morning
   */
  @Get('by-shift/:shift')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getByShift(@Param('shift') shift: string) {
    return this.staffService.getStaffByShift(shift);
  }

  /**
   * Lấy nhân viên theo khoa/phòng
   * GET /api/staff/by-department?name=Nội%20khoa
   */
  @Get('by-department')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getByDepartment(@Query('name') department: string) {
    return this.staffService.getStaffByDepartment(department);
  }

  /**
   * Lấy chi tiết một nhân viên
   * GET /api/staff/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  /**
   * Cập nhật thông tin nhân viên
   * PATCH /api/staff/:id
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, updateStaffDto);
  }

  /**
   * Xóa nhân viên (soft delete)
   * DELETE /api/staff/:id
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }

  /**
   * Chuyển trạng thái nghỉ phép
   * PATCH /api/staff/:id/on-leave
   */
  @Patch(':id/on-leave')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  setOnLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body('isOnLeave') isOnLeave: boolean,
  ) {
    return this.staffService.setOnLeave(id, isOnLeave);
  }
}
