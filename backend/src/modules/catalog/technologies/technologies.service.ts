import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

@Injectable()
export class TechnologiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active technologies
   */
  async findAll() {
    return this.prisma.technology.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Create a new Technology
   */
  async create(dto: CreateTechnologyDto) {
    const slug = dto.slug.toLowerCase().trim();
    const existing = await this.prisma.technology.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Technology slug '${slug}' already exists`);
    }

    return this.prisma.technology.create({
      data: {
        slug,
        name: dto.name.trim(),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  /**
   * Update an existing Technology
   */
  async update(id: number, dto: UpdateTechnologyDto) {
    const tech = await this.prisma.technology.findUnique({ where: { id } });
    if (!tech) {
      throw new NotFoundException(`Technology ID ${id} not found`);
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== tech.slug) {
      const slug = dto.slug.toLowerCase().trim();
      const existing = await this.prisma.technology.findUnique({ where: { slug } });
      if (existing) {
        throw new BadRequestException(`Technology slug '${slug}' already exists`);
      }
    }

    return this.prisma.technology.update({
      where: { id },
      data: {
        ...(dto.slug ? { slug: dto.slug.toLowerCase().trim() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  /**
   * Delete a Technology by ID
   */
  async remove(id: number) {
    const tech = await this.prisma.technology.findUnique({ where: { id } });
    if (!tech) {
      throw new NotFoundException(`Technology ID ${id} not found`);
    }

    await this.prisma.technology.delete({ where: { id } });
    return { message: `Technology ID ${id} deleted successfully` };
  }
}
