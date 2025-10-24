import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Elder } from '../../entities/elder.entity';
import { MedicalHistory } from '../../entities/medical-history.entity';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { removeVietnameseAccent } from '../../common/removeVietnameseAccent';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EldersService {
  constructor(
    @InjectRepository(Elder)
    private elderRepository: Repository<Elder>,
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async create(createElderDto: CreateElderDto, creatorUserId: number): Promise<Elder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ Sinh email tự động từ tên elderly
      const cleanName = removeVietnameseAccent(createElderDto.fullName)
        .replace(/\s+/g, '')
        .toLowerCase();

      if (createElderDto.phone) {
        const phoneExists = await queryRunner.manager.findOne(User, {
          where: { phone: createElderDto.phone },
          lock: { mode: 'pessimistic_read' }, // tránh 2 request đồng thời
        });

        if (phoneExists) {
          throw new BadRequestException('Số điện thoại đã tồn tại trong hệ thống.');
        }
      }

      let email: string;
      let exists = true;

      // 2️⃣ Lặp đến khi tạo được email chưa tồn tại
      while (exists) {
        const randomNumber = Math.floor(Math.random() * 900 + 100); // Tạo số ngẫu nhiên 3 chữ số
        email = `${cleanName}${randomNumber}@tcm.local`;

        const existing = await this.userRepository.findOne({ where: { email } });
        exists = !!existing; // true nếu đã tồn tại
      }

      // 2️⃣ Hash mật khẩu mặc định
      const passwordHash = await bcrypt.hash('default123', 10);

      // 3️⃣ Tạo User account cho Elder
      const user = this.userRepository.create({
        fullName: createElderDto.fullName,
        email,
        phone: createElderDto.phone,
        passwordHash,
        role: UserRole.ELDER,
        status: UserStatus.ACTIVE,
        avatar: null,
        notes: 'Tài khoản tạo tự động cho Elder',
      });

      const savedUser = await queryRunner.manager.save(User, user);

      // 4️⃣ Tạo Elder liên kết với User
      const elder = this.elderRepository.create({
        ...createElderDto,
        userId: savedUser.userId,
        status: 'Active',
      });
      const savedElder = await queryRunner.manager.save(Elder, elder);

      // 5️⃣ Tạo medical history
      const medicalHistory = this.medicalHistoryRepository.create({
        elderId: savedElder.elderId,
        diagnoses: '[]',
        allergies: '[]',
        chronicMedications: '[]',
      });
      await queryRunner.manager.save(MedicalHistory, medicalHistory);

      // ✅ Commit transaction
      await queryRunner.commitTransaction();
      return savedElder;

    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Trả về thông báo rõ ràng
      throw new BadRequestException(
        error.message || 'Không thể tạo Elder. Vui lòng thử lại.'
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Elder[]> {
    return this.elderRepository.find({
      relations: ['contactPerson', 'medicalHistory'],
    });
  }

  async findOne(id: string | number): Promise<Elder> {
    const elder = await this.elderRepository.findOne({
      where: { elderId: Number(id) },
      relations: ['contactPerson', 'medicalHistory', 'vitalReadings', 'medications'],
    });

    if (!elder) {
      throw new NotFoundException(`Elder with ID ${id} not found`);
    }

    return elder;
  }

  async update(id: string | number, updateElderDto: UpdateElderDto): Promise<Elder> {
    const elder = await this.findOne(id);
    Object.assign(elder, updateElderDto);
    return this.elderRepository.save(elder);
  }

  async remove(id: string | number): Promise<void> {
    await this.elderRepository.delete({ elderId: Number(id) });
  }

  async updateMedicalHistory(
    elderId: string | number,
    medicalHistoryData: Partial<MedicalHistory>,
  ): Promise<MedicalHistory> {
    const elder = await this.findOne(Number(elderId));

    let medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { elderId: elder.elderId },
    });

    if (!medicalHistory) {
      medicalHistory = this.medicalHistoryRepository.create({
        elderId: elder.elderId,
        ...medicalHistoryData,
      });
    } else {
      Object.assign(medicalHistory, medicalHistoryData);
    }

    return this.medicalHistoryRepository.save(medicalHistory);
  }
}