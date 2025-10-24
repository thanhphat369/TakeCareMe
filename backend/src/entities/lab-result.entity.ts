import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Elder } from './elder.entity';

@Entity('LabResults')
export class LabResult {
  @PrimaryGeneratedColumn({ name: 'result_id' })
  resultId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'test_date', type: 'datetime', nullable: true })
  testDate: Date;

  @Column({ name: 'test_type', type: 'nvarchar', length: 100, nullable: true })
  testType: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  result: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;
}
