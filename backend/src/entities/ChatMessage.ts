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

@Entity('chat_messages')
@Index(['userId', 'createdAt'])
@Index(['messageType'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'message_type' })
  messageType: 'user' | 'system' | 'api_response' | 'error';

  @Column()
  content: string;

  @Column({ name: 'command', nullable: true })
  command: string;

  @Column({ name: 'api_name', nullable: true })
  apiName: string;

  @Column({ name: 'response_status', nullable: true })
  responseStatus: number;

  @Column({ name: 'response_time', nullable: true })
  responseTime: number;

  @Column({ name: 'success', default: true })
  success: boolean;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  apiResponse: Record<string, any>;

  @Column({ name: 'pinned', default: false })
  pinned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.chatMessages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
