import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export type SupportedDatabaseAdapter = 'mariadb' | 'mysql' | 'pg' | 'postgres' | 'postgresql';

/**
 * Resolves the configured database adapter name from environment variables
 */
export function getDatabaseAdapterName(): string {
  return (process.env.DATABASE_ADAPTER || 'mariadb').toLowerCase().trim();
}

/**
 * Constructs a standard database connection URL for mysql or postgresql protocols
 */
export function buildConnectionUrl(protocol: 'mysql' | 'postgresql'): string {
  const user = process.env.DATABASE_USER || 'engineers_user';
  const rawPassword =
    process.env.DATABASE_PASSWORD !== undefined ? process.env.DATABASE_PASSWORD : 'password123';
  const password = rawPassword ? encodeURIComponent(rawPassword) : '';
  const host = process.env.DATABASE_HOST || 'localhost';
  const port =
    process.env.DATABASE_PORT || (protocol === 'postgresql' ? '5432' : '3306');
  const database = process.env.DATABASE_NAME || 'engineers_clinic';

  const poolParams = protocol === 'mysql' ? 'connectionLimit=20' : 'connection_limit=20';

  return password
    ? `${protocol}://${user}:${password}@${host}:${port}/${database}?${poolParams}`
    : `${protocol}://${user}@${host}:${port}/${database}?${poolParams}`;
}

/**
 * Factory that loads and instantiates the appropriate Prisma SqlDriverAdapter
 * based on the configured DATABASE_ADAPTER environment variable.
 */
export function loadPrismaAdapter(): any {
  const adapterName = getDatabaseAdapterName();

  switch (adapterName) {
    case 'mariadb': {
      const connectionString = buildConnectionUrl('mysql');
      return new PrismaMariaDb(connectionString);
    }

    case 'mysql': {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaMysql } = require('@prisma/adapter-mysql');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mysql2 = require('mysql2');
        const connectionString = buildConnectionUrl('mysql');
        const pool = new mysql2.Pool({ connectionString });
        return new PrismaMysql(pool);
      } catch (err: any) {
        if (
          err?.code === 'MODULE_NOT_FOUND' ||
          err?.message?.includes('Cannot find module')
        ) {
          throw new Error(
            "To use the 'mysql' database adapter, please install the required packages:\n  npm i @prisma/adapter-mysql mysql2",
          );
        }
        throw err;
      }
    }

    case 'pg':
    case 'postgres':
    case 'postgresql': {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaPg } = require('@prisma/adapter-pg');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Pool } = require('pg');
        const connectionString = buildConnectionUrl('postgresql');
        const pool = new Pool({ connectionString });
        return new PrismaPg(pool);
      } catch (err: any) {
        if (
          err?.code === 'MODULE_NOT_FOUND' ||
          err?.message?.includes('Cannot find module')
        ) {
          throw new Error(
            "To use the 'pg' (PostgreSQL) database adapter, please install the required packages:\n  npm i @prisma/adapter-pg pg",
          );
        }
        throw err;
      }
    }

    default: {
      throw new Error(
        `Unknown DATABASE_ADAPTER '${adapterName}'. Supported adapters are: 'mariadb', 'mysql', 'pg' (or 'postgresql').`,
      );
    }
  }
}
