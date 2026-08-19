import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { loadPrismaAdapter } from '../../src/prisma/prisma-adapter.factory';

const adapter = loadPrismaAdapter();
export const prisma = new PrismaClient({ adapter });

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
