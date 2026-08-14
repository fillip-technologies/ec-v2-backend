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

      // Re-link projects if provided
      if (dto.projects !== undefined) {
        await tx.project.deleteMany({ where: { programId: id } });
        for (let pIdx = 0; pIdx < dto.projects.length; pIdx++) {
          const proj = dto.projects[pIdx];
          const createdProject = await tx.project.create({
            data: {
              programId: id,
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
            },
          });

          if (proj.workspaceTemplate) {
            const createdTemplate = await tx.workspaceTemplate.create({
              data: {
                projectId: createdProject.id,
                version: proj.workspaceTemplate.version || 1,
                isActive:
                  proj.workspaceTemplate.isActive !== undefined
                    ? proj.workspaceTemplate.isActive
                    : true,
              },
            });

            if (proj.workspaceTemplate.tasks && proj.workspaceTemplate.tasks.length > 0) {
              for (let tIdx = 0; tIdx < proj.workspaceTemplate.tasks.length; tIdx++) {
                const task = proj.workspaceTemplate.tasks[tIdx];
                await tx.templateTask.create({
                  data: {
                    workspaceTemplateId: createdTemplate.id,
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
                  },
                });
              }
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
