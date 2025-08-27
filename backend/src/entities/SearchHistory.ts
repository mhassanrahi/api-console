import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('search_history')
@Index(['userId', 'createdAt'])
@Index(['query'])
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  query: string;

  @Column({ nullable: true })
  api: string;

  @Column({ name: 'result_count', nullable: true })
  resultCount: number;

  @Column({ name: 'execution_time', nullable: true })
  executionTime: number;

  @Column({ name: 'success', default: true })
  success: boolean;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.searchHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
