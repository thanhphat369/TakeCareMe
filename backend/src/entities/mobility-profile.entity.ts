import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Elder } from './elder.entity';

@Entity('MobilityProfiles')
export class MobilityProfile {
  @PrimaryGeneratedColumn({ name: 'mobility_id' })
  mobilityId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'mobility_level', type: 'nvarchar', length: 50, nullable: true })
  mobilityLevel: string;

  @Column({ name: 'assistive_device', type: 'nvarchar', length: 100, nullable: true })
  assistiveDevice: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @UpdateDateColumn({ name: 'last_update', type: 'datetime', default: () => 'GETDATE()' })
  lastUpdate: Date;
}