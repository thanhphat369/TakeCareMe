import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';

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
}