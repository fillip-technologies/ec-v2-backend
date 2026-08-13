import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates grade string from average numerical score
   */
  private calculateGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    return 'Needs Work';
  }

  /**
   * GET /student/overview
   * Computes live student progress metrics, recent AI evaluation review, and capstone project tracks
   */
  async getOverview(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userid: userId },
      include: { college: true },
    });

    if (!student) {
      throw new NotFoundException(`Student profile for user ID ${userId} not found`);
    }

    // Fetch active or latest enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId: userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        program: true,
        selectedProjects: {
          orderBy: { orderIndex: 'asc' },
          include: {
            project: true,
            workspace: {
              include: {
                steps: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    progress: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      // Fallback empty metrics structure if no active enrollment
      return {
        programTitle: 'Full Stack Web Engineering (MERN & Next.js)',
        programSlug: 'fullstack-web-engineering-mern-nextjs',
        metrics: {
          hoursLogged: 0,
          totalHours: 120,
          completionPercentage: 0,
          projectsDone: 0,
          totalProjects: 3,
          currentScore: 0,
          maxScore: 100,
          grade: 'N/A',
          totalSubmissions: 0,
          gradedSubmissions: 0,
        },
        recentAiReview: null,
        projects: [],
      };
    }

    const totalProgramHours = enrollment.program.durationHours || 120;
    const selectedProjects = enrollment.selectedProjects || [];
    const totalProjects = selectedProjects.length || 3;
    const hoursPerProject = totalProgramHours / (totalProjects || 1);

    let totalWorkspaceSteps = 0;
    let passedWorkspaceSteps = 0;
    let hoursLogged = 0;
    let completedProjectsCount = 0;

    const projectTracks = selectedProjects.map((ep, pIdx) => {
      const projSteps = ep.workspace?.steps || [];
      const stepCount = projSteps.length || 1;
      const hoursPerStep = hoursPerProject / stepCount;

      let projPassedSteps = 0;
      projSteps.forEach((st) => {
        totalWorkspaceSteps++;
        if (st.progress?.status === 'PASSED') {
          passedWorkspaceSteps++;
          projPassedSteps++;
          hoursLogged += hoursPerStep;
        }
      });

      const isDone = stepCount > 0 && projPassedSteps === stepCount;
      if (isDone) {
        completedProjectsCount++;
      }

      let status = 'Locked';
      if (isDone) {
        status = 'Done';
      } else if (pIdx === 0 || (pIdx > 0 && selectedProjects[pIdx - 1]?.workspace?.steps.every((s) => s.progress?.status === 'PASSED'))) {
        status = 'Active';
      }

      return {
        id: ep.project.id,
        title: ep.project.title,
        description: ep.project.description,
        orderIndex: ep.orderIndex,
        hours: Math.round(hoursPerProject),
        status,
      };
    });

    const roundedHoursLogged = Math.round(hoursLogged);
    const completionPercentage = totalWorkspaceSteps > 0
      ? Math.round((passedWorkspaceSteps / totalWorkspaceSteps) * 100)
      : 0;

    // Submissions & AI Reviews metrics
    const submissions = await this.prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        aiReview: true,
        workspaceStep: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSubmissions = submissions.length;
    const gradedSubmissionsList = submissions.filter((s) => s.aiReview !== null);
    const gradedSubmissionsCount = gradedSubmissionsList.length;

    let averageScore = 0;
    if (gradedSubmissionsCount > 0) {
      const totalScoreSum = gradedSubmissionsList.reduce((acc, s) => acc + (s.aiReview?.score || 0), 0);
      averageScore = Math.round(totalScoreSum / gradedSubmissionsCount);
    }

    const latestAiReviewSubmission = gradedSubmissionsList[0] || null;
    let recentAiReview: any = null;
    if (latestAiReviewSubmission && latestAiReviewSubmission.aiReview) {
      const r = latestAiReviewSubmission.aiReview;
      recentAiReview = {
        stepTitle: latestAiReviewSubmission.workspaceStep.title,
        status: latestAiReviewSubmission.status,
        score: r.score,
        maxScore: r.maxScore,
        breakdown: r.criteriaBreakdown,
        feedback: r.feedback,
        improvements: r.improvements,
      };
    }

    return {
      programTitle: enrollment.program.title,
      programSlug: enrollment.program.slug,
      metrics: {
        hoursLogged: roundedHoursLogged,
        totalHours: totalProgramHours,
        completionPercentage,
        projectsDone: completedProjectsCount,
        totalProjects,
        currentScore: averageScore,
        maxScore: 100,
        grade: averageScore > 0 ? this.calculateGrade(averageScore) : 'N/A',
        totalSubmissions,
        gradedSubmissions: gradedSubmissionsCount,
      },
      recentAiReview,
      projects: projectTracks,
    };
  }

  /**
   * GET /student/profile
   */
  async getProfile(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userid: userId },
      include: {
        user: true,
        college: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student profile for user ID ${userId} not found`);
    }

    return {
      id: student.userid,
      firstName: student.firstName,
      lastName: student.lastName,
      displayName: `${student.firstName} ${student.lastName}`.trim(),
      email: student.user.email,
      phoneNo: student.user.phoneNo,
      institutionName: student.college?.name || 'Vellore Institute of Technology (VIT)',
      verificationStatus: student.user.status === 'active' ? 'Active Student Enrolment' : 'Pending Verification',
      referralCode: `EC-S-${student.userid}`,
    };
  }

  /**
   * GET /student/programs
   * Retrieves all enrolled programs for the student with live database details, progress metrics, and nested capstone projects
   */
  async getPrograms(userId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        program: {
          include: {
            topics: {
              include: {
                topic: {
                  include: {
                    cluster: true,
                  },
                },
              },
            },
          },
        },
        selectedProjects: {
          orderBy: { orderIndex: 'asc' },
          include: {
            project: true,
            workspace: {
              include: {
                steps: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    tasks: {
                      include: {
                        templateTask: {
                          include: {
                            resources: true,
                          },
                        },
                      },
                    },
                    progress: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrollments.map((enrollment) => {
      const totalProgramHours = enrollment.program.durationHours || 120;
      const selectedProjects = enrollment.selectedProjects || [];
      const totalProjects = selectedProjects.length || 3;
      const hoursPerProject = totalProgramHours / (totalProjects || 1);

      let totalWorkspaceSteps = 0;
      let passedWorkspaceSteps = 0;
      let hoursLogged = 0;
      let completedProjectsCount = 0;

      const formattedProjects = selectedProjects.map((ep, pIdx) => {
        const projSteps = ep.workspace?.steps || [];
        const stepCount = projSteps.length || 1;
        const hoursPerStep = hoursPerProject / stepCount;

        let projPassedSteps = 0;
        const formattedSteps = projSteps.map((st) => {
          totalWorkspaceSteps++;
          const isStepPassed = st.progress?.status === 'PASSED';
          if (isStepPassed) {
            passedWorkspaceSteps++;
            projPassedSteps++;
            hoursLogged += hoursPerStep;
          }

          return {
            id: st.id,
            title: st.title,
            description: st.description,
            orderIndex: st.orderIndex,
            status: st.progress?.status || 'LOCKED',
            tasks: st.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              resources: t.templateTask?.resources || [],
            })),
          };
        });

        const isDone = stepCount > 0 && projPassedSteps === stepCount;
        if (isDone) {
          completedProjectsCount++;
        }

        return {
          id: ep.project.id,
          title: ep.project.title,
          description: ep.project.description,
          orderIndex: ep.orderIndex,
          workspaceTemplate: {
            id: ep.workspace?.workspaceTemplateId || ep.project.id,
            version: ep.workspace?.templateVersion || 1,
            steps: formattedSteps,
          },
        };
      });

      const clusterName = enrollment.program.topics?.[0]?.topic?.cluster?.name || 'Engineering Stream';
      const completionPercentage = totalWorkspaceSteps > 0
        ? Math.round((passedWorkspaceSteps / totalWorkspaceSteps) * 100)
        : 0;

      return {
        id: enrollment.program.id,
        enrollmentId: enrollment.id,
        title: enrollment.program.title,
        slug: enrollment.program.slug,
        clusterName,
        durationHours: totalProgramHours,
        description: enrollment.program.description,
        outcomes: enrollment.program.outcomes,
        status: enrollment.status,
        hoursLogged: Math.round(hoursLogged),
        completionPercentage,
        projectsDone: completedProjectsCount,
        totalProjects,
        projects: formattedProjects,
      };
    });
  }

  /**
   * GET /student/workspace
   * Retrieves active enrollment workspace snapshot with steps, tasks, and resources
   */
  async getWorkspace(userId: number) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId: userId, status: 'ACTIVE' },
      orderBy: { enrolledAt: 'desc' },
      include: {
        program: true,
        selectedProjects: {
          orderBy: { orderIndex: 'asc' },
          include: {
            project: {
              include: {
                resources: true,
              },
            },
            workspace: {
              include: {
                steps: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    tasks: true,
                    progress: true,
                    templateStep: {
                      include: {
                        rubric: true,
                        resources: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`No active workspace enrollment found for student user ID ${userId}`);
    }

    return enrollment;
  }

  /**
   * GET /student/submissions
   */
  async getSubmissions(userId: number) {
    const submissions = await this.prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        workspaceStep: true,
        aiReview: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((sub) => ({
      id: sub.id,
      workspaceStepId: sub.workspaceStepId,
      stepTitle: sub.workspaceStep.title,
      submittedAt: sub.createdAt,
      status: sub.status,
      attemptIndex: sub.attemptIndex,
      evaluator: 'AI Reviewer Engine (BullMQ Worker)',
      score: sub.aiReview?.score ?? null,
      maxScore: sub.aiReview?.maxScore ?? 100,
      feedback: sub.aiReview?.feedback ?? null,
      criteriaBreakdown: sub.aiReview?.criteriaBreakdown ?? null,
    }));
  }

  /**
   * POST /student/submissions
   * Submit deliverable for a workspace step
   */
  async createSubmission(userId: number, dto: CreateSubmissionDto) {
    const step = await this.prisma.workspaceStep.findUnique({
      where: { id: dto.workspaceStepId },
      include: {
        studentWorkspace: {
          include: {
            enrollmentProject: {
              include: {
                enrollment: true,
              },
            },
          },
        },
        progress: true,
        templateStep: {
          include: {
            rubric: true,
          },
        },
      },
    });

    if (!step) {
      throw new NotFoundException(`Workspace step ID ${dto.workspaceStepId} not found`);
    }

    const stepStudentId = step.studentWorkspace.enrollmentProject.enrollment.studentId;
    if (stepStudentId !== userId) {
      throw new ForbiddenException('You do not have permission to submit to this workspace step');
    }

    const currentResubmissionCount = step.progress?.resubmissionCount || 0;
    if (currentResubmissionCount >= 5) {
      throw new BadRequestException('Resubmission limit reached (5 attempts max). Step routed to manual mentor review.');
    }

    const submission = await this.prisma.submission.create({
      data: {
        workspaceStepId: dto.workspaceStepId,
        studentId: userId,
        payloadUrl: dto.payloadUrl,
        status: 'PASSED',
        attemptIndex: currentResubmissionCount + 1,
      },
    });

    // Auto-grade simulation for demo / evaluation
    const score = 88;
    const passed = score >= (step.templateStep.rubric?.passThreshold || 60);

    const aiReview = await this.prisma.aiReview.create({
      data: {
        submissionId: submission.id,
        score,
        maxScore: 100,
        passed,
        criteriaBreakdown: [
          { criterion: 'Architecture Cleanliness', score: 45, maxScore: 50 },
          { criterion: 'Code Quality & Unit Tests', score: 43, maxScore: 50 },
        ],
        feedback: 'Clean API controller isolation and zero lint errors across all microservice routes.',
        improvements: 'Consider adding Redis caching for hot paths.',
      },
    });

    // Update StepProgress status
    await this.prisma.stepProgress.upsert({
      where: { workspaceStepId: dto.workspaceStepId },
      update: {
        status: passed ? 'PASSED' : 'NEEDS_WORK',
        resubmissionCount: currentResubmissionCount + 1,
        passedAt: passed ? new Date() : null,
      },
      create: {
        workspaceStepId: dto.workspaceStepId,
        status: passed ? 'PASSED' : 'NEEDS_WORK',
        resubmissionCount: currentResubmissionCount + 1,
        unlockedAt: new Date(),
        passedAt: passed ? new Date() : null,
      },
    });

    return {
      submissionId: submission.id,
      status: submission.status,
      score: aiReview.score,
      passed,
      aiReview,
    };
  }

  /**
   * GET /student/rubrics
   */
  async getRubrics(userId: number) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId: userId, status: 'ACTIVE' },
      orderBy: { enrolledAt: 'desc' },
      include: {
        selectedProjects: {
          include: {
            workspace: {
              include: {
                steps: {
                  include: {
                    templateStep: {
                      include: {
                        rubric: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return [];
    }

    const rubricsList: Array<{
      stepId: number;
      stepTitle: string;
      passThreshold: number;
      criteria: any;
    }> = [];

    enrollment.selectedProjects.forEach((ep) => {
      ep.workspace?.steps.forEach((st) => {
        if (st.templateStep.rubric) {
          rubricsList.push({
            stepId: st.id,
            stepTitle: st.title,
            passThreshold: st.templateStep.rubric.passThreshold,
            criteria: st.templateStep.rubric.criteria,
          });
        }
      });
    });

    return rubricsList;
  }

  /**
   * GET /student/certificates
   */
  async getCertificates(userId: number) {
    const certificates = await this.prisma.certificate.findMany({
      where: { studentId: userId },
      include: {
        enrollment: {
          include: {
            program: true,
          },
        },
      },
    });

    return certificates.map((c) => ({
      id: c.id,
      uuid: c.uuid,
      programTitle: c.enrollment.program.title,
      certificateUrl: c.certificateUrl,
      issuedAt: c.issuedAt,
      verifyUrl: `/certificates/verify/${c.uuid}`,
    }));
  }
}
