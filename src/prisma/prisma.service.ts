import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const user = process.env.DATABASE_USER || 'engineers_user';
    const rawPassword =
      process.env.DATABASE_PASSWORD !== undefined ? process.env.DATABASE_PASSWORD : 'password123';
    const password = rawPassword ? encodeURIComponent(rawPassword) : '';
    const host = process.env.DATABASE_HOST || 'localhost';
    const port = process.env.DATABASE_PORT || '3306';
    const database = process.env.DATABASE_NAME || 'engineers_clinic';

    const connectionString = password
      ? `mysql://${user}:${password}@${host}:${port}/${database}`
      : `mysql://${user}@${host}:${port}/${database}`;

    const adapter = new PrismaMariaDb(connectionString);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
