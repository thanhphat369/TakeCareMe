import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string | number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userId: Number(id) },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string) {
    return this.userRepository.findOne({ where: { phone } });
  }

  // async findByActivationCode(code: string) {
  //   return this.userRepository.findOne({ where: { activationCode: code } });
  // }
  async update(id: string | number, userData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId: Number(id) } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async remove(id: string | number): Promise<void> {
    await this.userRepository.delete({ userId: Number(id) });
  }
}