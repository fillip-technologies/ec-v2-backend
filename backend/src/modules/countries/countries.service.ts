import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active countries with ISO code, name, and currencyCode
   */
  async findAll() {
    return this.prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
