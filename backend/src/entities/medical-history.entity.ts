import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('MedicalHistory')
export class MedicalHistory {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  historyId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @OneToOne(() => Elder, elder => elder.medicalHistory)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  diagnoses: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  allergies: string;

  @Column({ name: 'chronic_medications', type: 'nvarchar', length: 'MAX', nullable: true })
  chronicMedications: string;

  @Column({ name: 'last_update', type: 'datetime', default: () => 'GETDATE()' })
  lastUpdate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @Column({ type: 'float', nullable: true })
  bmi?: number;
}