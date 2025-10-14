import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('Reports')
export class Report {
  @PrimaryGeneratedColumn({ name: 'report_id' })
  reportId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  period: string;

  @Column({ name: 'generated_by', nullable: true })
  generatedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by' })
  generator: User;

  @Column({ name: 'generated_at', type: 'datetime', default: () => 'GETDATE()' })
  generatedAt: Date;

  @Column({ name: 'file_url', type: 'nvarchar', length: 255, nullable: true })
  fileUrl: string;
}
