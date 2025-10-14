import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';
import { CareSchedule } from './care-schedule.entity';

@Entity('CareEvents')
export class CareEvent {
  @PrimaryGeneratedColumn({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.careEvents)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'schedule_id', nullable: true })
  scheduleId: number;

  @ManyToOne(() => CareSchedule, schedule => schedule.careEvents)
  @JoinColumn({ name: 'schedule_id' })
  schedule: CareSchedule;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  timestamp: Date;

  @Column({ name: 'performed_by', nullable: true })
  performedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  attachments: string;
}