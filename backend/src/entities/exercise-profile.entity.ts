import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Elder } from './elder.entity';

@Entity('ExerciseProfiles')
export class ExerciseProfile {
  @PrimaryGeneratedColumn({ name: 'exercise_id' })
  exerciseId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'exercise_type', type: 'nvarchar', length: 100, nullable: true })
  exerciseType: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  frequency: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @UpdateDateColumn({ name: 'last_update', type: 'datetime', default: () => 'GETDATE()' })
  lastUpdate: Date;
}