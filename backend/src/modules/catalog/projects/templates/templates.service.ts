import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateWorkspaceTemplateDto } from './dto/create-workspace-template.dto';
import { CreateTemplateTaskDto } from './dto/create-template-task.dto';
import { UpdateTemplateTaskDto } from './dto/update-template-task.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get full WorkspaceTemplate by Project ID
   */
  async findTemplateByProjectId(projectId: number) {
    const template = await this.prisma.workspaceTemplate.findUnique({
      where: { projectId },
      include: {
        project: true,
        tasks: {
          orderBy: { orderIndex: 'asc' },
          include: {
            resources: true,
            rubric: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Workspace template for Project ID ${projectId} not found`);
    }

    return template;
  }

  /**
   * Create or update WorkspaceTemplate for a Project
   */
  async createOrUpdateTemplate(dto: CreateWorkspaceTemplateDto) {
    if (!dto.projectId) {
      throw new BadRequestException('Project ID is required');
    }
    const projectId = dto.projectId;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ID ${projectId} not found`);
    }

    return this.prisma.workspaceTemplate.upsert({
      where: { projectId },
      update: {
        ...(dto.version ? { version: dto.version } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      create: {
        projectId,
        version: dto.version || 1,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        project: true,
        tasks: {
          include: {
            resources: true,
            rubric: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new TemplateTask
   */
  async createTask(dto: CreateTemplateTaskDto) {
    const template = await this.prisma.workspaceTemplate.findUnique({
      where: { id: dto.workspaceTemplateId },
    });
    if (!template) {
      throw new NotFoundException(`WorkspaceTemplate ID ${dto.workspaceTemplateId} not found`);
    }

    return this.prisma.templateTask.create({
      data: {
        workspaceTemplateId: dto.workspaceTemplateId,
        orderIndex: dto.orderIndex,
        title: dto.title.trim(),
        description: dto.description?.trim(),
      },
      include: {
        resources: true,
      },
    });
  }

  /**
   * Update an existing TemplateTask
   */
  async updateTask(id: number, dto: UpdateTemplateTaskDto) {
    const task = await this.prisma.templateTask.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`TemplateTask ID ${id} not found`);
    }

    return this.prisma.templateTask.update({
      where: { id },
      data: {
        ...(dto.orderIndex ? { orderIndex: dto.orderIndex } : {}),
        ...(dto.title ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
      },
      include: {
        resources: true,
      },
    });
  }

  /**
   * Delete a TemplateTask by ID
   */
  async removeTask(id: number) {
    const task = await this.prisma.templateTask.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`TemplateTask ID ${id} not found`);
    }

    await this.prisma.templateTask.delete({ where: { id } });
    return { message: `TemplateTask ID ${id} deleted successfully` };
  }
}
