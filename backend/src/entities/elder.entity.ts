import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { MedicalHistory } from './medical-history.entity';
import { VitalReading } from './vital-reading.entity';
import { Medication } from './medication.entity';
import { Alert } from './alert.entity';
import { CareEvent } from './care-event.entity';
import { Device } from './device.entity';
import { Prescription } from './prescription.entity';

@Entity('Elders')
export class Elder {
  @PrimaryGeneratedColumn({ name: 'elder_id' })
  elderId: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'full_name', type: 'nvarchar', length: 100 })
  fullName: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'int', nullable: true })
  age: Date;
  
  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'char', length: 1, nullable: true })
  gender: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  address: string;

  @Column({ name: 'contact_person_id', nullable: true })
  contactPersonId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contact_person_id' })
  contactPerson: User;

  @Column({ type: 'nvarchar', length: 20, default: 'Active' })
  status: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => MedicalHistory, history => history.elder)
  medicalHistory: MedicalHistory;

  @OneToMany(() => VitalReading, reading => reading.elder)
  vitalReadings: VitalReading[];

  @OneToMany(() => Medication, med => med.elder)
  medications: Medication[];

  @OneToMany(() => Alert, alert => alert.elder)
  alerts: Alert[];

  @OneToMany(() => CareEvent, event => event.elder)
  careEvents: CareEvent[];

  @OneToMany(() => Device, device => device.elder)
  devices: Device[];

  @OneToMany(() => Prescription, prescription => prescription.elder)
  prescriptions: Prescription[];
}
