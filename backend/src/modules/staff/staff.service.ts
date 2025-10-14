import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Staff, StaffStatus } from '../../entities/staff.entity';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  /**
   * Tạo nhân viên mới (Doctor hoặc Staff)
   */
  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    // Validate role - chỉ chấp nhận Doctor hoặc Staff
    if (![UserRole.DOCTOR, UserRole.STAFF].includes(createStaffDto.role)) {
      throw new BadRequestException('Vai trò phải là Doctor hoặc Staff');
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: { email: createStaffDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createStaffDto.password || '123456',
      10,
    );

    // Tạo User account
    const user = this.userRepository.create({
      fullName: createStaffDto.fullName,
      email: createStaffDto.email,
      phone: createStaffDto.phone,
      role: createStaffDto.role,
      passwordHash: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Tạo Staff profile
    const staff = this.staffRepository.create({
      userId: savedUser.userId,
      roleTitle: createStaffDto.roleTitle,
      licenseNo: createStaffDto.licenseNo,
      department: createStaffDto.department,
      skills: createStaffDto.skills,
      experienceYears: createStaffDto.experienceYears || 0,
      education: createStaffDto.education,
      shift: createStaffDto.shift,
      status: createStaffDto.status || StaffStatus.ACTIVE,
      notes: createStaffDto.notes,
    });

    const savedStaff = await this.staffRepository.save(staff);

    return this.findOne(savedStaff.staffId);
  }

  /**
   * Lấy danh sách nhân viên với filter & pagination
   */
  async findAll(query: QueryStaffDto): Promise<{
    data: Staff[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { role, status, shift, department, page = 1, limit = 10 } = query;

    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff') // ✅ Changed to lowercase
      .leftJoinAndSelect('staff.user', 'user')
      .orderBy('staff.createdAt', 'DESC'); // ✅ Use camelCase property name

    if (role) queryBuilder.andWhere('user.role = :role', { role });
    if (status) queryBuilder.andWhere('staff.status = :status', { status });
    if (shift) queryBuilder.andWhere('staff.shift = :shift', { shift });
    if (department)
      queryBuilder.andWhere('staff.department LIKE :department', {
        department: `%${department}%`,
      });

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết một nhân viên
   */
  async findOne(staffId: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID ${staffId}`);
    }

    return staff;
  }

  /**
   * Lấy staff theo User ID
   */
  async findByUserId(userId: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException(`Không tìm thấy hồ sơ nhân viên cho User ID ${userId}`);
    }

    return staff;
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  async update(staffId: number, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(staffId);

    // Update Staff fields
    if (updateStaffDto.roleTitle !== undefined) staff.roleTitle = updateStaffDto.roleTitle;
    if (updateStaffDto.licenseNo !== undefined) staff.licenseNo = updateStaffDto.licenseNo;
    if (updateStaffDto.department !== undefined) staff.department = updateStaffDto.department;
    if (updateStaffDto.skills !== undefined) staff.skills = updateStaffDto.skills;
    if (updateStaffDto.experienceYears !== undefined) staff.experienceYears = updateStaffDto.experienceYears;
    if (updateStaffDto.education !== undefined) staff.education = updateStaffDto.education;
    if (updateStaffDto.shift !== undefined) staff.shift = updateStaffDto.shift;
    if (updateStaffDto.status !== undefined) staff.status = updateStaffDto.status;
    if (updateStaffDto.notes !== undefined) staff.notes = updateStaffDto.notes;

    await this.staffRepository.save(staff);

    // Update User if needed
    if (updateStaffDto.fullName || updateStaffDto.email || updateStaffDto.phone) {
      const updateUserData: any = {};
      if (updateStaffDto.fullName) updateUserData.fullName = updateStaffDto.fullName;
      if (updateStaffDto.email) updateUserData.email = updateStaffDto.email;
      if (updateStaffDto.phone) updateUserData.phone = updateStaffDto.phone;

      await this.userRepository.update(staff.userId, updateUserData);
    }

    return this.findOne(staffId);
  }

  /**
   * Xóa nhân viên (soft delete - chuyển status)
   */
  async remove(staffId: number): Promise<void> {
    const staff = await this.findOne(staffId);

    // Chuyển status thành Inactive
    staff.status = StaffStatus.INACTIVE;
    await this.staffRepository.save(staff);

    // Deactivate user account
    await this.userRepository.update(staff.userId, {
      status: UserStatus.INACTIVE
    });
  }

  /**
   * Chuyển trạng thái nghỉ phép
   */
  async setOnLeave(staffId: number, isOnLeave: boolean): Promise<Staff> {
    const staff = await this.findOne(staffId);
    staff.status = isOnLeave ? StaffStatus.ON_LEAVE : StaffStatus.ACTIVE;
    return this.staffRepository.save(staff);
  }

  /**
   * Lấy nhân viên theo ca làm việc
   */
  async getStaffByShift(shift: string): Promise<Staff[]> {
    return this.staffRepository.find({
      where: {
        shift: shift as any,
        status: StaffStatus.ACTIVE
      },
      relations: ['user'],
      order: { roleTitle: 'ASC' },
    });
  }

  /**
   * Lấy nhân viên theo khoa/phòng
   */
  async getStaffByDepartment(department: string): Promise<Staff[]> {
    return this.staffRepository.find({
      where: {
        department: Like(`%${department}%`),
        status: StaffStatus.ACTIVE
      },
      relations: ['user'],
      order: { roleTitle: 'ASC' },
    });
  }

  /**
   * Thống kê nhân viên
   */
  async getStatistics(): Promise<any> {
    const [total, active, inactive, onLeave] = await Promise.all([
      this.staffRepository.count(),
      this.staffRepository.count({ where: { status: StaffStatus.ACTIVE } }),
      this.staffRepository.count({ where: { status: StaffStatus.INACTIVE } }),
      this.staffRepository.count({ where: { status: StaffStatus.ON_LEAVE } }),
    ]);

    // Count by role
    const doctors = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoin('staff.user', 'user')
      .where('user.role = :role', { role: UserRole.DOCTOR })
      .andWhere('staff.status = :status', { status: StaffStatus.ACTIVE })
      .getCount();

    const nurses = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoin('staff.user', 'user')
      .where('user.role = :role', { role: UserRole.STAFF })
      .andWhere('staff.status = :status', { status: StaffStatus.ACTIVE })
      .getCount();

    // Count by shift
    const shiftStats = await this.staffRepository
      .createQueryBuilder('staff')
      .select('staff.shift', 'shift')
      .addSelect('COUNT(*)', 'count')
      .where('staff.status = :status', { status: StaffStatus.ACTIVE })
      .groupBy('staff.shift')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      onLeave,
      byRole: { doctors, nurses },
      byShift: shiftStats,
    };
  }
}