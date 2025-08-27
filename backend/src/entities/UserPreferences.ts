import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 'light' })
  theme: string;

  @Column('simple-array', { name: 'default_apis', default: [] })
  defaultApis: string[];

  @Column({ default: true })
  notifications: boolean;

  @Column({ name: 'auto_save_search', default: true })
  autoSaveSearch: boolean;

  @Column({ name: 'max_search_history', default: 100 })
  maxSearchHistory: number;

  @Column({ name: 'preferred_language', default: 'en' })
  preferredLanguage: string;

  @Column({ name: 'timezone', default: 'UTC' })
  timezone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, user => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
