import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';

@Injectable()
export class ClustersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all clusters with their active topics
   */
  async findAll() {
    return this.prisma.cluster.findMany({
      include: {
        topics: {
          where: { isActive: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Create a new Cluster
   */
  async create(dto: CreateClusterDto) {
    const slug = dto.slug.toLowerCase().trim();
    const existing = await this.prisma.cluster.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Cluster slug '${slug}' already exists`);
    }

    return this.prisma.cluster.create({
      data: {
        slug,
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  /**
   * Update an existing Cluster
   */
  async update(id: number, dto: UpdateClusterDto) {
    const cluster = await this.prisma.cluster.findUnique({ where: { id } });
    if (!cluster) {
      throw new NotFoundException(`Cluster ID ${id} not found`);
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== cluster.slug) {
      const slug = dto.slug.toLowerCase().trim();
      const existing = await this.prisma.cluster.findUnique({ where: { slug } });
      if (existing) {
        throw new BadRequestException(`Cluster slug '${slug}' already exists`);
      }
    }

    return this.prisma.cluster.update({
      where: { id },
      data: {
        ...(dto.slug ? { slug: dto.slug.toLowerCase().trim() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
      },
    });
  }

  /**
   * Delete a Cluster by ID
   */
  async remove(id: number) {
    const cluster = await this.prisma.cluster.findUnique({ where: { id } });
    if (!cluster) {
      throw new NotFoundException(`Cluster ID ${id} not found`);
    }

    await this.prisma.cluster.delete({ where: { id } });
    return { message: `Cluster ID ${id} deleted successfully` };
  }
}
