// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, DataSource } from 'typeorm';
// import { Medication } from '../../entities/medication.entity';
// import { CreatePrescriptionDto } from './dto/create-prescription.dto';
// import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

// @Injectable()
// export class PrescriptionsService {
//   constructor(
//     @InjectRepository(Medication)
//     private medicationRepository: Repository<Medication>,
//     private dataSource: DataSource,
//   ) {}

//   /**
//    * 🔹 Lấy tất cả đơn thuốc (group by prescription_date + elder_id)
//    */
//   async findAll(): Promise<any[]> {
//     const medications = await this.medicationRepository.find({
//       relations: ['elder', 'prescriber'],
//       order: { prescriptionDate: 'DESC', medicationId: 'ASC' },
//     });

//     const grouped = this.groupMedicationsByPrescription(medications);
//     return grouped;
//   }

//   /**
//    * 🔹 Lấy đơn thuốc theo Elder
//    */
//   async findByElder(elderId: number): Promise<any[]> {
//     const medications = await this.medicationRepository.find({
//       where: { elderId },
//       relations: ['prescriber'],
//       order: { prescriptionDate: 'DESC', medicationId: 'ASC' },
//     });

//     const grouped = this.groupMedicationsByPrescription(medications);
//     return grouped;
//   }

//   /**
//    * 🔹 Lấy chi tiết 1 đơn thuốc (by first medication_id)
//    */
//   async findOne(medicationId: number): Promise<any> {
//     const firstMed = await this.medicationRepository.findOne({
//       where: { medicationId },
//       relations: ['elder', 'prescriber'],
//     });

//     if (!firstMed) {
//       throw new NotFoundException('Prescription not found');
//     }

//     // Lấy tất cả medications cùng prescription_date + elder_id
//     const medications = await this.medicationRepository.find({
//       where: { 
//         prescriptionDate: firstMed.prescriptionDate,
//         elderId: firstMed.elderId,
//         prescribedBy: firstMed.prescribedBy,
//       },
//       relations: ['elder', 'prescriber'],
//       order: { medicationId: 'ASC' },
//     });

//     return this.formatPrescriptionGroup(medications);
//   }

//   /**
//    * 🔹 Tạo đơn thuốc mới
//    */
//   async create(dto: CreatePrescriptionDto): Promise<any> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const medications = dto.medications.map((med) =>
//         this.medicationRepository.create({
//           elderId: dto.elderId,
//           name: med.name,
//           dose: med.dose,
//           frequency: med.frequency,
//           time: med.time,
//           startDate: dto.startDate || dto.prescriptionDate,
//           endDate: dto.endDate,
//           notes: med.notes,
//           prescribedBy: dto.prescribedBy,
//           diagnosis: dto.diagnosis,
//           prescriptionDate: dto.prescriptionDate,
//         })
//       );

//       const savedMeds = await queryRunner.manager.save(Medication, medications);
//       await queryRunner.commitTransaction();

//       return this.formatPrescriptionGroup(savedMeds);
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       console.error('❌ Error creating prescription:', error);
//       throw new BadRequestException('Không thể tạo đơn thuốc: ' + error.message);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   /**
//    * 🔹 Cập nhật đơn thuốc (by first medication_id)
//    */
//   async update(medicationId: number, dto: UpdatePrescriptionDto): Promise<any> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       // Lấy medication đầu tiên để biết prescription_date và elder_id
//       const firstMed = await this.medicationRepository.findOne({
//         where: { medicationId },
//       });

//       if (!firstMed) {
//         throw new NotFoundException('Prescription not found');
//       }

//       // Xóa tất cả medications cùng group
//       await queryRunner.manager.delete(Medication, {
//         prescriptionDate: firstMed.prescriptionDate,
//         elderId: firstMed.elderId,
//         prescribedBy: firstMed.prescribedBy,
//       });

//       // Tạo medications mới
//       const medications = dto.medications.map((med) =>
//         this.medicationRepository.create({
//           elderId: dto.elderId || firstMed.elderId,
//           name: med.name,
//           dose: med.dose,
//           frequency: med.frequency,
//           time: med.time,
//           startDate: dto.startDate || dto.prescriptionDate || firstMed.startDate,
//           endDate: dto.endDate || firstMed.endDate,
//           notes: med.notes,
//           prescribedBy: dto.prescribedBy || firstMed.prescribedBy,
//           diagnosis: dto.diagnosis || firstMed.diagnosis,
//           prescriptionDate: dto.prescriptionDate || firstMed.prescriptionDate,
//         })
//       );

//       const savedMeds = await queryRunner.manager.save(Medication, medications);
//       await queryRunner.commitTransaction();

//       return this.formatPrescriptionGroup(savedMeds);
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       console.error('❌ Error updating prescription:', error);
//       throw new BadRequestException('Không thể cập nhật đơn thuốc: ' + error.message);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   /**
//    * 🔹 Xóa đơn thuốc (by first medication_id)
//    */
//   async remove(medicationId: number): Promise<void> {
//     const firstMed = await this.medicationRepository.findOne({
//       where: { medicationId },
//     });

//     if (!firstMed) {
//       throw new NotFoundException('Prescription not found');
//     }

//     // Xóa tất cả medications cùng group
//     const result = await this.medicationRepository.delete({
//       prescriptionDate: firstMed.prescriptionDate,
//       elderId: firstMed.elderId,
//       prescribedBy: firstMed.prescribedBy,
//     });

//     if (result.affected === 0) {
//       throw new NotFoundException('Prescription not found');
//     }
//   }

//   /**
//    * 🔹 Helper: Group medications thành prescriptions
//    */
//   private groupMedicationsByPrescription(medications: Medication[]): any[] {
//     const grouped = new Map<string, Medication[]>();

//     medications.forEach((med) => {
//       const key = `${med.prescriptionDate}_${med.elderId}_${med.prescribedBy}`;
//       if (!grouped.has(key)) {
//         grouped.set(key, []);
//       }
//       grouped.get(key)!.push(med);
//     });

//     return Array.from(grouped.values()).map((meds) => this.formatPrescriptionGroup(meds));
//   }

//   /**
//    * 🔹 Helper: Format group medications thành prescription object
//    */
//   private formatPrescriptionGroup(medications: Medication[]): any {
//     if (medications.length === 0) return null;

//     const first = medications[0];
//     return {
//       prescriptionId: first.medicationId, // Dùng medicationId đầu tiên
//       prescriptionDate: first.prescriptionDate,
//       elderId: first.elderId,
//       prescribedBy: first.prescribedBy,
//       diagnosis: first.diagnosis,
//       startDate: first.startDate,
//       endDate: first.endDate,
//       elder: first.elder,
//       prescriber: first.prescriber,
//       medications: medications.map((med) => ({
//         medicationId: med.medicationId,
//         name: med.name,
//         dose: med.dose,
//         frequency: med.frequency,
//         time: med.time,
//         notes: med.notes,
//       })),
//     };
//   }
// }