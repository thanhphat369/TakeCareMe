import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('Appointments')
export class Appointment {
  @PrimaryGeneratedColumn({ name: 'appointment_id' })
  appointmentId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'doctor_id', nullable: true })
  doctorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'nurse_id', nullable: true })
  nurseId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'nurse_id' })
  nurse: User;

  @Column({ name: 'care_type', type: 'nvarchar', length: 20, nullable: true })
  careType: string;

  @Column({ name: 'visit_date', type: 'datetime', nullable: true })
  visitDate: string;

  @Column({ name: 'next_visit_date', type: 'datetime', nullable: true })
  nextVisitDate: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @Column({ type: 'nvarchar', length: 20, default: 'Completed' })
  status: string;
}
