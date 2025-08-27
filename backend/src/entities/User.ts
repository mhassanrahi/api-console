import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { UserPreferences } from './UserPreferences';
import { SearchHistory } from './SearchHistory';
import { ApiUsage } from './ApiUsage';
import { ChatMessage } from './ChatMessage';

@Entity('users')
@Index(['cognitoId'], { unique: true })
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Cognito Integration Fields
  @Column({ name: 'cognito_id', unique: true })
  cognitoId: string;

  @Column({ name: 'cognito_username', unique: true, nullable: true })
  cognitoUsername: string;

  // Basic User Information (synced from Cognito)
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  // Application-specific fields
  @Column({ default: true })
  active: boolean;

  @Column({ name: 'account_status', default: 'active' })
  accountStatus: 'active' | 'suspended' | 'deleted';

  @Column({ name: 'user_type', default: 'standard' })
  userType: 'standard' | 'premium' | 'admin';

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  @Column({ name: 'timezone', default: 'UTC' })
  timezone: string;

  @Column({ name: 'locale', default: 'en-US' })
  locale: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'bio', nullable: true, type: 'text' })
  bio: string;

  @Column({ name: 'website', nullable: true })
  website: string;

  @Column({ name: 'location', nullable: true })
  location: string;

  @Column({ name: 'company', nullable: true })
  company: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'cognito_attributes', type: 'jsonb', nullable: true })
  cognitoAttributes: Record<string, any>;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => UserPreferences, preferences => preferences.user, {
    cascade: true,
  })
  preferences: UserPreferences;

  @OneToMany(() => SearchHistory, search => search.user, {
    cascade: true,
  })
  searchHistory: SearchHistory[];

  @OneToMany(() => ApiUsage, usage => usage.user, {
    cascade: true,
  })
  apiUsage: ApiUsage[];

  @OneToMany(() => ChatMessage, message => message.user, {
    cascade: true,
  })
  chatMessages: ChatMessage[];

  // Helper methods
  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.username || this.email;
  }

  getDisplayName(): string {
    return this.username || this.getFullName();
  }

  isPremium(): boolean {
    return this.userType === 'premium';
  }

  isAdmin(): boolean {
    return this.userType === 'admin';
  }

  canAccess(): boolean {
    return this.active && this.accountStatus === 'active';
  }
}
