import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Elder } from './elder.entity';

@Entity('Shifts')
export class Shift {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  shiftId: number;

  @Column({ name: 'staff_id' })
  staffId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  note: string;

  @Column({ type: 'nvarchar', length: 20, default: 'Scheduled' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Elder)
  @JoinTable({
    name: 'Shift_Elder',
    joinColumn: { name: 'shift_id', referencedColumnName: 'shiftId' },
    inverseJoinColumn: { name: 'elder_id', referencedColumnName: 'elderId' }
  })
  elders: Elder[];
}