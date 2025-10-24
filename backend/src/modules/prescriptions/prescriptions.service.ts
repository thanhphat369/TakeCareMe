import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../../entities/prescription.entity';
import { Medication } from '../../entities/medication.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const { medications, ...prescriptionData } = createPrescriptionDto;

    // Create prescription
    const prescription = this.prescriptionRepository.create({
      ...prescriptionData,
      prescriptionDate: new Date(prescriptionData.prescriptionDate),
      startDate: prescriptionData.startDate ? new Date(prescriptionData.startDate) : null,
      endDate: prescriptionData.endDate ? new Date(prescriptionData.endDate) : null,
    });

    const savedPrescription = await this.prescriptionRepository.save(prescription);

    // Create medications for this prescription
    if (medications && medications.length > 0) {
      const medicationEntities = medications.map(med => 
        this.medicationRepository.create({
          ...med,
          elderId: prescriptionData.elderId,
          prescriptionId: savedPrescription.prescriptionId,
          prescribedBy: prescriptionData.prescribedBy,
        })
      );

      await this.medicationRepository.save(medicationEntities);
    }

    return this.findOne(savedPrescription.prescriptionId);
  }
  

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      relations: ['elder', 'prescriber', 'medications'],
      order: { prescriptionDate: 'DESC' },
    });
  }

  async findByElder(elderId: number): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { elderId },
      relations: ['elder', 'prescriber', 'medications'],
      order: { prescriptionDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Prescription> {
    return this.prescriptionRepository.findOne({
      where: { prescriptionId: id },
      relations: ['elder', 'prescriber', 'medications'],
    });
  }

  // async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
  //   const { medications, ...prescriptionData } = updatePrescriptionDto;

  //   // Update prescription
  //   await this.prescriptionRepository.update(id, {
  //     ...prescriptionData,
  //     prescriptionDate: prescriptionData.prescriptionDate ? new Date(prescriptionData.prescriptionDate) : undefined,
  //     startDate: prescriptionData.startDate ? new Date(prescriptionData.startDate) : undefined,
  //     endDate: prescriptionData.endDate ? new Date(prescriptionData.endDate) : undefined,
  //   });

  //   // Update medications if provided
  //   if (medications) {
  //     // Delete existing medications for this prescription
  //     await this.medicationRepository.delete({ prescriptionId: id });

  //     // Create new medications
  //     if (medications.length > 0) {
  //       const medicationEntities = medications.map(med => 
  //         this.medicationRepository.create({
  //           ...med,
  //           elderId: prescriptionData.elderId || (await this.findOne(id)).elderId,
  //           prescriptionId: id,
  //           prescribedBy: prescriptionData.prescribedBy || (await this.findOne(id)).prescribedBy,
  //         })
  //       );

  //       await this.medicationRepository.save(medicationEntities);
  //     }
  //   }

  //   return this.findOne(id);
  // }
  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
  const { medications, ...prescriptionData } = updatePrescriptionDto;

  // 🧩 Cập nhật đơn thuốc
  await this.prescriptionRepository.update(id, {
    ...prescriptionData,
    prescriptionDate: prescriptionData.prescriptionDate
      ? new Date(prescriptionData.prescriptionDate)
      : undefined,
    startDate: prescriptionData.startDate
      ? new Date(prescriptionData.startDate)
      : undefined,
    endDate: prescriptionData.endDate
      ? new Date(prescriptionData.endDate)
      : undefined,
  });

  // 💊 Nếu có danh sách thuốc gửi lên
  if (medications) {
    // Xóa thuốc cũ của đơn này
    await this.medicationRepository.delete({ prescriptionId: id });

    if (medications.length > 0) {
      // ✅ Chỉ gọi DB 1 lần để lấy prescription hiện tại
      const existing = await this.findOne(id);

      // Tạo các entity thuốc mới
      const medicationEntities = medications.map((med) =>
        this.medicationRepository.create({
          ...med,
          elderId: prescriptionData.elderId || existing.elderId,
          prescriptionId: id,
          prescribedBy: prescriptionData.prescribedBy || existing.prescribedBy,
        }),
      );

      await this.medicationRepository.save(medicationEntities);
    }
  }

  return this.findOne(id);
}

  async delete(id: number): Promise<void> {
    // Delete associated medications first
    await this.medicationRepository.delete({ prescriptionId: id });
    
    // Delete prescription
    await this.prescriptionRepository.delete(id);
  }
}

