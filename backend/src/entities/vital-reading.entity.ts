import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('VitalReadings')
export class VitalReading {
  @PrimaryGeneratedColumn({ name: 'record_id' })
  recordId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.vitalReadings)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 20, default: 'Manual' })
  source: string;

  @Column({ name: 'recorded_by', nullable: true })
  recordedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by' })
  recorder: User;

  // Blood pressure
  @Column({ type: 'float', nullable: true })
  systolic: number;  // Huyết áp tâm thu (mmHg)

  @Column({ type: 'float', nullable: true })
  diastolic: number; // Huyết áp tâm trương (mmHg)

  // Other vital signs
  @Column({ name: 'heart_rate', type: 'float', nullable: true })
  heartRate: number; // Nhịp tim (bpm)

  @Column({ type: 'float', nullable: true })
  temperature: number; // Nhiệt độ (°C)

  @Column({ type: 'float', nullable: true })
  spo2: number; // SpO2 (%)

  @Column({ name: 'blood_glucose', type: 'float', nullable: true })
  bloodGlucose: number; // Đường huyết (mg/dL)

  @Column({ type: 'float', nullable: true })
  weight: number; // Cân nặng (kg)

  @Column({ type: 'float', nullable: true })
  height: number; // Chiều cao (cm)

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string; // Ghi chú

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  timestamp: Date;
}
