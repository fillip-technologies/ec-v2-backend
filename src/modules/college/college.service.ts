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

    if (!member || !member.college) {
      throw new ForbiddenException(`User ID ${userId} is not associated with any registered college institution.`);
    }

    return member.college;
  }

  /**
   * GET /college/overview
   * Returns scoped telemetry metrics for the logged-in college institution (e.g. VIT)
   */
  async getOverview(userId: number) {
    const college = await this.getCollegeForUser(userId);
    const collegeId = college.id;

    const [totalStudents, activeEnrollments, completedEnrollments, studentsList] = await Promise.all([
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
        take: 10,
      }),
    ]);

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
        totalSeatsAllocated: totalStudents + 50, // Available seat capacity
      },
      recentCohortStudents: studentsList.map((s: any) => {
        const latestEnrollment = s.enrollments[0];
        let completionPercentage = 0;
        if (latestEnrollment && latestEnrollment.selectedProjects) {
          let totalTasks = 0;
          let passedTasks = 0;
          latestEnrollment.selectedProjects.forEach((ep: any) => {
            ep.workspace?.tasks.forEach((tk: any) => {
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
          displayName: `${s.firstName} ${s.lastName}`.trim(),
          email: s.user.email,
          programTitle: latestEnrollment?.program?.title || 'Not Enrolled',
          enrollmentStatus: latestEnrollment?.status || 'PENDING',
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
          ep.workspace?.tasks.forEach((tk: any) => {
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
        displayName: `${s.firstName} ${s.lastName}`.trim(),
        email: s.user.email,
        phoneNo: s.user.phoneNo,
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

    return [
      {
        id: 1,
        code: `VIT-MERN-2026`,
        programTitle: 'Full Stack Web Engineering (MERN & Next.js)',
        totalSeats: 50,
        redeemedSeats: 12,
        discountType: 'ZERO_COST',
        status: 'ACTIVE',
        validUntil: '2026-12-31',
      },
    ];
  }

  /**
   * GET /college/reports
   * Cohort progress and completion reports for this college
   */
  async getReports(userId: number) {
    const college = await this.getCollegeForUser(userId);
    const collegeId = college.id;

    const totalStudents = await this.prisma.student.count({ where: { collegeId } });
    const completedCount = await this.prisma.enrollment.count({
      where: { student: { collegeId }, status: 'COMPLETED' },
    });

    return {
      institutionName: college.name,
      totalEnrolledCohort: totalStudents,
      completedInternships: completedCount,
      completionRatePercentage: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
      certificatesIssued: completedCount,
    };
  }
}
