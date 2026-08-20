import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CollegeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Resolves the College ID associated with a logged-in College Member user
   */
  private async getCollegeForUser(userId: number) {
    const member = await this.prisma.collegeMember.findFirst({
      where: { userId },
      include: { college: true },
    });

    if (member && member.college) {
      return member.college;
    }

    // Fallback: Check for approved college (e.g. VIT) when an admin or unlinked coordinator accesses view
    const defaultCollege = await this.prisma.college.findFirst({
      where: { status: 'approved' },
      orderBy: { id: 'asc' },
    });

    if (defaultCollege) {
      return defaultCollege;
    }

    const anyCollege = await this.prisma.college.findFirst();
    if (anyCollege) {
      return anyCollege;
    }

    throw new ForbiddenException(`User ID ${userId} is not associated with any registered college institution.`);
  }

  /**
   * GET /college/overview
   * Returns scoped telemetry metrics for the logged-in college institution
   */
  async getOverview(userId: number) {
    const college = await this.getCollegeForUser(userId);
    const collegeId = college.id;

    const [
      totalStudents,
      activeEnrollments,
      completedEnrollments,
      totalSeatsAgg,
      studentsList,
      couponBatches,
      allEnrollments,
    ] = await Promise.all([
      this.prisma.student.count({ where: { collegeId } }),
      this.prisma.enrollment.count({
        where: {
          student: { collegeId },
          status: 'ACTIVE',
        },
      }),
      this.prisma.enrollment.count({
        where: {
          student: { collegeId },
          status: 'COMPLETED',
        },
      }),
      this.prisma.seatOrder.aggregate({
        _sum: { seatsPurchased: true },
        where: { collegeId, status: 'PAID' },
      }),
      this.prisma.student.findMany({
        where: { collegeId },
        include: {
          user: true,
          enrollments: {
            include: {
              program: true,
              selectedProjects: {
                include: {
                  workspace: {
                    include: {
                      tasks: {
                        include: { progress: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.couponBatch.findMany({
        where: { collegeId },
        include: {
          program: true,
          coupons: true,
          seatOrder: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      this.prisma.enrollment.findMany({
        where: { student: { collegeId } },
        include: { program: true },
      }),
    ]);

    const totalSeatsAllocated = Number(totalSeatsAgg._sum.seatsPurchased) || 0;

    // Compute active coupon batches safely
    const activeCouponBatches = couponBatches.map((b) => {
      const totalCouponsCount = b.totalCoupons || b.coupons?.length || 0;
      const redeemed = Array.isArray(b.coupons) ? b.coupons.filter((c) => c.status === 'REDEEMED').length : 0;
      const activeCoupons = Array.isArray(b.coupons) ? b.coupons.filter((c) => c.status === 'ACTIVE').length : 0;
      const firstCouponExpiry = b.coupons?.find((c) => c.expiresAt)?.expiresAt;
      return {
        id: b.id,
        batchCode: b.batchCode,
        programTitle: b.program?.title || 'Engineering Track',
        totalSeats: totalCouponsCount,
        redeemedSeats: redeemed,
        activeSeats: activeCoupons,
        redemptionPercentage: totalCouponsCount > 0 ? Math.round((redeemed / totalCouponsCount) * 100) : 0,
        status: activeCoupons > 0 ? 'ACTIVE' : 'EXHAUSTED',
        expiresAt: firstCouponExpiry ? new Date(firstCouponExpiry).toISOString().split('T')[0] : '2026-12-31',
      };
    });

    // Compute cohort breakdown by program track
    const trackMap = new Map<string, number>();
    allEnrollments.forEach((e) => {
      if (e.program?.title) {
        const title = e.program.title;
        trackMap.set(title, (trackMap.get(title) || 0) + 1);
      }
    });

    const totalEnrolledCohort = allEnrollments.length || 0;
    const cohortByTrack = Array.from(trackMap.entries()).map(([programTitle, count]) => ({
      programTitle,
      count,
      percentage: totalEnrolledCohort > 0 ? Math.round((count / totalEnrolledCohort) * 100) : 0,
    }));

    return {
      college: {
        id: college.id,
        name: college.name,
        address: college.address,
        status: college.status,
      },
      metrics: {
        totalStudents,
        activeEnrollments,
        completedEnrollments,
        totalSeatsAllocated,
      },
      activeCouponBatches,
      cohortByTrack,
      recentCohortStudents: studentsList.map((s: any) => {
        const latestEnrollment = s.enrollments[0];
        let totalTasksCount = 0;
        let passedTasksCount = 0;
        let completionPercentage = 0;

        if (latestEnrollment && latestEnrollment.selectedProjects) {
          latestEnrollment.selectedProjects.forEach((ep: any) => {
            ep.workspace?.tasks?.forEach((tk: any) => {
              totalTasksCount++;
              if (tk.progress?.status === 'PASSED') passedTasksCount++;
            });
          });
          if (totalTasksCount > 0) {
            completionPercentage = Math.round((passedTasksCount / totalTasksCount) * 100);
          }
        }

        return {
          id: s.userid,
          displayName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.email || 'Student',
          email: s.user?.email || '',
          programTitle: latestEnrollment?.program?.title || 'Not Enrolled',
          enrollmentStatus: latestEnrollment?.status || 'PENDING',
          totalTasks: totalTasksCount,
          passedTasks: passedTasksCount,
          completionPercentage,
        };
      }),
    };
  }

  /**
   * GET /college/students
   * Returns list of students belonging ONLY to this college
   */
  async getStudents(userId: number) {
    const college = await this.getCollegeForUser(userId);
    const collegeId = college.id;

    const students = await this.prisma.student.findMany({
      where: { collegeId },
      include: {
        user: true,
        enrollments: {
          include: {
            program: true,
            selectedProjects: {
              include: {
                workspace: {
                  include: {
                    tasks: {
                      include: { progress: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return students.map((s: any) => {
      const latestEnrollment = s.enrollments[0];
      let completionPercentage = 0;
      if (latestEnrollment && latestEnrollment.selectedProjects) {
        let totalTasks = 0;
        let passedTasks = 0;
        latestEnrollment.selectedProjects.forEach((ep: any) => {
          ep.workspace?.tasks?.forEach((tk: any) => {
            totalTasks++;
            if (tk.progress?.status === 'PASSED') passedTasks++;
          });
        });
        if (totalTasks > 0) {
          completionPercentage = Math.round((passedTasks / totalTasks) * 100);
        }
      }

      return {
        id: s.userid,
        firstName: s.firstName,
        lastName: s.lastName,
        displayName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.email || 'Student',
        email: s.user?.email || '',
        phoneNo: s.user?.phoneNo,
        programTitle: latestEnrollment?.program?.title || 'Not Enrolled',
        enrollmentStatus: latestEnrollment?.status || 'N/A',
        completionPercentage,
        enrolledAt: latestEnrollment?.enrolledAt || s.createdAt,
      };
    });
  }

  /**
   * GET /college/coupons
   * List zero-cost B2B coupon batches generated for this college
   */
  async getCoupons(userId: number) {
    const college = await this.getCollegeForUser(userId);
    const collegeId = college.id;

    const batches = await this.prisma.couponBatch.findMany({
      where: { collegeId },
      include: {
        program: true,
        coupons: true,
        seatOrder: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return batches.map((b) => {
      const redeemedSeats = b.coupons.filter((cp) => cp.status === 'REDEEMED').length;
      const activeSeats = b.coupons.filter((cp) => cp.status === 'ACTIVE').length;

      return {
        id: b.id,
        code: b.batchCode,
        programTitle: b.program?.title || 'Internship Program',
        totalSeats: b.totalCoupons,
        redeemedSeats,
        discountType: 'ZERO_COST',
        status: activeSeats > 0 ? 'ACTIVE' : 'EXHAUSTED',
        validUntil: b.coupons[0]?.expiresAt
          ? new Date(b.coupons[0].expiresAt).toISOString().slice(0, 10)
          : '2026-12-31',
      };
    });
  }

  /**
   * GET /college/reports
   * Cohort progress and completion reports computed from database
   */
  async getReports(userId: number) {
    const college = await this.getCollegeForUser(userId);
    const collegeId = college.id;

    const [totalStudents, completedCount, certificatesCount, programsWithCollegeStudents] =
      await Promise.all([
        this.prisma.student.count({ where: { collegeId } }),
        this.prisma.enrollment.count({
          where: { student: { collegeId }, status: 'COMPLETED' },
        }),
        this.prisma.certificate.count({
          where: { student: { collegeId } },
        }),
        this.prisma.program.findMany({
          where: {
            enrollments: {
              some: { student: { collegeId } },
            },
          },
          include: {
            enrollments: {
              where: { student: { collegeId } },
              include: {
                student: {
                  include: {
                    submissions: {
                      include: { aiReview: true },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

    const cohortSummary = programsWithCollegeStudents.map((prog) => {
      const enrolledCount = prog.enrollments.length;
      const completedProgCount = prog.enrollments.filter((e) => e.status === 'COMPLETED').length;

      let totalScore = 0;
      let reviewCount = 0;

      prog.enrollments.forEach((e) => {
        e.student?.submissions?.forEach((sub) => {
          if (sub.aiReview?.score !== undefined && sub.aiReview?.score !== null) {
            totalScore += Number(sub.aiReview.score);
            reviewCount++;
          }
        });
      });

      const avgScore = reviewCount > 0 ? `${Math.round(totalScore / reviewCount)}%` : 'N/A';

      return {
        id: prog.id,
        programTitle: prog.title,
        enrolledCount,
        completedCount: completedProgCount,
        avgScore,
        status: 'ACTIVE',
      };
    });

    return {
      institutionName: college.name,
      totalEnrolledCohort: totalStudents,
      completedInternships: completedCount,
      completionRatePercentage:
        totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
      certificatesIssued: certificatesCount,
      cohortSummary,
    };
  }
}
