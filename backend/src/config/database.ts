import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { UserPreferences } from '../entities/UserPreferences';
import { SearchHistory } from '../entities/SearchHistory';
import { ApiUsage } from '../entities/ApiUsage';

import { ChatMessage } from '../entities/ChatMessage';

// Database configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'helloworld',
  database: process.env.DB_NAME || 'knowlix',
  type: process.env.DB_TYPE || 'postgres',
};

// TypeORM DataSource configuration
export const AppDataSource = new DataSource({
  type: dbConfig.type as 'postgres' | 'mysql' | 'sqlite',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, UserPreferences, SearchHistory, ApiUsage, ChatMessage],
  subscribers: [],
  migrations: [],
});

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
};
