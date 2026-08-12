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
              steps: {
                orderBy: { orderIndex: 'asc' as const },
                include: {
                  resources: true,
                  rubric: true,
                  tasks: {
                    orderBy: { orderIndex: 'asc' as const },
                    include: {
                      resources: true,
                    },
                  },
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
