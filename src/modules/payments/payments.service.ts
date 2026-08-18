import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RazorpayProvider } from './providers/razorpay.provider';
import { SettlementEvent } from './providers/payment-provider.interface';
import { CheckoutDto } from './dto/checkout.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import {
  CreateSeatOrderDto,
  ConfirmSeatOrderPaymentDto,
} from './dto/create-seat-order.dto';
import {
  CreateGatewayConfigDto,
  UpdateGatewayConfigDto,
} from './dto/gateway-config.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayProvider: RazorpayProvider,
  ) {}

  // ===========================================================================
  // 1. COUPON VALIDATION
  // ===========================================================================

  async validateCoupon(code: string, programId: number) {
    const cleanCode = code.trim().toUpperCase();

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: cleanCode },
      include: {
        batch: {
          include: {
            program: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code.');
    }

    if (coupon.status !== 'ACTIVE') {
      throw new BadRequestException(`Coupon has already been ${coupon.status.toLowerCase()}.`);
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired.');
    }

    if (coupon.batch.programId !== programId) {
      throw new BadRequestException(
        `This coupon is valid for "${coupon.batch.program.title}", not the selected program.`,
      );
    }

    return {
      valid: true,
      code: coupon.code,
      discountPercent: 100,
      batchCode: coupon.batch.batchCode,
      programId: coupon.batch.programId,
      programTitle: coupon.batch.program.title,
    };
  }

  // ===========================================================================
  // 2. CHECKOUT (Student Initiates: Coupon ₹0 OR Razorpay Paid)
  // ===========================================================================

  async checkout(studentId: number, programId: number, dto: CheckoutDto) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        pricings: true,
        projects: {
          include: {
            workspaceTemplate: {
              include: {
                tasks: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found.');
    }

    // Check if student is already actively enrolled in this program
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        programId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this program.');
    }

    // PATH A: COUPON REDEMPTION (₹0 Free Seat)
    if (dto.couponCode && dto.couponCode.trim()) {
      const cleanCode = dto.couponCode.trim().toUpperCase();

      return await this.prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.findUnique({
          where: { code: cleanCode },
          include: { batch: true },
        });

        if (!coupon) throw new NotFoundException('Coupon not found.');
        if (coupon.status !== 'ACTIVE') {
          throw new BadRequestException(`Coupon is ${coupon.status.toLowerCase()}.`);
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new BadRequestException('Coupon has expired.');
        }
        if (coupon.batch.programId !== programId) {
          throw new BadRequestException('Coupon does not belong to this program.');
        }

        // 1. Lock coupon to REDEEMED
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            status: 'REDEEMED',
            redeemedByUserId: studentId,
            redeemedAt: new Date(),
          },
        });

        // 2. If college seat order, increment seatsRedeemed
        if (coupon.batch.seatOrderId) {
          await tx.seatOrder.update({
            where: { id: coupon.batch.seatOrderId },
            data: { seatsRedeemed: { increment: 1 } },
          });
        }

        // 3. Create PAID Order
        const receipt = `EC-CPN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const order = await tx.order.create({
          data: {
            studentId,
            programId,
            couponId: coupon.id,
            amount: 0,
            currency: dto.currency || 'INR',
            status: 'PAID',
            receipt,
          },
        });

        // 4. Create Enrollment + Snapshot Workspace
        const enrollment = await this.generateStudentEnrollmentSnapshot(
          tx,
          studentId,
          programId,
          order.id,
        );

        return {
          orderId: order.id,
          status: 'PAID',
          isCoupon: true,
          amount: 0,
          currency: order.currency,
          enrollmentId: enrollment.id,
          message: 'Coupon redeemed successfully. You are now enrolled!',
        };
      });
    }

    // PATH B: RAZORPAY PAID CHECKOUT
    const currency = dto.currency?.toUpperCase() || 'INR';
    const countryPricing =
      (dto.countryId
        ? program.pricings.find((p) => p.countryId === dto.countryId)
        : null) ||
      program.pricings.find((p) => p.currency.toUpperCase() === currency) ||
      program.pricings[0];

    const amount = countryPricing ? Number(countryPricing.amount) : 4999;
    const finalCurrency = countryPricing ? countryPricing.currency : currency;
    const receipt = `EC-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Call Razorpay API
    const rpOrder = await this.razorpayProvider.createOrder({
      amount,
      currency: finalCurrency,
      receipt,
      notes: {
        studentId: String(studentId),
        programId: String(programId),
        programTitle: program.title,
      },
    });

    // Create PENDING Order in Database
    const order = await this.prisma.order.create({
      data: {
        studentId,
        programId,
        amount,
        currency: finalCurrency,
        status: 'PENDING',
        gateway: 'razorpay',
        gatewayOrderId: rpOrder.gatewayOrderId,
        receipt,
      },
    });

    return {
      orderId: order.id,
      status: 'PENDING',
      amount,
      currency: finalCurrency,
      gateway: 'razorpay',
      gatewayOrderId: rpOrder.gatewayOrderId,
      razorpayKeyId: this.razorpayProvider.getKeyId(),
      receipt,
      programTitle: program.title,
    };
  }

  // ===========================================================================
  // 3. IDEMPOTENT SETTLEMENT (Shared by verify endpoint & webhooks)
  // ===========================================================================

  async settlePayment(event: SettlementEvent) {
    // Check if this payment event was already recorded (idempotency guard)
    const existingPayment = await this.prisma.payment.findUnique({
      where: { gatewayPaymentId: event.gatewayPaymentId },
    });

    if (existingPayment) {
      this.logger.log(
        `[Idempotency] Payment ${event.gatewayPaymentId} already settled. Skipping duplicate event.`,
      );
      return { settled: true, alreadyProcessed: true };
    }

    return await this.prisma.$transaction(async (tx) => {
      // Find matching Order by gatewayOrderId
      const order = await tx.order.findUnique({
        where: { gatewayOrderId: event.gatewayOrderId },
      });

      if (!order) {
        this.logger.error(
          `Order not found for gatewayOrderId: ${event.gatewayOrderId}`,
        );
        throw new NotFoundException(`Order not found for ${event.gatewayOrderId}`);
      }

      // Record Payment attempt row (audit trail)
      await tx.payment.create({
        data: {
          orderId: order.id,
          gateway: 'razorpay',
          gatewayPaymentId: event.gatewayPaymentId,
          status: event.status,
          amount: event.amount,
          currency: event.currency,
          method: event.method || null,
          fee: event.fee || null,
          tax: event.tax || null,
          errorCode: event.errorCode || null,
          errorDescription: event.errorDescription || null,
          rawPayload: event.raw || null,
        },
      });

      // If CAPTURED and Order is PENDING -> Flip to PAID & Generate Enrollment
      if (event.status === 'CAPTURED' && order.status === 'PENDING') {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });

        // Check if enrollment already created
        const existingEnrollment = await tx.enrollment.findUnique({
          where: { orderId: order.id },
        });

        let enrollmentId = existingEnrollment?.id;

        if (!existingEnrollment) {
          const newEnrollment = await this.generateStudentEnrollmentSnapshot(
            tx,
            order.studentId,
            order.programId,
            order.id,
          );
          enrollmentId = newEnrollment.id;
        }

        this.logger.log(
          `[Settlement Success] Order #${order.id} marked PAID. Enrollment #${enrollmentId} generated.`,
        );

        return {
          settled: true,
          orderId: order.id,
          status: 'PAID',
          enrollmentId,
        };
      }

      return {
        settled: true,
        orderId: order.id,
        status: order.status,
      };
    });
  }

  // ===========================================================================
  // 4. CLIENT PAYMENT VERIFICATION (Called right after checkout popup closes)
  // ===========================================================================

  async verifyPayment(studentId: number, dto: VerifyPaymentDto) {
    const isValid = this.razorpayProvider.verifyPaymentSignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid Razorpay signature.');
    }

    // Fetch official payment entity directly from Razorpay
    const rpPayment = await this.razorpayProvider.fetchPayment(
      dto.razorpay_payment_id,
    );
    const event = this.razorpayProvider.parsePaymentEvent(rpPayment);

    // Ensure gatewayOrderId matches
    event.gatewayOrderId = dto.razorpay_order_id;
    event.gatewayPaymentId = dto.razorpay_payment_id;

    const result = await this.settlePayment(event);

    return {
      success: true,
      message: 'Payment verified and enrollment confirmed!',
      ...result,
    };
  }

  // ===========================================================================
  // 5. SERVER-TO-SERVER WEBHOOK HANDLER
  // ===========================================================================

  async handleWebhook(
    rawBody: Buffer | string,
    signature: string,
    body: any,
  ) {
    const isValid = this.razorpayProvider.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      this.logger.warn('Unauthorized Razorpay webhook signature attempt.');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = this.razorpayProvider.parsePaymentEvent(body);
    if (event.gatewayOrderId && event.gatewayPaymentId) {
      await this.settlePayment(event);
    }

    return { received: true };
  }

  // ===========================================================================
  // 6. HELPER: SNAPSHOT WORKSPACE & ENROLLMENT CREATION
  // ===========================================================================

  private async generateStudentEnrollmentSnapshot(
    tx: any,
    studentId: number,
    programId: number,
    orderId: number,
  ) {
    // 1. Create Enrollment record
    const enrollment = await tx.enrollment.create({
      data: {
        studentId,
        programId,
        orderId,
        status: 'ACTIVE',
        enrolledAt: new Date(),
      },
    });

    // 2. Fetch all program projects with templates and tasks
    const projects = await tx.project.findMany({
      where: { programId },
      include: {
        workspaceTemplate: {
          include: {
            tasks: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    // 3. Create EnrollmentProject and StudentWorkspace for each project
    for (let pIdx = 0; pIdx < projects.length; pIdx++) {
      const proj = projects[pIdx];
      const projStatus = pIdx === 0 ? 'ACTIVE' : 'LOCKED';

      const enrollmentProj = await tx.enrollmentProject.create({
        data: {
          enrollmentId: enrollment.id,
          projectId: proj.id,
          orderIndex: pIdx + 1,
          status: projStatus,
        },
      });

      if (proj.workspaceTemplate) {
        const workspace = await tx.studentWorkspace.create({
          data: {
            enrollmentProjectId: enrollmentProj.id,
            workspaceTemplateId: proj.workspaceTemplate.id,
            templateVersion: proj.workspaceTemplate.version || 1,
          },
        });

        // 4. Create WorkspaceTasks and initialize TaskProgress
        const tasks = proj.workspaceTemplate.tasks || [];
        for (let tIdx = 0; tIdx < tasks.length; tIdx++) {
          const t = tasks[tIdx];
          const taskProgressStatus =
            pIdx === 0 && tIdx === 0 ? 'OPEN' : 'LOCKED';

          const wsTask = await tx.workspaceTask.create({
            data: {
              studentWorkspaceId: workspace.id,
              templateTaskId: t.id,
              orderIndex: tIdx + 1,
              title: t.title,
              description: t.description,
            },
          });

          await tx.taskProgress.create({
            data: {
              workspaceTaskId: wsTask.id,
              status: taskProgressStatus,
              unlockedAt: taskProgressStatus === 'OPEN' ? new Date() : null,
            },
          });
        }
      }
    }

    return enrollment;
  }

  // ===========================================================================
  // 7. B2B SEAT ORDERS & COUPON BATCH GENERATION
  // ===========================================================================

  async createSeatOrder(
    collegeId: number,
    dto: CreateSeatOrderDto,
    isAdmin = false,
  ) {
    const program = await this.prisma.program.findUnique({
      where: { id: dto.programId },
      include: { pricings: true },
    });

    if (!program) throw new NotFoundException('Program not found.');

    const pricing =
      program.pricings.find((p) => p.currency === (dto.currency || 'INR')) ||
      program.pricings[0];
    const unitPrice = pricing ? Number(pricing.amount) : 4999;
    const totalAmount =
      dto.amount !== undefined ? dto.amount : unitPrice * dto.seatsPurchased;

    // If Admin triggers autoGenerateCoupons, create SeatOrder as PAID and immediately generate coupons
    if (isAdmin && dto.autoGenerateCoupons !== false) {
      return await this.prisma.$transaction(async (tx) => {
        const college = await tx.college.findUnique({ where: { id: collegeId } });
        if (!college) throw new NotFoundException('College not found.');

        const seatOrder = await tx.seatOrder.create({
          data: {
            collegeId,
            programId: dto.programId,
            seatsPurchased: dto.seatsPurchased,
            amount: totalAmount,
            currency: dto.currency || pricing?.currency || 'INR',
            status: 'PAID',
            invoiceRef: dto.invoiceRef || `INV-ADM-${Date.now()}`,
          },
          include: {
            program: { select: { id: true, title: true, slug: true } },
            college: { select: { id: true, name: true } },
          },
        });

        const prefix = (
          dto.batchCodePrefix ||
          `EC-${college.name.substring(0, 4).toUpperCase()}`
        ).replace(/[^A-Z0-9]/g, '');

        const batchCode = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

        const batch = await tx.couponBatch.create({
          data: {
            collegeId,
            seatOrderId: seatOrder.id,
            programId: dto.programId,
            batchCode,
            totalCoupons: dto.seatsPurchased,
          },
        });

        const couponsData: { batchId: number; code: string; status: 'ACTIVE' }[] = [];
        for (let i = 1; i <= dto.seatsPurchased; i++) {
          const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
          const code = `${batchCode}-${String(i).padStart(3, '0')}-${rand}`;
          couponsData.push({
            batchId: batch.id,
            code,
            status: 'ACTIVE',
          });
        }

        await tx.coupon.createMany({ data: couponsData });

        return {
          ...seatOrder,
          couponBatch: {
            id: batch.id,
            batchCode: batch.batchCode,
            totalCoupons: dto.seatsPurchased,
          },
          message: `Issued ${dto.seatsPurchased} single-use coupon codes for ${college.name}.`,
        };
      });
    }

    return await this.prisma.seatOrder.create({
      data: {
        collegeId,
        programId: dto.programId,
        seatsPurchased: dto.seatsPurchased,
        amount: totalAmount,
        currency: dto.currency || pricing?.currency || 'INR',
        status: 'PENDING',
        invoiceRef: dto.invoiceRef || `INV-${Date.now()}`,
      },
      include: {
        program: { select: { id: true, title: true, slug: true } },
        college: { select: { id: true, name: true } },
      },
    });
  }

  async getSeatOrders(user: any) {
    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
    const isCollege = roleName.toLowerCase() === 'college';

    let collegeId: number | undefined;
    if (isCollege) {
      const collegeMember = await this.prisma.collegeMember.findFirst({
        where: { userId: user.id },
      });
      if (!collegeMember) throw new ForbiddenException('College profile not found.');
      collegeId = collegeMember.collegeId;
    }

    return await this.prisma.seatOrder.findMany({
      where: collegeId ? { collegeId } : {},
      include: {
        program: { select: { id: true, title: true, slug: true } },
        college: { select: { id: true, name: true } },
        couponBatch: {
          select: {
            id: true,
            batchCode: true,
            totalCoupons: true,
            _count: { select: { coupons: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmSeatOrderPayment(
    seatOrderId: number,
    dto: ConfirmSeatOrderPaymentDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const seatOrder = await tx.seatOrder.findUnique({
        where: { id: seatOrderId },
        include: { program: true, college: true },
      });

      if (!seatOrder) throw new NotFoundException('Seat order not found.');
      if (seatOrder.status === 'PAID') {
        throw new BadRequestException('Seat order has already been marked as paid.');
      }

      const finalSeats = dto.seatsPurchased || seatOrder.seatsPurchased;
      const finalAmount = dto.amount !== undefined ? dto.amount : seatOrder.amount;

      // 1. Update SeatOrder to PAID
      await tx.seatOrder.update({
        where: { id: seatOrderId },
        data: {
          status: 'PAID',
          seatsPurchased: finalSeats,
          amount: finalAmount,
          ...(dto.invoiceRef ? { invoiceRef: dto.invoiceRef } : {}),
        },
      });

      // 2. Generate unique CouponBatch
      const prefix = (
        dto.batchCodePrefix ||
        `EC-${seatOrder.college.name.substring(0, 4).toUpperCase()}`
      ).replace(/[^A-Z0-9]/g, '');

      const batchCode = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

      const batch = await tx.couponBatch.create({
        data: {
          collegeId: seatOrder.collegeId,
          seatOrderId: seatOrder.id,
          programId: seatOrder.programId,
          batchCode,
          totalCoupons: finalSeats,
        },
      });

      // 3. Generate N distinct single-use coupons
      const couponsData: { batchId: number; code: string; status: 'ACTIVE' }[] = [];

      for (let i = 1; i <= finalSeats; i++) {
        const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
        const code = `${batchCode}-${String(i).padStart(3, '0')}-${rand}`;
        couponsData.push({
          batchId: batch.id,
          code,
          status: 'ACTIVE',
        });
      }

      await tx.coupon.createMany({ data: couponsData });

      return {
        success: true,
        message: `Seat order confirmed. Generated ${finalSeats} coupon codes for ${seatOrder.college.name}.`,
        batchCode: batch.batchCode,
        batchId: batch.id,
        totalCoupons: finalSeats,
      };
    });
  }

  async rejectSeatOrder(
    seatOrderId: number,
    dto: { reason?: string },
  ) {
    const seatOrder = await this.prisma.seatOrder.findUnique({
      where: { id: seatOrderId },
      include: { college: true },
    });

    if (!seatOrder) throw new NotFoundException('Seat order not found.');
    if (seatOrder.status === 'PAID') {
      throw new BadRequestException('Cannot reject an order that has already been confirmed as paid.');
    }

    const updated = await this.prisma.seatOrder.update({
      where: { id: seatOrderId },
      data: {
        status: 'FAILED',
        invoiceRef: dto.reason
          ? `${seatOrder.invoiceRef || 'INV'} [REJECTED: ${dto.reason}]`
          : seatOrder.invoiceRef,
      },
    });

    return {
      success: true,
      message: `Seat order #${seatOrderId} for ${seatOrder.college.name} has been rejected.`,
      seatOrder: updated,
    };
  }

  async getCouponBatchCoupons(batchId: number, user: any) {
    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
    const isCollege = roleName.toLowerCase() === 'college';

    const batch = await this.prisma.couponBatch.findUnique({
      where: { id: batchId },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationHours: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        seatOrder: {
          select: {
            id: true,
            collegeId: true,
            programId: true,
            seatsPurchased: true,
            seatsRedeemed: true,
            amount: true,
            currency: true,
            status: true,
            invoiceRef: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        coupons: {
          include: {
            orders: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                student: {
                  select: {
                    userid: true,
                    firstName: true,
                    lastName: true,
                    user: {
                      select: {
                        email: true,
                        phoneNo: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!batch) throw new NotFoundException('Coupon batch not found.');

    if (isCollege) {
      const collegeMember = await this.prisma.collegeMember.findFirst({
        where: { userId: user.id },
      });
      if (!collegeMember || collegeMember.collegeId !== batch.collegeId) {
        throw new ForbiddenException('You do not have permission to view this coupon batch.');
      }
    }

    const formattedCoupons = batch.coupons.map((c) => {
      const redemptionOrder = c.orders?.[0];
      const student = redemptionOrder?.student;
      return {
        id: c.id,
        code: c.code,
        status: c.status,
        redeemedByUserId: c.redeemedByUserId,
        redeemedAt: c.redeemedAt,
        expiresAt: c.expiresAt,
        student: student
          ? {
              userId: student.userid,
              name: `${student.firstName} ${student.lastName}`.trim(),
              email: student.user?.email,
              phone: student.user?.phoneNo,
              orderId: redemptionOrder.id,
            }
          : null,
      };
    });

    return {
      ...batch,
      coupons: formattedCoupons,
    };
  }

  // ===========================================================================
  // 8. ORDERS & RECONCILIATION HISTORY
  // ===========================================================================

  async getStudentOrders(studentId: number) {
    return await this.prisma.order.findMany({
      where: { studentId },
      include: {
        program: { select: { id: true, title: true, slug: true } },
        payments: {
          select: {
            id: true,
            gatewayPaymentId: true,
            status: true,
            amount: true,
            currency: true,
            method: true,
            createdAt: true,
          },
        },
        coupon: { select: { code: true } },
        enrollment: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOrders() {
    return await this.prisma.order.findMany({
      include: {
        student: {
          select: {
            userid: true,
            firstName: true,
            lastName: true,
            customCollegeName: true,
            usn: true,
            college: { select: { id: true, name: true } },
            user: {
              select: { id: true, email: true, phoneNo: true },
            },
          },
        },
        program: { select: { id: true, title: true, slug: true, durationHours: true } },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            status: true,
            batch: {
              select: {
                id: true,
                name: true,
                college: { select: { id: true, name: true } },
              },
            },
          },
        },
        enrollment: { select: { id: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: number, user: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        student: {
          select: {
            userid: true,
            firstName: true,
            lastName: true,
            customCollegeName: true,
            usn: true,
            college: { select: { id: true, name: true } },
            user: {
              select: { id: true, email: true, phoneNo: true },
            },
          },
        },
        program: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        coupon: {
          include: {
            batch: {
              include: { college: true },
            },
          },
        },
        enrollment: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found.');

    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
    if (roleName.toLowerCase() === 'student' && order.studentId !== user.id) {
      throw new ForbiddenException('Access denied to this order.');
    }

    return order;
  }

  // ===========================================================================
  // 9. PAYMENT GATEWAY CONFIGURATIONS (Admin Killswitch / Priority)
  // ===========================================================================

  async getGatewayConfigs() {
    return await this.prisma.paymentGatewayConfig.findMany({
      include: {
        supportedCountries: {
          include: { country: true },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async createGatewayConfig(dto: CreateGatewayConfigDto) {
    return await this.prisma.paymentGatewayConfig.create({
      data: {
        code: dto.code.toLowerCase().trim(),
        name: dto.name.trim(),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        priority: dto.priority || 0,
        ...(dto.supportedCountryIds && dto.supportedCountryIds.length > 0
          ? {
              supportedCountries: {
                create: dto.supportedCountryIds.map((cid) => ({
                  countryId: cid,
                })),
              },
            }
          : {}),
      },
      include: {
        supportedCountries: { include: { country: true } },
      },
    });
  }

  async updateGatewayConfig(id: number, dto: UpdateGatewayConfigDto) {
    return await this.prisma.paymentGatewayConfig.update({
      where: { id },
      data: {
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.supportedCountryIds
          ? {
              supportedCountries: {
                deleteMany: {},
                create: dto.supportedCountryIds.map((cid) => ({
                  countryId: cid,
                })),
              },
            }
          : {}),
      },
      include: {
        supportedCountries: { include: { country: true } },
      },
    });
  }
}
