import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException('Tài khoản không hợp lệ');
    }

    // Lấy role từ database user thay vì payload để đảm bảo luôn đúng
    return { 
      userId: user.userId || payload.sub, 
      email: user.email || payload.email, 
      role: user.role, // Lấy role từ database để đảm bảo đúng
      fullName: user.fullName,
    };
  }
}