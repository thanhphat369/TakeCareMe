import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('VitalReadings')
export class VitalReading {
  @PrimaryGeneratedColumn({ name: 'vital_id' })
  vitalId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.vitalReadings)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'float', nullable: true })
  value: number;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  unit: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  timestamp: Date;

  @Column({ name: 'recorded_by', nullable: true })
  recordedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by' })
  recorder: User;

  @Column({ type: 'nvarchar', length: 20, default: 'Manual' })
  source: string;
}