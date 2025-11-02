import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyMembersController } from './family-members.controller';
import { FamilyMembersService } from './family-members.service';
import { User } from '../../entities/user.entity';
import { Elder } from '../../entities/elder.entity';
import { FamilyElder } from '../../entities/family-elder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Elder, FamilyElder])],
  controllers: [FamilyMembersController],
  providers: [FamilyMembersService],
})
export class FamilyMembersModule {}
