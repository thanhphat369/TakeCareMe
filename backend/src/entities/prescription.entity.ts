import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';
import { Medication } from './medication.entity';

@Entity('Prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn({ name: 'prescription_id' })
  prescriptionId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.prescriptions)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'prescribed_by' })
  prescribedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribed_by' })
  prescriber: User;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  diagnosis: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  notes: string;

  @Column({ name: 'prescription_date' })
  prescriptionDate: Date;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ type: 'nvarchar', length: 50, default: 'active' })
  status: string; // active, completed, cancelled

  @OneToMany(() => Medication, medication => medication.prescription)
  medications: Medication[];
}

