import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all projects with optional programId filter
   */
  async findAll(programId?: number) {
    return this.prisma.project.findMany({
      where: {
        ...(programId ? { programId } : {}),
      },
      include: {
        program: true,
        workspaceTemplate: {
          include: {
            tasks: {
              include: {
                rubric: true,
                resources: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        resources: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * Get single project details by ID
   */
  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        program: true,
        workspaceTemplate: {
          include: {
            tasks: {
              include: {
                rubric: true,
                resources: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        resources: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ID ${id} not found`);
    }

    return project;
  }

  /**
   * Create a new Project
   */
  async create(dto: CreateProjectDto) {
    const program = await this.prisma.program.findUnique({ where: { id: dto.programId } });
    if (!program) {
      throw new NotFoundException(`Program ID ${dto.programId} not found`);
    }

    return this.prisma.project.create({
      data: {
        programId: dto.programId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        orderIndex: dto.orderIndex,
      },
      include: {
        program: true,
      },
    });
  }

  /**
   * Update an existing Project
   */
  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ID ${id} not found`);
    }

    if (dto.programId) {
      const program = await this.prisma.program.findUnique({ where: { id: dto.programId } });
      if (!program) {
        throw new NotFoundException(`Program ID ${dto.programId} not found`);
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.programId ? { programId: dto.programId } : {}),
        ...(dto.title ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
        ...(dto.orderIndex ? { orderIndex: dto.orderIndex } : {}),
      },
      include: {
        program: true,
        workspaceTemplate: true,
      },
    });
  }

  /**
   * Delete a Project by ID
   */
  async remove(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ID ${id} not found`);
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: `Project ID ${id} deleted successfully` };
  }
}
