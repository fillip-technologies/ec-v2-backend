import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateProgramPricingDto } from './dto/create-program-pricing.dto';
import { UpdateProgramPricingDto } from './dto/update-program-pricing.dto';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper include block for nested Program -> Projects -> WorkspaceTemplate -> Steps -> Tasks & Resources + Testimonials & FAQs
   */
  private get programNestedInclude() {
    return {
      country: true,
      topics: {
        include: {
          topic: {
            include: {
              cluster: true,
            },
          },
        },
      },
      technologies: {
        include: {
          technology: true,
        },
      },
      pricings: {
        include: {
          country: true,
        },
      },
      testimonials: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' as const },
      },
      faqs: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' as const },
      },
      projects: {
        orderBy: { orderIndex: 'asc' as const },
        include: {
          resources: true,
          workspaceTemplate: {
            include: {
              tasks: {
                orderBy: { orderIndex: 'asc' as const },
                include: {
                  resources: true,
                  rubric: true,
                },
              },
            },
          },
        },
      },
    };
  }

  /**
   * Get all programs with optional filtering by countryId, topicId, technologyId, status
   */
  async findAll(countryId?: number, topicId?: number, technologyId?: number, status?: string) {
    return this.prisma.program.findMany({
      where: {
        ...(countryId ? { countryId } : {}),
        ...(status ? { status } : {}),
        ...(topicId
          ? {
              topics: {
                some: { topicId },
              },
            }
          : {}),
        ...(technologyId
          ? {
              technologies: {
                some: { technologyId },
              },
            }
          : {}),
      },
      include: this.programNestedInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a single program by ID or unique slug
   */
  async findByIdOrSlug(idOrSlug: string) {
    const numId = Number(idOrSlug);
    const isNumeric = !isNaN(numId);

    const program = await this.prisma.program.findFirst({
      where: isNumeric ? { id: numId } : { slug: idOrSlug },
      include: this.programNestedInclude,
    });

    if (!program) {
      throw new NotFoundException(`Program with identifier '${idOrSlug}' was not found`);
    }

    return program;
  }

  /**
   * Create a new Program with outcomes, linked topics, technologies, and optional pricings
   */
  async create(dto: CreateProgramDto) {
    const slug = dto.slug.toLowerCase().trim();
    const existing = await this.prisma.program.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Program slug '${slug}' already exists`);
    }

    const country = await this.prisma.country.findUnique({ where: { id: dto.countryId } });
    if (!country) {
      throw new NotFoundException(`Country ID ${dto.countryId} not found`);
    }

    return this.prisma.program.create({
      data: {
        countryId: dto.countryId,
        title: dto.title.trim(),
        slug,
        description: dto.description?.trim(),
        outcomes: dto.outcomes?.trim(),
        durationHours: dto.durationHours,
        status: dto.status?.toLowerCase().trim() || 'draft',
        ...(dto.topicIds && dto.topicIds.length > 0
          ? {
              topics: {
                create: dto.topicIds.map((topicId) => ({
                  topicId,
                })),
              },
            }
          : {}),
        ...(dto.technologyIds && dto.technologyIds.length > 0
          ? {
              technologies: {
                create: dto.technologyIds.map((technologyId) => ({
                  technologyId,
                })),
              },
            }
          : {}),
        ...(dto.pricings && dto.pricings.length > 0
          ? {
              pricings: {
                create: dto.pricings.map((p) => ({
                  countryId: p.countryId,
                  currency: p.currency.toUpperCase().trim(),
                  amount: p.amount,
                  isActive: p.isActive !== undefined ? p.isActive : true,
                  validFrom: p.validFrom ? new Date(p.validFrom) : null,
                  validUntil: p.validUntil ? new Date(p.validUntil) : null,
                })),
              },
            }
          : {}),
        ...(dto.testimonials && dto.testimonials.length > 0
          ? {
              testimonials: {
                create: dto.testimonials.map((t, idx) => ({
                  authorName: t.authorName.trim(),
                  authorRole: t.authorRole?.trim() || null,
                  quote: t.quote.trim(),
                  rating: t.rating ? Number(t.rating) : 5,
                  avatarUrl: t.avatarUrl?.trim() || null,
                  orderIndex: t.orderIndex !== undefined ? t.orderIndex : idx,
                  isActive: t.isActive !== undefined ? t.isActive : true,
                })),
              },
            }
          : {}),
        ...(dto.faqs && dto.faqs.length > 0
          ? {
              faqs: {
                create: dto.faqs.map((f, idx) => ({
                  question: f.question.trim(),
                  answer: f.answer.trim(),
                  orderIndex: f.orderIndex !== undefined ? f.orderIndex : idx,
                  isActive: f.isActive !== undefined ? f.isActive : true,
                })),
              },
            }
          : {}),
        ...(dto.projects && dto.projects.length > 0
          ? {
              projects: {
                create: dto.projects.map((proj, pIdx) => ({
                  title: proj.title.trim(),
                  description: proj.description?.trim() || null,
                  orderIndex: proj.orderIndex !== undefined ? proj.orderIndex : pIdx,
                  ...(proj.resources && proj.resources.length > 0
                    ? {
                        resources: {
                          create: proj.resources.map((r) => ({
                            ownerType: 'PROJECT' as const,
                            type: r.type || 'DOCUMENTATION',
                            title: r.title.trim(),
                            url: r.url.trim(),
                          })),
                        },
                      }
                    : {}),
                  ...(proj.workspaceTemplate
                    ? {
                        workspaceTemplate: {
                          create: {
                            version: proj.workspaceTemplate.version || 1,
                            isActive:
                              proj.workspaceTemplate.isActive !== undefined
                                ? proj.workspaceTemplate.isActive
                                : true,
                            ...(proj.workspaceTemplate.tasks && proj.workspaceTemplate.tasks.length > 0
                              ? {
                                  tasks: {
                                    create: proj.workspaceTemplate.tasks.map((task, tIdx) => ({
                                      title: task.title.trim(),
                                      description: task.description?.trim() || null,
                                      orderIndex: task.orderIndex !== undefined ? task.orderIndex : tIdx,
                                      ...(task.rubric
                                        ? {
                                            rubric: {
                                              create: {
                                                maxScore: task.rubric.maxScore || 100,
                                                passThreshold: task.rubric.passThreshold || 60,
                                                criteria: task.rubric.criteria || [
                                                  { criterion: 'Implementation & Requirements', maxScore: 50 },
                                                  { criterion: 'Code Quality & Best Practices', maxScore: 30 },
                                                  { criterion: 'Documentation & Testing', maxScore: 20 },
                                                ],
                                              },
                                            },
                                          }
                                        : {}),
                                      ...(task.resources && task.resources.length > 0
                                        ? {
                                            resources: {
                                              create: task.resources.map((r) => ({
                                                ownerType: 'TASK' as const,
                                                type: r.type || 'LINK',
                                                title: r.title.trim(),
                                                url: r.url.trim(),
                                              })),
                                            },
                                          }
                                        : {}),
                                    })),
                                  },
                                }
                              : {}),
                          },
                        },
                      }
                    : {}),
                })),
              },
            }
          : {}),
      },
      include: this.programNestedInclude,
    });
  }

  /**
   * Update an existing Program including outcomes
   */
  async update(id: number, dto: UpdateProgramDto) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Program ID ${id} not found`);
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== program.slug) {
      const slug = dto.slug.toLowerCase().trim();
      const existing = await this.prisma.program.findUnique({ where: { slug } });
      if (existing) {
        throw new BadRequestException(`Program slug '${slug}' already exists`);
      }
    }

    if (dto.countryId) {
      const country = await this.prisma.country.findUnique({ where: { id: dto.countryId } });
      if (!country) {
        throw new NotFoundException(`Country ID ${dto.countryId} not found`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-link topics if provided
      if (dto.topicIds !== undefined) {
        await tx.programTopic.deleteMany({ where: { programId: id } });
        if (dto.topicIds.length > 0) {
          await tx.programTopic.createMany({
            data: dto.topicIds.map((topicId) => ({ programId: id, topicId })),
          });
        }
      }

      // Re-link technologies if provided
      if (dto.technologyIds !== undefined) {
        await tx.programTechnology.deleteMany({ where: { programId: id } });
        if (dto.technologyIds.length > 0) {
          await tx.programTechnology.createMany({
            data: dto.technologyIds.map((technologyId) => ({ programId: id, technologyId })),
          });
        }
      }

      // Re-link pricings if provided
      if (dto.pricings !== undefined) {
        await tx.programPricing.deleteMany({ where: { programId: id } });
        if (dto.pricings.length > 0) {
          await tx.programPricing.createMany({
            data: dto.pricings.map((p) => ({
              programId: id,
              countryId: p.countryId,
              currency: p.currency.toUpperCase().trim(),
              amount: p.amount,
              isActive: p.isActive !== undefined ? p.isActive : true,
              validFrom: p.validFrom ? new Date(p.validFrom) : null,
              validUntil: p.validUntil ? new Date(p.validUntil) : null,
            })),
          });
        }
      }

      // Re-link testimonials if provided
      if (dto.testimonials !== undefined) {
        await tx.programTestimonial.deleteMany({ where: { programId: id } });
        if (dto.testimonials.length > 0) {
          await tx.programTestimonial.createMany({
            data: dto.testimonials.map((t, idx) => ({
              programId: id,
              authorName: t.authorName.trim(),
              authorRole: t.authorRole?.trim() || null,
              quote: t.quote.trim(),
              rating: t.rating ? Number(t.rating) : 5,
              avatarUrl: t.avatarUrl?.trim() || null,
              orderIndex: t.orderIndex !== undefined ? t.orderIndex : idx,
              isActive: t.isActive !== undefined ? t.isActive : true,
            })),
          });
        }
      }

      // Re-link faqs if provided
      if (dto.faqs !== undefined) {
        await tx.programFaq.deleteMany({ where: { programId: id } });
        if (dto.faqs.length > 0) {
          await tx.programFaq.createMany({
            data: dto.faqs.map((f, idx) => ({
              programId: id,
              question: f.question.trim(),
              answer: f.answer.trim(),
              orderIndex: f.orderIndex !== undefined ? f.orderIndex : idx,
              isActive: f.isActive !== undefined ? f.isActive : true,
            })),
          });
        }
      }

      // Non-destructive update for projects, templates, tasks, rubrics, and resources
      if (dto.projects !== undefined) {
        const existingProjects = await tx.project.findMany({
          where: { programId: id },
          include: {
            resources: true,
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
          },
          orderBy: { orderIndex: 'asc' },
        });

        const updatedProjectIds: number[] = [];

        for (let pIdx = 0; pIdx < dto.projects.length; pIdx++) {
          const projDto = dto.projects[pIdx];
          const existingProj = existingProjects[pIdx];

          let projectId: number;

          if (existingProj) {
            projectId = existingProj.id;
            // 1. Update existing project row
            await tx.project.update({
              where: { id: existingProj.id },
              data: {
                title: projDto.title.trim(),
                description: projDto.description?.trim() || null,
                orderIndex: projDto.orderIndex !== undefined ? projDto.orderIndex : pIdx + 1,
              },
            });

            // 2. Project Resources: Clean & Re-add project resources
            await tx.resource.deleteMany({
              where: { projectId: existingProj.id, ownerType: 'PROJECT' },
            });
            if (projDto.resources && projDto.resources.length > 0) {
              await tx.resource.createMany({
                data: projDto.resources.map((r) => ({
                  ownerType: 'PROJECT' as const,
                  projectId: existingProj.id,
                  type: r.type || 'DOCUMENTATION',
                  title: r.title.trim(),
                  url: r.url.trim(),
                })),
              });
            }
          } else {
            // 1. Create new project row
            const createdProj = await tx.project.create({
              data: {
                programId: id,
                title: projDto.title.trim(),
                description: projDto.description?.trim() || null,
                orderIndex: projDto.orderIndex !== undefined ? projDto.orderIndex : pIdx + 1,
                ...(projDto.resources && projDto.resources.length > 0
                  ? {
                      resources: {
                        create: projDto.resources.map((r) => ({
                          ownerType: 'PROJECT' as const,
                          type: r.type || 'DOCUMENTATION',
                          title: r.title.trim(),
                          url: r.url.trim(),
                        })),
                      },
                    }
                  : {}),
              },
            });
            projectId = createdProj.id;
          }

          updatedProjectIds.push(projectId);

          // 3. Workspace Template
          if (projDto.workspaceTemplate) {
            let templateId: number;

            if (existingProj?.workspaceTemplate) {
              templateId = existingProj.workspaceTemplate.id;
              await tx.workspaceTemplate.update({
                where: { id: templateId },
                data: {
                  version: projDto.workspaceTemplate.version || existingProj.workspaceTemplate.version || 1,
                  isActive:
                    projDto.workspaceTemplate.isActive !== undefined
                      ? projDto.workspaceTemplate.isActive
                      : true,
                },
              });
            } else {
              const createdTemplate = await tx.workspaceTemplate.create({
                data: {
                  projectId,
                  version: projDto.workspaceTemplate.version || 1,
                  isActive:
                    projDto.workspaceTemplate.isActive !== undefined
                      ? projDto.workspaceTemplate.isActive
                      : true,
                },
              });
              templateId = createdTemplate.id;
            }

            // 4. Tasks, Rubrics & Resources
            const incomingTasks = projDto.workspaceTemplate.tasks || [];
            const existingTasks = existingProj?.workspaceTemplate?.tasks || [];
            const updatedTaskIds: number[] = [];

            for (let tIdx = 0; tIdx < incomingTasks.length; tIdx++) {
              const taskDto = incomingTasks[tIdx];
              const existingTask = existingTasks[tIdx];

              let taskId: number;

              if (existingTask) {
                taskId = existingTask.id;
                // Update existing task
                await tx.templateTask.update({
                  where: { id: existingTask.id },
                  data: {
                    title: taskDto.title.trim(),
                    description: taskDto.description?.trim() || null,
                    orderIndex: taskDto.orderIndex !== undefined ? taskDto.orderIndex : tIdx + 1,
                  },
                });

                // Update or Create Rubric
                if (taskDto.rubric) {
                  const criteriaPayload = taskDto.rubric.criteria || [
                    { criterion: 'Implementation & Requirements', maxScore: 50 },
                    { criterion: 'Code Quality & Best Practices', maxScore: 30 },
                    { criterion: 'Documentation & Testing', maxScore: 20 },
                  ];

                  if (existingTask.rubric) {
                    await tx.rubric.update({
                      where: { id: existingTask.rubric.id },
                      data: {
                        maxScore: taskDto.rubric.maxScore || 100,
                        passThreshold: taskDto.rubric.passThreshold || 60,
                        criteria: criteriaPayload,
                      },
                    });
                  } else {
                    await tx.rubric.create({
                      data: {
                        taskId: existingTask.id,
                        maxScore: taskDto.rubric.maxScore || 100,
                        passThreshold: taskDto.rubric.passThreshold || 60,
                        criteria: criteriaPayload,
                      },
                    });
                  }
                }

                // Task Resources: Clean & Re-add
                await tx.resource.deleteMany({
                  where: { taskId: existingTask.id, ownerType: 'TASK' },
                });
                if (taskDto.resources && taskDto.resources.length > 0) {
                  await tx.resource.createMany({
                    data: taskDto.resources.map((r) => ({
                      ownerType: 'TASK' as const,
                      taskId: existingTask.id,
                      type: r.type || 'LINK',
                      title: r.title.trim(),
                      url: r.url.trim(),
                    })),
                  });
                }
              } else {
                // Create new task
                const createdTask = await tx.templateTask.create({
                  data: {
                    workspaceTemplateId: templateId,
                    title: taskDto.title.trim(),
                    description: taskDto.description?.trim() || null,
                    orderIndex: taskDto.orderIndex !== undefined ? taskDto.orderIndex : tIdx + 1,
                    ...(taskDto.rubric
                      ? {
                          rubric: {
                            create: {
                              maxScore: taskDto.rubric.maxScore || 100,
                              passThreshold: taskDto.rubric.passThreshold || 60,
                              criteria: taskDto.rubric.criteria || [
                                { criterion: 'Implementation & Requirements', maxScore: 50 },
                                { criterion: 'Code Quality & Best Practices', maxScore: 30 },
                                { criterion: 'Documentation & Testing', maxScore: 20 },
                              ],
                            },
                          },
                        }
                      : {}),
                    ...(taskDto.resources && taskDto.resources.length > 0
                      ? {
                          resources: {
                            create: taskDto.resources.map((r) => ({
                              ownerType: 'TASK' as const,
                              type: r.type || 'LINK',
                              title: r.title.trim(),
                              url: r.url.trim(),
                            })),
                          },
                        }
                      : {}),
                  },
                });
                taskId = createdTask.id;
              }

              updatedTaskIds.push(taskId);
            }

            // Remove any tasks that were deleted by admin (only if not referenced)
            for (const oldTask of existingTasks) {
              if (!updatedTaskIds.includes(oldTask.id)) {
                const referencedCount = await tx.workspaceTask.count({
                  where: { templateTaskId: oldTask.id },
                });
                if (referencedCount === 0) {
                  await tx.templateTask.delete({ where: { id: oldTask.id } });
                }
              }
            }
          }
        }

        // Remove any projects that were deleted by admin (only if not referenced by enrollments)
        for (const oldProj of existingProjects) {
          if (!updatedProjectIds.includes(oldProj.id)) {
            const enrolledCount = await tx.enrollmentProject.count({
              where: { projectId: oldProj.id },
            });
            if (enrolledCount === 0) {
              await tx.project.delete({ where: { id: oldProj.id } });
            }
          }
        }
      }

      return tx.program.update({
        where: { id },
        data: {
          ...(dto.countryId ? { countryId: dto.countryId } : {}),
          ...(dto.title ? { title: dto.title.trim() } : {}),
          ...(dto.slug ? { slug: dto.slug.toLowerCase().trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
          ...(dto.outcomes !== undefined ? { outcomes: dto.outcomes?.trim() } : {}),
          ...(dto.durationHours ? { durationHours: dto.durationHours } : {}),
          ...(dto.status ? { status: dto.status.toLowerCase().trim() } : {}),
        },
        include: this.programNestedInclude,
      });
    });
  }

  /**
   * Delete a Program by ID
   */
  async remove(id: number) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Program ID ${id} not found`);
    }

    await this.prisma.program.delete({ where: { id } });
    return { message: `Program ID ${id} deleted successfully` };
  }

  /**
   * Add a pricing entry to an existing Program
   */
  async addPricing(programId: number, dto: CreateProgramPricingDto) {
    const program = await this.prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      throw new NotFoundException(`Program ID ${programId} not found`);
    }

    const country = await this.prisma.country.findUnique({ where: { id: dto.countryId } });
    if (!country) {
      throw new NotFoundException(`Country ID ${dto.countryId} not found`);
    }

    return this.prisma.programPricing.create({
      data: {
        programId,
        countryId: dto.countryId,
        currency: dto.currency.toUpperCase().trim(),
        amount: dto.amount,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
      include: {
        program: true,
        country: true,
      },
    });
  }

  /**
   * Update an existing Program Pricing entry
   */
  async updatePricing(pricingId: number, dto: UpdateProgramPricingDto) {
    const pricing = await this.prisma.programPricing.findUnique({ where: { id: pricingId } });
    if (!pricing) {
      throw new NotFoundException(`Program pricing ID ${pricingId} not found`);
    }

    if (dto.countryId) {
      const country = await this.prisma.country.findUnique({ where: { id: dto.countryId } });
      if (!country) {
        throw new NotFoundException(`Country ID ${dto.countryId} not found`);
      }
    }

    return this.prisma.programPricing.update({
      where: { id: pricingId },
      data: {
        ...(dto.countryId ? { countryId: dto.countryId } : {}),
        ...(dto.currency ? { currency: dto.currency.toUpperCase().trim() } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.validFrom !== undefined ? { validFrom: dto.validFrom ? new Date(dto.validFrom) : null } : {}),
        ...(dto.validUntil !== undefined ? { validUntil: dto.validUntil ? new Date(dto.validUntil) : null } : {}),
      },
      include: {
        program: true,
        country: true,
      },
    });
  }

  /**
   * Delete a Program Pricing entry by ID
   */
  async removePricing(pricingId: number) {
    const pricing = await this.prisma.programPricing.findUnique({ where: { id: pricingId } });
    if (!pricing) {
      throw new NotFoundException(`Program pricing ID ${pricingId} not found`);
    }

    await this.prisma.programPricing.delete({ where: { id: pricingId } });
    return { message: `Program pricing ID ${pricingId} deleted successfully` };
  }
}
