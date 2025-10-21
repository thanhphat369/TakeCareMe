import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserStatus } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from './mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    // private mailService: MailService, 
    private jwtService: JwtService,
  ) { }

//  private generateActivationCode(): string {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
//   }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại.');
    if (user.status !== UserStatus.ACTIVE)
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt hoặc đã bị khóa.');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Mật khẩu không chính xác.');

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { email: user.email, sub: user.userId, role: user.role };

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
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) throw new BadRequestException('Email đã được sử dụng.');
    
    if (registerDto.phone) {
    const existingUserByPhone = await this.usersService.findByPhone(registerDto.phone);
    if (existingUserByPhone) {
      throw new BadRequestException('Số điện thoại đã được sử dụng.');
    }
  }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // const activationCode = this.generateActivationCode();
    const user = await this.usersService.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: registerDto.phone,
      role: registerDto.role,
      passwordHash: hashedPassword,
      avatar: registerDto.avatar,
      status: UserStatus.INACTIVE,
      // activationCode,
    });
    
    // await this.mailService.sendActivationCode(user.email, user.fullName, activationCode);
    return { message: 'Đăng ký thành công. Vui lòng kích hoạt tài khoản.', user };
  }


//   async activateAccount(code: string) {
//   // Tìm user có mã kích hoạt tương ứng
//   const user = await this.usersService.findByActivationCode(code);
//   if (!user) {
//     throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn.');
//   }

//   // Nếu tài khoản đã kích hoạt rồi
//   if (user.status === UserStatus.ACTIVE) {
//     throw new BadRequestException('Tài khoản đã được kích hoạt.');
//   }

//   // Cập nhật trạng thái
//   await this.usersService.update(user.userId, {
//     status: UserStatus.ACTIVE,
//     activationCode: null,
//   });

//   // Gửi email xác nhận đã kích hoạt thành công
//   await this.mailService.sendActivationSuccess(user.email, user.fullName);

//   return { message: 'Tài khoản đã được kích hoạt thành công.' };
// }


  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(String(userId));
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản.');

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(String(userId), { passwordHash: hashedNewPassword });

    return { message: 'Đổi mật khẩu thành công' };
  }
}