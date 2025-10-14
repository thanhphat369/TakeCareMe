import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { VitalsService } from '../vitals/vitals.service';
import * as crypto from 'crypto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private vitalsService: VitalsService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // Generate pairing token
    const pairingToken = crypto.randomBytes(32).toString('hex');

    const device = this.deviceRepository.create({
      ...createDeviceDto,
      pairingToken,
      status: 'Active',
      lastSeen: new Date(),
    });

    return this.deviceRepository.save(device);
  }

  async findAll(elderId?: number): Promise<Device[]> {
    const where: any = { status: 'Active' };
    if (elderId) where.elderId = elderId;

    return this.deviceRepository.find({
      where,
      relations: ['elder', 'elder.user'],
      order: { lastSeen: 'DESC' },
    });
  }

  async findOne(deviceId: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId },
      relations: ['elder', 'elder.user'],
    });

    if (!device) {
      throw new NotFoundException(`Không tìm thấy thiết bị với ID ${deviceId}`);
    }

    return device;
  }

  async update(deviceId: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(deviceId);
    Object.assign(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  async remove(deviceId: number): Promise<void> {
    const device = await this.findOne(deviceId);
    device.status = 'Inactive';
    await this.deviceRepository.save(device);
  }

  async receiveDeviceData(deviceId: number, token: string, data: any): Promise<any> {
    const device = await this.findOne(deviceId);

    // Verify pairing token
    if (device.pairingToken !== token) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // Update last seen
    device.lastSeen = new Date();
    await this.deviceRepository.save(device);

    // Process vital data
    const vitalReading = await this.vitalsService.create({
      elderId: device.elderId,
      type: data.type,
      value: data.value,
      unit: data.unit,
      source: 'IoT',
    });

    return {
      success: true,
      message: 'Dữ liệu đã được ghi nhận',
      vitalReading,
    };
  }

  async regenerateToken(deviceId: number): Promise<Device> {
    const device = await this.findOne(deviceId);
    device.pairingToken = crypto.randomBytes(32).toString('hex');
    return this.deviceRepository.save(device);
  }
}