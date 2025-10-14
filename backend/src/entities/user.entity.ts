import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Staff } from './staff.entity';
import { Elder } from './elder.entity';

export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  STAFF = 'Staff',
  FAMILY = 'Family',
  ELDER = 'Elder',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  BANNED = 'Banned',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'full_name', type: 'nvarchar', length: 100 })
  fullName: string;

  @Column({ type: 'nvarchar', length: 30 })
  role: UserRole;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'nvarchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'nvarchar', length: 20, default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @OneToMany(() => Staff, (staff) => staff.user)
  staffs: Staff[];

  @OneToOne(() => Elder, elder => elder.user)
  elder: Elder;
}