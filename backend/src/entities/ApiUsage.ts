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

@Entity('api_usage')
@Index(['userId', 'apiName', 'createdAt'])
@Index(['apiName', 'createdAt'])
export class ApiUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'api_name' })
  apiName: string;

  @Column({ name: 'endpoint' })
  endpoint: string;

  @Column({ name: 'request_method', default: 'GET' })
  requestMethod: string;

  @Column({ name: 'response_status' })
  responseStatus: number;

  @Column({ name: 'response_time' })
  responseTime: number;

  @Column({ name: 'request_size', nullable: true })
  requestSize: number;

  @Column({ name: 'response_size', nullable: true })
  responseSize: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  requestBody: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  responseBody: Record<string, any>;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.apiUsage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
