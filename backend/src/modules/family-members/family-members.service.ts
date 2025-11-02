import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { Elder } from '../../entities/elder.entity';
import { FamilyElder } from '../../entities/family-elder.entity';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

function toUserStatus(s?: string): UserStatus {
  if (!s) return UserStatus.ACTIVE;
  const norm = s.toLowerCase();
  if (norm === 'inactive') return UserStatus.INACTIVE;
  if (norm === 'banned') return UserStatus.BANNED;
  return UserStatus.ACTIVE;
}

@Injectable()
export class FamilyMembersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(FamilyElder)
    private readonly familyElderRepo: Repository<FamilyElder>,
    @InjectRepository(Elder)
    private readonly elderRepo: Repository<Elder>,
  ) {}

  /** Tạo người thân và liên kết với Elder */
  async create(elderId: number, dto: CreateFamilyMemberDto): Promise<User> {
    const elder = await this.elderRepo.findOne({ where: { elderId } });
    if (!elder) throw new NotFoundException('Elder không tồn tại');

    const existed = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existed) throw new BadRequestException('Email đã tồn tại');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Ép kiểu để TS chọn overload "single entity"
    const family = this.userRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      role: UserRole.FAMILY,
      passwordHash,
      avatar: dto.avatar ?? null,
      // Nếu KHÔNG có cột address trong Users, hãy comment dòng dưới
      address: dto.address ?? null,
      status: toUserStatus(dto.status),
    } as DeepPartial<User>);

    const savedFamily = await this.userRepo.save(family as User);

    const link = this.familyElderRepo.create({
      familyId: savedFamily.userId,
      elderId,
      relationship: dto.relationship,
      isPrimary: dto.isPrimary ?? false,
    } as DeepPartial<FamilyElder>);

    await this.familyElderRepo.save(link);
    return savedFamily;
  }

  /** Cập nhật người thân */
  async update(familyId: number, dto: UpdateFamilyMemberDto): Promise<User> {
    const family = await this.userRepo.findOne({
      where: { userId: familyId, role: UserRole.FAMILY },
    });
    if (!family) throw new NotFoundException('Không tìm thấy người thân');

    if (dto.fullName !== undefined) family.fullName = dto.fullName;
    if (dto.email !== undefined) family.email = dto.email;
    if (dto.phone !== undefined) family.phone = dto.phone;
    if (dto.avatar !== undefined) family.avatar = dto.avatar;
    // Nếu KHÔNG có cột address trong Users, comment dòng dưới
    // if (dto.address !== undefined) family.address = dto.address;
    if (dto.status !== undefined) family.status = toUserStatus(dto.status);

    await this.userRepo.save(family);

    // Cập nhật relationship / isPrimary (nếu có)
    if (dto.relationship !== undefined || dto.isPrimary !== undefined) {
      await this.familyElderRepo.update(
        { familyId },
        {
          relationship: dto.relationship,
          isPrimary: dto.isPrimary,
        },
      );
    }

    return family;
  }

 /** Danh sách người thân theo Elder */
async findByElder(elderId: number) {
  return await this.familyElderRepo
    .createQueryBuilder('fe')
    .leftJoinAndSelect('fe.family', 'family') // join với Users
    .where('fe.elderId = :elderId', { elderId })
    .select([
      'fe.familyId',
      'fe.elderId',
      'fe.relationship',
      'fe.isPrimary',
      'fe.createdAt',
      'family.userId',
      'family.fullName',
      'family.email',
      'family.phone',
      'family.avatar',
      'family.status',
    ])
    .getMany();
}

  /** Xoá người thân */
  async remove(familyId: number, elderId: number): Promise<void> {
    await this.familyElderRepo.delete({ familyId, elderId });
    // Không cần filter role ở đây để tránh type mismatch enum
    await this.userRepo.delete({ userId: familyId });
  }
}
