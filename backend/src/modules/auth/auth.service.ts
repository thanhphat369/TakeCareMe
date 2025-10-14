import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserStatus } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không hoạt động');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Optional: update last login if implemented in UsersService (skipped)

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { 
      email: user.email, 
      sub: user.userId, 
      role: user.role 
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: registerDto.phone,
      role: registerDto.role,
      passwordHash: hashedPassword,
      avatar: registerDto.avatar,
      status: UserStatus.ACTIVE,
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(String(userId));
    
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(String(userId), { passwordHash: hashedNewPassword });

    return { message: 'Đổi mật khẩu thành công' };
  }

  
}
// ✅ Đúng
// @Injectable()
// export class AuthService {
//   constructor(
//     private usersService: UsersService,
//     private jwtService: JwtService,
//   ) {}

//   async validateUser(email: string, password: string): Promise<any> {
//     const user = await this.usersService.findByEmail(email);
    
//     if (!user) return null;

//     if (user.status !== 'Active') {
//       throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không hoạt động');
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isPasswordValid) return null;

//     const { passwordHash, ...result } = user;
//     return result;
//   }

//   async login(loginDto: LoginDto) {
//     const user = await this.validateUser(loginDto.email, loginDto.password);
//     if (!user) {
//       throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
//     }

//     const payload = { 
//       email: user.email, 
//       sub: user.userId, 
//       role: user.role 
//     };

//     return {
//       accessToken: this.jwtService.sign(payload),
//       user: {
//         userId: user.userId,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//       },
//     };
//   }

//   async register(registerDto: RegisterDto) {
//     const existingUser = await this.usersService.findByEmail(registerDto.email);
//     if (existingUser) {
//       throw new BadRequestException('Email đã được sử dụng');
//     }

//     const hashedPassword = await bcrypt.hash(registerDto.password, 10);
//     const user = await this.usersService.create({
//       fullName: registerDto.fullName,
//       email: registerDto.email,
//       phone: registerDto.phone,
//       role: registerDto.role,
//       passwordHash: hashedPassword,
//       avatar: registerDto.avatar,
//       status: UserStatus.ACTIVE,
//     });

//     const { passwordHash, ...result } = user;
//     return result;
//   }

//   async changePassword(userId: number, oldPassword: string, newPassword: string) {
//     const user = await this.usersService.findOne(String(userId));

//     const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
//     if (!isOldPasswordValid) {
//       throw new BadRequestException('Mật khẩu cũ không đúng');
//     }

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     await this.usersService.update(String(userId), { passwordHash: hashedNewPassword });

//     return { message: 'Đổi mật khẩu thành công' };
//   }
// }
