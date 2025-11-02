import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Elder } from './elder.entity';

@Entity('Family_Elder')
export class FamilyElder {
  @PrimaryColumn({ name: 'family_id' })
  familyId: number;

  @PrimaryColumn({ name: 'elder_id' })
  elderId: number;

  @Column({ name: 'relationship', type: 'nvarchar', length: 50, nullable: true })
  relationship?: string;

  @Column({ name: 'is_primary', type: 'bit', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'family_id', referencedColumnName: 'userId' })
  family: User;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id', referencedColumnName: 'elderId' })
  elder: Elder;
}
