import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/overview
   * Returns high-level platform telemetry metrics for Super Admin / Admin console
   */
  async getOverview() {
    const [
      totalUsers,
      totalStudents,
      totalColleges,
      pendingCollegesCount,
      totalPrograms,
      totalEnrollments,
      totalSubmissions,
      pendingColleges,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.student.count(),
      this.prisma.college.count(),
      this.prisma.college.count({ where: { status: 'pending' } }),
      this.prisma.program.count(),
      this.prisma.enrollment.count(),
      this.prisma.submission.count(),
      this.prisma.college.findMany({
        where: { status: 'pending' },
        include: { country: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          role: true,
          country: true,
        },
      }),
    ]);

    return {
      metrics: {
        totalUsers,
        totalStudents,
        totalColleges,
        pendingCollegesCount,
        totalPrograms,
        totalEnrollments,
        totalSubmissions,
      },
      pendingColleges: pendingColleges.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        countryName: c.country.name,
        status: c.status,
        createdAt: c.createdAt,
      })),
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        email: u.email,
        phoneNo: u.phoneNo,
        roleName: u.role.name,
        countryName: u.country.name,
        status: u.status,
        createdAt: u.createdAt,
      })),
    };
  }

  /**
   * GET /admin/colleges
   * List all colleges with optional status filter
   */
  async getColleges(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const colleges = await this.prisma.college.findMany({
      where,
      include: {
        country: true,
        _count: {
          select: {
            students: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return colleges.map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      countryId: c.countryId,
      countryName: c.country.name,
      currencyCode: c.country.currencyCode,
      status: c.status,
      studentCount: c._count.students,
      memberCount: c._count.members,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  /**
   * PATCH /admin/colleges/:id/status
   * Approve, reject, or set pending status for a B2B college institution
   */
  async updateCollegeStatus(id: number, status: string) {
    const college = await this.prisma.college.findUnique({
      where: { id },
    });

    if (!college) {
      throw new NotFoundException(`College ID ${id} not found`);
    }

    const updated = await this.prisma.college.update({
      where: { id },
      data: { status },
      include: { country: true },
    });

    return {
      message: `College '${updated.name}' status updated to '${status}'`,
      college: updated,
    };
  }

  /**
   * GET /admin/users
   * List platform users with optional role and status filters
   */
  async getUsers(role?: string, status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (role) {
      where.role = { name: role };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        country: true,
        student: {
          include: { college: true },
        },
        collegeMembers: {
          include: { college: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const studentName = u.student ? `${u.student.firstName} ${u.student.lastName}`.trim() : null;
      const collegeName = u.student?.college?.name || u.collegeMembers?.[0]?.college?.name || null;

      return {
        id: u.id,
        email: u.email,
        phoneNo: u.phoneNo,
        roleName: u.role.name,
        countryName: u.country.name,
        status: u.status,
        displayName: studentName || collegeName || u.email.split('@')[0],
        collegeName,
        createdAt: u.createdAt,
      };
    });
  }

  /**
   * PATCH /admin/users/:id/status
   * Change user status (active, pending, disabled)
   */
  async updateUserStatus(id: number, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      include: { role: true },
    });

    return {
      message: `User status updated to '${status}'`,
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        roleName: updated.role.name,
      },
    };
  }

  /**
   * GET /admin/submissions
   * Returns list of all submissions (waiting for review first)
   */
  async getSubmissions() {
    const submissions = await this.prisma.submission.findMany({
      include: {
        student: {
          include: {
            user: true,
          },
        },
        workspaceTask: {
          include: {
            studentWorkspace: {
              include: {
                enrollmentProject: {
                  include: {
                    project: true,
                  },
                },
              },
            },
            templateTask: {
              include: {
                rubric: true,
              },
            },
          },
        },
        aiReview: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((s) => {
      const rubric = s.workspaceTask?.templateTask?.rubric;
      const maxScore = rubric?.maxScore ?? s.aiReview?.maxScore ?? 100;
      const passThreshold = rubric?.passThreshold ?? 60;

      let criteria: any[] = [];
      if (rubric?.criteria) {
        if (typeof rubric.criteria === 'string') {
          try {
            criteria = JSON.parse(rubric.criteria);
          } catch {
            criteria = [];
          }
        } else if (Array.isArray(rubric.criteria)) {
          criteria = rubric.criteria as any[];
        }
      }

      return {
        id: s.id,
        studentName: `${s.student.firstName} ${s.student.lastName}`.trim(),
        studentEmail: s.student.user.email,
        projectTitle: s.workspaceTask.studentWorkspace.enrollmentProject.project.title,
        taskTitle: s.workspaceTask.title,
        commitHash: s.commitHash ?? null,
        repoUrl: s.workspaceTask.studentWorkspace?.repoUrl ?? null,
        payloadUrl: s.payloadUrl,
        status: s.status,
        submittedAt: s.createdAt,
        workspaceTaskId: s.workspaceTaskId,
        score: s.aiReview?.score ?? null,
        feedback: s.aiReview?.feedback ?? null,
        maxScore,
        passThreshold,
        criteria,
      };
    });
  }

  /**
   * PATCH /admin/submissions/:id/review
   * Approve or reject a student submission
   */
  async reviewSubmission(id: number, status: 'PASSED' | 'NEEDS_WORK' | 'EVALUATING', score: number, feedback: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        workspaceTask: {
          include: {
            studentWorkspace: {
              include: {
                enrollmentProject: true,
              },
            },
            templateTask: {
              include: {
                rubric: true,
              },
            },
            progress: true,
          },
        },
        aiReview: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ID ${id} not found`);
    }

    const rubric = submission.workspaceTask?.templateTask?.rubric;
    const maxScore = rubric?.maxScore ?? 100;
    const passThreshold = rubric?.passThreshold ?? 60;
    const clampedScore = Math.max(0, Math.min(score, maxScore));

    // 1. Update submission status
    const updatedSub = await this.prisma.submission.update({
      where: { id },
      data: { status },
    });

    if (status === 'EVALUATING') {
      await this.prisma.taskProgress.upsert({
        where: { workspaceTaskId: submission.workspaceTaskId },
        update: {
          status: 'OPEN',
          passedAt: null,
        },
        create: {
          workspaceTaskId: submission.workspaceTaskId,
          status: 'OPEN',
        },
      });
      return { success: true, submission: updatedSub };
    }

    // 2. Create AI review / manual review entry
    const passed = status === 'PASSED';
    await this.prisma.aiReview.upsert({
      where: { submissionId: id },
      update: {
        score: clampedScore,
        maxScore,
        passed,
        feedback,
      },
      create: {
        submissionId: id,
        score: clampedScore,
        maxScore,
        passed,
        criteriaBreakdown: rubric?.criteria
          ? (typeof rubric.criteria === 'string' ? rubric.criteria : JSON.stringify(rubric.criteria))
          : JSON.stringify([
              { criterion: 'Manual Verification', score: clampedScore, maxScore },
            ]),
        feedback,
      },
    });

    // 3. Update task progress status
    await this.prisma.taskProgress.upsert({
      where: { workspaceTaskId: submission.workspaceTaskId },
      update: {
        status: passed ? 'PASSED' : 'NEEDS_WORK',
        passedAt: passed ? new Date() : null,
      },
      create: {
        workspaceTaskId: submission.workspaceTaskId,
        status: passed ? 'PASSED' : 'NEEDS_WORK',
        passedAt: passed ? new Date() : null,
      },
    });

    // 4. Advance progress if passed (Unlock next task or project)
    if (passed) {
      const task = submission.workspaceTask;
      const studentWorkspaceId = task.studentWorkspaceId;
      const currentOrderIndex = task.orderIndex;

      // Find next task in current workspace
      const nextTask = await this.prisma.workspaceTask.findFirst({
        where: {
          studentWorkspaceId,
          orderIndex: { gt: currentOrderIndex },
        },
        orderBy: { orderIndex: 'asc' },
      });

      if (nextTask) {
        // Unlock next task in DB
        await this.prisma.taskProgress.upsert({
          where: { workspaceTaskId: nextTask.id },
          update: { status: 'OPEN', unlockedAt: new Date() },
          create: { workspaceTaskId: nextTask.id, status: 'OPEN', unlockedAt: new Date() },
        });
      } else {
        // All tasks in this project passed -> mark EnrollmentProject as DONE
        const currentEpId = task.studentWorkspace.enrollmentProjectId;
        const currentEnrollmentId = task.studentWorkspace.enrollmentProject.enrollmentId;
        const currentProjectOrder = task.studentWorkspace.enrollmentProject.orderIndex;

        await this.prisma.enrollmentProject.update({
          where: { id: currentEpId },
          data: { status: 'DONE' },
        });

        // Unlock next EnrollmentProject as ACTIVE
        const nextEp = await this.prisma.enrollmentProject.findFirst({
          where: {
            enrollmentId: currentEnrollmentId,
            orderIndex: { gt: currentProjectOrder },
          },
          orderBy: { orderIndex: 'asc' },
          include: {
            workspace: {
              include: {
                tasks: { orderBy: { orderIndex: 'asc' }, take: 1 },
              },
            },
          },
        });

        if (nextEp) {
          await this.prisma.enrollmentProject.update({
            where: { id: nextEp.id },
            data: { status: 'ACTIVE' },
          });

          // Unlock 1st task of next project
          const nextProjFirstTask = nextEp.workspace?.tasks?.[0];
          if (nextProjFirstTask) {
            await this.prisma.taskProgress.upsert({
              where: { workspaceTaskId: nextProjFirstTask.id },
              update: { status: 'OPEN', unlockedAt: new Date() },
              create: { workspaceTaskId: nextProjFirstTask.id, status: 'OPEN', unlockedAt: new Date() },
            });
          }
        }
      }
    }

    return {
      message: `Submission ${id} reviewed successfully. Status updated to ${status}.`,
      submission: updatedSub,
    };
  }
}
