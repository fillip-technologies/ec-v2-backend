import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all topics with parent cluster
   */
  async findAll() {
    return this.prisma.topic.findMany({
      include: {
        cluster: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Create a new Topic
   */
  async create(dto: CreateTopicDto) {
    const slug = dto.slug.toLowerCase().trim();
    const existing = await this.prisma.topic.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Topic slug '${slug}' already exists`);
    }

    const cluster = await this.prisma.cluster.findUnique({ where: { id: dto.clusterId } });
    if (!cluster) {
      throw new NotFoundException(`Cluster ID ${dto.clusterId} not found`);
    }

    return this.prisma.topic.create({
      data: {
        clusterId: dto.clusterId,
        slug,
        name: dto.name.trim(),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        cluster: true,
      },
    });
  }

  /**
   * Update an existing Topic
   */
  async update(id: number, dto: UpdateTopicDto) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic ID ${id} not found`);
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== topic.slug) {
      const slug = dto.slug.toLowerCase().trim();
      const existing = await this.prisma.topic.findUnique({ where: { slug } });
      if (existing) {
        throw new BadRequestException(`Topic slug '${slug}' already exists`);
      }
    }

    if (dto.clusterId) {
      const cluster = await this.prisma.cluster.findUnique({ where: { id: dto.clusterId } });
      if (!cluster) {
        throw new NotFoundException(`Cluster ID ${dto.clusterId} not found`);
      }
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        ...(dto.clusterId ? { clusterId: dto.clusterId } : {}),
        ...(dto.slug ? { slug: dto.slug.toLowerCase().trim() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        cluster: true,
      },
    });
  }

  /**
   * Delete a Topic by ID
   */
  async remove(id: number) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic ID ${id} not found`);
    }

    await this.prisma.topic.delete({ where: { id } });
    return { message: `Topic ID ${id} deleted successfully` };
  }
}
