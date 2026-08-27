import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const prisma = new PrismaClient();

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
