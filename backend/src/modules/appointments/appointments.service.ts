import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UserRole } from '../../entities/user.entity';

interface UserFromToken {
  userId: number;
  role: UserRole;
  email?: string;
  fullName?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createDto: CreateAppointmentDto): Promise<Appointment> {
    // Validate care type logic
    if (createDto.careType === 'Doctor' && !createDto.doctorId) {
      throw new BadRequestException('Doctor ID is required when care type is Doctor');
    }
    if (createDto.careType === 'Nurse' && !createDto.nurseId) {
      throw new BadRequestException('Nurse ID is required when care type is Nurse');
    }

    // Ensure only one of doctorId or nurseId is set based on careType
    const appointmentData: Partial<Appointment> = {
      elderId: createDto.elderId,
      careType: createDto.careType,
      visitDate: createDto.visitDate,
      nextVisitDate: createDto.nextVisitDate,
      notes: createDto.notes,
      status: createDto.status || 'Scheduled',
    };

    if (createDto.careType === 'Doctor') {
      appointmentData.doctorId = createDto.doctorId;
      appointmentData.nurseId = null;
    } else if (createDto.careType === 'Nurse') {
      appointmentData.nurseId = createDto.nurseId;
      appointmentData.doctorId = null;
    }

    const appointment = this.appointmentRepository.create(appointmentData);
    const saved = await this.appointmentRepository.save(appointment);
    return saved as Appointment;
  }

  /**
   * Filter appointments based on user role
   * - SuperAdmin/Admin: see all appointments
   * - Doctor: see only appointments where doctorId = userId
   * - Staff/Nurse: see only appointments where nurseId = userId
   */
  private getWhereCondition(user?: UserFromToken): any {
    if (!user) {
      return { appointmentId: -1 }; // No user means no access
    }

    // SuperAdmin and Admin can see all appointments
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return {};
    }

    // Doctor can only see appointments assigned to them
    if (user.role === UserRole.DOCTOR) {
      return { doctorId: user.userId };
    }

    // Staff/Nurse can only see appointments assigned to them
    if (user.role === UserRole.STAFF) {
      return { nurseId: user.userId };
    }

    // Other roles (Family, Elder) - return empty array (no appointments)
    return { appointmentId: -1 }; // This will return no results
  }

  async findAll(user?: UserFromToken): Promise<Appointment[]> {
    const whereCondition = this.getWhereCondition(user);
    
    return this.appointmentRepository.find({
      where: whereCondition,
      relations: ['elder', 'doctor', 'nurse'],
      order: { visitDate: 'DESC' },
    });
  }

  async findByElder(elderId: number, user?: UserFromToken): Promise<Appointment[]> {
    const roleFilter = this.getWhereCondition(user);
    
    // Combine elderId filter with role filter
    const whereCondition: any = { elderId };
    if (roleFilter.doctorId) {
      whereCondition.doctorId = roleFilter.doctorId;
    } else if (roleFilter.nurseId) {
      whereCondition.nurseId = roleFilter.nurseId;
    } else if (roleFilter.appointmentId === -1) {
      // User has no permission
      return [];
    }
    // If roleFilter is empty (Admin/SuperAdmin), only filter by elderId

    return this.appointmentRepository.find({
      where: whereCondition,
      relations: ['elder', 'doctor', 'nurse'],
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: number, user?: UserFromToken): Promise<Appointment> {
    if (!user) {
      throw new ForbiddenException('Bạn cần đăng nhập để xem cuộc hẹn');
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId: id },
      relations: ['elder', 'doctor', 'nurse'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Check if user has permission to view this appointment
    // SuperAdmin and Admin can see all
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return appointment;
    }

    // Doctor can only see appointments assigned to them
    if (user.role === UserRole.DOCTOR) {
      if (appointment.doctorId !== user.userId) {
        throw new ForbiddenException('Bạn không có quyền xem cuộc hẹn này');
      }
      return appointment;
    }

    // Staff/Nurse can only see appointments assigned to them
    if (user.role === UserRole.STAFF) {
      if (appointment.nurseId !== user.userId) {
        throw new ForbiddenException('Bạn không có quyền xem cuộc hẹn này');
      }
      return appointment;
    }

    // Other roles have no access
    throw new ForbiddenException('Bạn không có quyền xem cuộc hẹn này');
  }

  async update(id: number, updateDto: UpdateAppointmentDto, user?: UserFromToken): Promise<Appointment> {
    // findOne will check permissions - Doctor/Staff can only update their own appointments
    const appointment = await this.findOne(id, user);
    
    // If careType is being updated, validate the logic
    const careType = updateDto.careType || appointment.careType;
    
    if (careType === 'Doctor' && !updateDto.doctorId && !appointment.doctorId) {
      throw new BadRequestException('Doctor ID is required when care type is Doctor');
    }
    if (careType === 'Nurse' && !updateDto.nurseId && !appointment.nurseId) {
      throw new BadRequestException('Nurse ID is required when care type is Nurse');
    }

    // Ensure only one of doctorId or nurseId is set based on careType
    const updateData: any = { ...updateDto };
    
    if (careType === 'Doctor') {
      if (updateDto.doctorId !== undefined) {
        updateData.doctorId = updateDto.doctorId;
        updateData.nurseId = null;
      }
    } else if (careType === 'Nurse') {
      if (updateDto.nurseId !== undefined) {
        updateData.nurseId = updateDto.nurseId;
        updateData.doctorId = null;
      }
    }

    Object.assign(appointment, updateData);
    const saved = await this.appointmentRepository.save(appointment);
    return saved as Appointment;
  }

  async remove(id: number, user?: UserFromToken): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Bạn cần đăng nhập để xóa cuộc hẹn');
    }

    // findOne will check permissions - Doctor/Staff can only delete their own appointments
    const appointment = await this.findOne(id, user);
    
    // Staff cannot delete appointments (only Admin/Doctor can)
    if (user.role === UserRole.STAFF) {
      throw new ForbiddenException('Bạn không có quyền xóa cuộc hẹn');
    }
    
    const result = await this.appointmentRepository.delete({ appointmentId: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }
}
