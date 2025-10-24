import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Elder } from './elder.entity';

@Entity('NutritionProfiles')
export class NutritionProfile {
  @PrimaryGeneratedColumn({ name: 'nutrition_id' })
  nutritionId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ name: 'dietary_restrictions', type: 'nvarchar', length: 255, nullable: true })
  dietaryRestrictions: string;

  @Column({ name: 'favorite_foods', type: 'nvarchar', length: 255, nullable: true })
  favoriteFoods: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;

  @Column({ name: 'last_update', type: 'datetime', default: () => 'GETDATE()' })
  lastUpdate: Date;
}
