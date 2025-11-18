import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum StaffShift {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  FLEXIBLE = 'flexible',
}

export enum StaffStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ON_LEAVE = 'OnLeave',
}

@Entity('Staff')
export class Staff {
  @PrimaryGeneratedColumn({ name: 'staff_id' })
  staffId: number;

  @Column({ name: 'user_id' })
  userId: number;

 @ManyToOne(() => User, (user) => user.staffs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'role_title', type: 'nvarchar', length: 50 })
  roleTitle: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'license_no', type: 'nvarchar', length: 50, nullable: true })
  licenseNo: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  skills: string;

  @Column({ name: 'experience_years', type: 'int', default: 0 })
  experienceYears: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  education: string;

  @Column({ 
    type: 'nvarchar', 
    length: 30, 
    default: StaffShift.MORNING 
  })
  shift: StaffShift;

  @Column({ 
    type: 'nvarchar', 
    length: 20, 
    default: StaffStatus.ACTIVE 
  })
  status: StaffStatus;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}