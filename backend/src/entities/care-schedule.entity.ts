import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';
import { CareEvent } from './care-event.entity';

@Entity('CareSchedules')
export class CareSchedule {
  @PrimaryGeneratedColumn({ name: 'schedule_id' })
  scheduleId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  recurrence: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @Column({ type: 'nvarchar', length: 20, default: 'Active' })
  status: string;

  @OneToMany(() => CareEvent, event => event.schedule)
  careEvents: CareEvent[];
}