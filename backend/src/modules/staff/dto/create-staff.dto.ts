import { 
  IsNotEmpty, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  Min, 
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../../entities/user.entity';
import { StaffShift, StaffStatus } from '../../../entities/staff.entity';

export class CreateStaffDto {
  // User Info
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(100)
  fullName: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsOptional()
  @MinLength(10, { message: 'Số điện thoại phải có ít nhất 10 số' })
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password?: string;

  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ. Chỉ chấp nhận Doctor hoặc Staff' })
  role: UserRole.DOCTOR | UserRole.STAFF;

  @IsNotEmpty({ message: 'Chức danh không được để trống' })
  @MaxLength(50)
  roleTitle: string;

  @IsOptional()
  @MaxLength(50)
  licenseNo?: string;

  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @MaxLength(255)
  skills?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Số năm kinh nghiệm không được âm' })
  experienceYears?: number;

  @IsOptional()
  @MaxLength(255)
  education?: string;

  @IsOptional()
  @IsEnum(StaffShift, { message: 'Ca làm việc không hợp lệ' })
  shift?: StaffShift;

  @IsOptional()
  @IsEnum(StaffStatus, { message: 'Trạng thái không hợp lệ' })
  status?: StaffStatus;

  @IsOptional()
  notes?: string;

  @IsOptional()
  avatar?: string;
}