import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';

@Entity('Devices')
export class Device {
  @PrimaryGeneratedColumn({ name: 'device_id' })
  deviceId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.devices)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  type: string;

  @Column({ name: 'last_seen', type: 'datetime', nullable: true })
  lastSeen: Date;

  @Column({ name: 'pairing_token', type: 'nvarchar', length: 255, nullable: true })
  pairingToken: string;

  @Column({ type: 'nvarchar', length: 20, default: 'Active' })
  status: string;
}