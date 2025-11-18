import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Elder } from './elder.entity';

@Entity('RehabilitationRecords')
export class RehabilitationRecord {
  @PrimaryGeneratedColumn({ name: 'rehab_id' })
  rehabId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'start_date', type: 'datetime', nullable: true })
  startDate: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  status: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;
}