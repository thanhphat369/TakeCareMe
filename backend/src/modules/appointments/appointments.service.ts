import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(createDto);
    return this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['elder', 'doctor'],
      order: { visitDate: 'DESC' },
    });
  }

  async findByElder(elderId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { elderId },
      relations: ['doctor'],
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId: id },
      relations: ['elder', 'doctor'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: number, updateDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    await this.appointmentRepository.delete(id);
  }
}
