import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('Medications')
export class Medication {
  @PrimaryGeneratedColumn({ name: 'medication_id' })
  medicationId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.medications)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  dose: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  frequency: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  time: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  diagnosis: string;

  @Column({ name: 'prescribed_by', nullable: true })
  prescribedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribed_by' })
  prescriber: User;
}