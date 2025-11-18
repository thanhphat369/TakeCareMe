// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, DataSource } from 'typeorm';
// import { Elder } from '../../entities/elder.entity';
// import { MedicalHistory } from '../../entities/medical-history.entity';
// import { User, UserRole, UserStatus } from '../../entities/user.entity';
// import { CreateElderDto } from './dto/create-elder.dto';
// import { UpdateElderDto } from './dto/update-elder.dto';
// import { removeVietnameseAccent } from '../../common/removeVietnameseAccent';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class EldersService {
//   constructor(
//     @InjectRepository(Elder)
//     private elderRepository: Repository<Elder>,
//     @InjectRepository(MedicalHistory)
//     private medicalHistoryRepository: Repository<MedicalHistory>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     private dataSource: DataSource,
//   ) { }

//   async create(createElderDto: CreateElderDto, creatorUserId: number): Promise<Elder> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       // 1️⃣ Sinh email tự động từ tên elderly
//       const cleanName = removeVietnameseAccent(createElderDto.fullName)
//         .replace(/\s+/g, '')
//         .toLowerCase();

//       if (createElderDto.phone) {
//         const phoneExists = await queryRunner.manager.findOne(User, {
//           where: { phone: createElderDto.phone },
//           lock: { mode: 'pessimistic_read' }, // tránh 2 request đồng thời
//         });

//         if (phoneExists) {
//           throw new BadRequestException('Số điện thoại đã tồn tại trong hệ thống.');
//         }
//       }

//       let email: string;
//       let exists = true;

//       // 2️⃣ Lặp đến khi tạo được email chưa tồn tại
//       while (exists) {
//         const randomNumber = Math.floor(Math.random() * 900 + 100); // Tạo số ngẫu nhiên 3 chữ số
//         email = `${cleanName}${randomNumber}@tcm.local`;

//         const existing = await this.userRepository.findOne({ where: { email } });
//         exists = !!existing; // true nếu đã tồn tại
//       }

//       // 2️⃣ Hash mật khẩu mặc định
//       const passwordHash = await bcrypt.hash('default123', 10);

//       // 3️⃣ Tạo User account cho Elder
//       const user = this.userRepository.create({
//         fullName: createElderDto.fullName,
//         email,
//         phone: createElderDto.phone,
//         passwordHash,
//         role: UserRole.ELDER,
//         status: UserStatus.ACTIVE,
//         avatar: null,
//         notes: 'Tài khoản tạo tự động cho Elder',
//       });

//       const savedUser = await queryRunner.manager.save(User, user);

//       // 4️⃣ Tạo Elder liên kết với User
//       const elderData: any = {
//         fullName: createElderDto.fullName,
//         dob: createElderDto.dob ? new Date(createElderDto.dob) : null,
//         age: createElderDto.age || null,
//         phone: createElderDto.phone || null,
//         gender: createElderDto.gender,
//         address: createElderDto.address || null,
//         note: createElderDto.note || null,
//         userId: savedUser.userId,
//         status: 'Active',
//         avatar: createElderDto.avatar && createElderDto.avatar.trim() !== '' ? createElderDto.avatar : null,
//       };
      
//       console.log('Creating elder with data:', JSON.stringify(elderData, null, 2));
//       const elder = this.elderRepository.create(elderData);
//       const savedElder = await queryRunner.manager.save(Elder, elder);
//       const savedElderSingle = Array.isArray(savedElder) ? savedElder[0] : savedElder;
//       console.log('Saved elder - ID:', savedElderSingle.elderId, 'Avatar:', (savedElderSingle as any).avatar);

//       // 5️⃣ Tạo medical history
//       const medicalHistory = this.medicalHistoryRepository.create({
//         elderId: savedElderSingle.elderId,
//         diagnoses: '[]',
//         allergies: '[]',
//         chronicMedications: '[]',
//       });
//       await queryRunner.manager.save(MedicalHistory, medicalHistory);

//       // ✅ Commit transaction
//       await queryRunner.commitTransaction();
//       return savedElderSingle;

//     } catch (error) {
//       await queryRunner.rollbackTransaction();

//       // Trả về thông báo rõ ràng
//       throw new BadRequestException(
//         error.message || 'Không thể tạo Elder. Vui lòng thử lại.'
//       );
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async findOne(id: string | number): Promise<Elder> {
//     const elder = await this.elderRepository.findOne({
//       where: { elderId: Number(id) },
//       relations: ['familyRelations.family', 'medicalHistory', 'vitalReadings', 'medications'],
//     });

//     if (!elder) {
//       throw new NotFoundException(`Elder with ID ${id} not found`);
//     }

//     return elder;
//   }

//   async findAll(): Promise<any[]> {
//     return await this.elderRepository
//       .createQueryBuilder('e')
//       .leftJoin('Family_Elder', 'fe', 'fe.elder_id = e.elder_id AND fe.is_primary = 1')
//       .leftJoin('Users', 'u', 'u.user_id = fe.family_id')
//       .select([
//         'e.elder_id AS elderId',
//         'e.full_name AS fullName',
//         'e.dob AS dob',
//         'e.gender AS gender',
//         'e.phone AS phone',
//         'e.age AS age',
//         'e.address AS address',
//         'e.status AS status',
//         'e.avatar AS avatar',
//         'e.created_at AS createdAt',
//         'u.full_name AS familyName',
//         'u.phone AS familyPhone',
//         'fe.relationship AS relationship',
//       ])
//       .getRawMany();
//   }

//   async update(id: string | number, updateElderDto: UpdateElderDto): Promise<Elder> {
//     const elder = await this.findOne(id);
//     console.log('Updating elder ID:', id);
//     console.log('Update data:', JSON.stringify(updateElderDto, null, 2));
//     console.log('Current elder avatar:', (elder as any).avatar);
    
//     // Cập nhật từng field một cách rõ ràng
//     if (updateElderDto.fullName !== undefined) elder.fullName = updateElderDto.fullName;
//     if (updateElderDto.dob !== undefined) elder.dob = updateElderDto.dob ? new Date(updateElderDto.dob) : null;
//     if (updateElderDto.age !== undefined) elder.age = updateElderDto.age as any;
//     if (updateElderDto.phone !== undefined) elder.phone = updateElderDto.phone;
//     if (updateElderDto.gender !== undefined) elder.gender = updateElderDto.gender;
//     if (updateElderDto.address !== undefined) elder.address = updateElderDto.address;
//     if (updateElderDto.note !== undefined) elder.note = updateElderDto.note;
//     // status không có trong UpdateElderDto, bỏ qua
    
//     // Xử lý avatar đặc biệt
//     if (updateElderDto.hasOwnProperty('avatar')) {
//       (elder as any).avatar = updateElderDto.avatar && updateElderDto.avatar.trim() !== '' 
//         ? updateElderDto.avatar.trim() 
//         : null;
//       console.log('Setting avatar to:', (elder as any).avatar);
//     }
    
//     const savedElder = await this.elderRepository.save(elder);
//     console.log('Saved elder - ID:', savedElder.elderId, 'Avatar:', (savedElder as any).avatar);
    
//     // Verify bằng cách query lại
//     const verifyElder = await this.elderRepository
//       .createQueryBuilder('e')
//       .select(['e.elderId', 'e.fullName', 'e.avatar'])
//       .where('e.elderId = :id', { id: savedElder.elderId })
//       .getOne();
//     console.log('Verified elder avatar from DB:', verifyElder ? (verifyElder as any).avatar : 'null');
    
//     return savedElder;
//   }

//   async remove(id: string | number): Promise<void> {
//     await this.elderRepository.delete({ elderId: Number(id) });
//   }

//   async updateMedicalHistory(
//     elderId: string | number,
//     medicalHistoryData: Partial<MedicalHistory>,
//   ): Promise<MedicalHistory> {
//     const elder = await this.findOne(Number(elderId));

//     let medicalHistory = await this.medicalHistoryRepository.findOne({
//       where: { elderId: elder.elderId },
//     });

//     if (!medicalHistory) {
//       medicalHistory = this.medicalHistoryRepository.create({
//         elderId: elder.elderId,
//         ...medicalHistoryData,
//       });
//     } else {
//       Object.assign(medicalHistory, medicalHistoryData);
//     }

//     return this.medicalHistoryRepository.save(medicalHistory);
//   }
// }
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Elder } from '../../entities/elder.entity';
import { FamilyElder } from '../../entities/family-elder.entity';
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
    @InjectRepository(FamilyElder)
    private familyElderRepository: Repository<FamilyElder>,
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * 🔹 Tạo Elder mới
   */
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
          lock: { mode: 'pessimistic_read' },
        });

        if (phoneExists) {
          throw new BadRequestException('Số điện thoại đã tồn tại trong hệ thống.');
        }
      }

      let email: string;
      let exists = true;

      // 2️⃣ Lặp đến khi tạo được email chưa tồn tại
      while (exists) {
        const randomNumber = Math.floor(Math.random() * 900 + 100);
        email = `${cleanName}${randomNumber}@tcm.local`;
        const existing = await this.userRepository.findOne({ where: { email } });
        exists = !!existing;
      }

      // 3️⃣ Hash mật khẩu mặc định
      const passwordHash = await bcrypt.hash('atc123', 10);

      // 4️⃣ Tạo User account cho Elder
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

      // 5️⃣ Tạo Elder liên kết với User
      // ✅ XỬ LÝ AVATAR: Chỉ lưu relative path, trim empty string thành null
      let avatarPath: string | null = null;
      if (createElderDto.avatar && createElderDto.avatar.trim() !== '') {
        avatarPath = createElderDto.avatar.trim();
        // Nếu là full URL, extract relative path
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
          try {
            const url = new URL(avatarPath);
            avatarPath = url.pathname; // Lấy phần path: /uploads/avatars/xxx.jpg
          } catch (e) {
            console.warn('Invalid avatar URL:', avatarPath);
          }
        }
      }

      const elderData = {
        fullName: createElderDto.fullName,
        dob: createElderDto.dob ? new Date(createElderDto.dob) : null,
        age: createElderDto.age || null,
        phone: createElderDto.phone || null,
        gender: createElderDto.gender,
        address: createElderDto.address || null,
        note: createElderDto.note || null,
        userId: savedUser.userId,
        status: 'Active',
        avatar: avatarPath, // ✅ Lưu relative path hoặc null
      };

      console.log('Creating elder with avatar:', avatarPath);
      const elder = this.elderRepository.create(elderData);
      const savedElder = await queryRunner.manager.save(Elder, elder);

      // 6️⃣ Tạo medical history
      const medicalHistory = this.medicalHistoryRepository.create({
        elderId: savedElder.elderId,
        diagnoses: '[]',
        allergies: '[]',
        chronicMedications: '[]',
      });
      await queryRunner.manager.save(MedicalHistory, medicalHistory);

      await queryRunner.commitTransaction();
      
      console.log('✅ Elder created - ID:', savedElder.elderId, 'Avatar:', savedElder.avatar);
      return savedElder;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error creating elder:', error);
      throw new BadRequestException(
        error.message || 'Không thể tạo Elder. Vui lòng thử lại.'
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 🔹 Lấy danh sách Elders với thông tin người thân
   */
  async findAll(): Promise<any[]> {
    const result = await this.elderRepository
      .createQueryBuilder('e')
      .leftJoin('Family_Elder', 'fe', 'fe.elder_id = e.elder_id AND fe.is_primary = 1')
      .leftJoin('Users', 'u', 'u.user_id = fe.family_id')
      .leftJoin('Users', 'ue', 'ue.user_id = e.user_id')
      .select([
        'e.elder_id AS elderId',
        'e.full_name AS fullName',
        'e.dob AS dob',
        'e.gender AS gender',
        'e.phone AS phone',
        'e.age AS age',
        'e.address AS address',
        'e.avatar AS avatar',
        'e.note AS note',
        'e.status AS status',
        'e.created_at AS createdAt',
        'e.updated_at AS updatedAt',
        'u.full_name AS familyName',
        'u.phone AS familyPhone',
        'ue.email AS email',       
        'ue.phone AS userPhone',
        'fe.relationship AS relationship',
      ])
      .orderBy('e.created_at', 'DESC')
      .getRawMany();

    console.log('✅ Found', result.length, 'elders');
    return result;
  }

  /**
   * 🔹 Lấy chi tiết một Elder
   */
  async findOne(id: string | number): Promise<Elder> {
    const elder = await this.elderRepository.findOne({
      where: { elderId: Number(id) },
    });

    if (!elder) {
      throw new NotFoundException(`Elder with ID ${id} not found`);
    }

    console.log('✅ Found elder - ID:', elder.elderId, 'Avatar:', elder.avatar);
    return elder;
  }

  /**
   * 🔹 Cập nhật Elder
   */
  async update(id: string | number, updateElderDto: UpdateElderDto): Promise<Elder> {
    const elder = await this.findOne(id);
    
    console.log('Updating elder ID:', id);
    console.log('Current avatar:', elder.avatar);
    console.log('New avatar from DTO:', updateElderDto.avatar);

    // Cập nhật từng field
    if (updateElderDto.fullName !== undefined) elder.fullName = updateElderDto.fullName;
    if (updateElderDto.dob !== undefined) elder.dob = updateElderDto.dob ? new Date(updateElderDto.dob) : null;
    if (updateElderDto.age !== undefined) elder.age = updateElderDto.age as any;
    if (updateElderDto.phone !== undefined) elder.phone = updateElderDto.phone;
    if (updateElderDto.gender !== undefined) elder.gender = updateElderDto.gender;
    if (updateElderDto.address !== undefined) elder.address = updateElderDto.address;
    if (updateElderDto.note !== undefined) elder.note = updateElderDto.note;

    // ✅ XỬ LÝ AVATAR khi update
    if (updateElderDto.hasOwnProperty('avatar')) {
      let avatarPath: string | null = null;
      
      if (updateElderDto.avatar && updateElderDto.avatar.trim() !== '') {
        avatarPath = updateElderDto.avatar.trim();
        
        // Nếu là full URL, extract relative path
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
          try {
            const url = new URL(avatarPath);
            avatarPath = url.pathname;
          } catch (e) {
            console.warn('Invalid avatar URL:', avatarPath);
          }
        }
      }
      
      elder.avatar = avatarPath;
      console.log('Setting avatar to:', avatarPath);
    }

    const savedElder = await this.elderRepository.save(elder);
    console.log('✅ Elder updated - ID:', savedElder.elderId, 'Avatar:', savedElder.avatar);

    // Verify bằng query lại
    const verified = await this.elderRepository.findOne({
      where: { elderId: savedElder.elderId },
    });
    console.log('✅ Verified from DB - Avatar:', verified?.avatar);

    return savedElder;
  }

  /**
   * 🔹 Xóa Elder
   */
  async remove(id: string | number): Promise<void> {
    await this.elderRepository.delete({ elderId: Number(id) });
  }

  /**
   * 🔹 Cập nhật Medical History
   */
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

  /**
   * Helper: Tính tuổi từ ngày sinh
   */
  private calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}