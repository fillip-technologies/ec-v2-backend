import { registerAs } from '@nestjs/config';

export interface AppConfig {
  baseUrl: string;
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  jwt: {
    secret: string;
    expiresIn: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password?: string;
    name: string;
    url?: string;
  };
}

export default registerAs('app', (): AppConfig => {
  const host = process.env.DATABASE_HOST || 'localhost';
  const dbPort = parseInt(process.env.DATABASE_PORT || '3306', 10);
  const user = process.env.DATABASE_USER || 'engineers_user';
  const password = process.env.DATABASE_PASSWORD !== undefined ? process.env.DATABASE_PASSWORD : 'password123';
  const name = process.env.DATABASE_NAME || 'engineers_clinic';

  const defaultUrl = password
    ? `mysql://${user}:${encodeURIComponent(password)}@${host}:${dbPort}/${name}`
    : `mysql://${user}@${host}:${dbPort}/${name}`;

  return {
    baseUrl: process.env.BASE_URL || 'http://localhost',
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
    ],
    jwt: {
      secret: process.env.JWT_SECRET || 'engineers_clinic_super_secret_jwt_key_2026',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    database: {
      host,
      port: dbPort,
      user,
      password,
      name,
      url: process.env.DATABASE_URL || defaultUrl,
    },
  };
});
