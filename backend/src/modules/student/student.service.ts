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
                tasks: {
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

    let totalWorkspaceTasks = 0;
    let passedWorkspaceTasks = 0;
    let hoursLogged = 0;
    let completedProjectsCount = 0;

    const projectTracks = selectedProjects.map((ep, pIdx) => {
      const projTasks = ep.workspace?.tasks || [];
      const taskCount = projTasks.length || 1;
      const hoursPerTask = hoursPerProject / taskCount;

      let projPassedTasks = 0;
      projTasks.forEach((t) => {
        totalWorkspaceTasks++;
        if (t.progress?.status === 'PASSED') {
          passedWorkspaceTasks++;
          projPassedTasks++;
          hoursLogged += hoursPerTask;
        }
      });

      const isDone = taskCount > 0 && projPassedTasks === taskCount;
      if (isDone) {
        completedProjectsCount++;
      }

      let status = 'Locked';
      if (isDone) {
        status = 'Done';
      } else if (pIdx === 0 || (pIdx > 0 && selectedProjects[pIdx - 1]?.workspace?.tasks.every((t) => t.progress?.status === 'PASSED'))) {
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
    const completionPercentage = totalWorkspaceTasks > 0
      ? Math.round((passedWorkspaceTasks / totalWorkspaceTasks) * 100)
      : 0;

    // Submissions & AI Reviews metrics
    const submissions = await this.prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        aiReview: true,
        workspaceTask: true,
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
        taskTitle: latestAiReviewSubmission.workspaceTask.title,
        stepTitle: latestAiReviewSubmission.workspaceTask.title,
        status: latestAiReviewSubmission.status,
        score: r.score,
        maxScore: r.maxScore,
        breakdown: r.criteriaBreakdown,
        feedback: r.feedback,
      };
    }
    // Find the first actionable active task
    let currentActiveTask: any = null;
    let totalTasksPassed = 0;
    let totalTasksCount = 0;

    for (const ep of selectedProjects) {
      const pTasks = ep.workspace?.tasks || [];
      for (const t of pTasks) {
        totalTasksCount++;
        if (t.progress?.status === 'PASSED') {
          totalTasksPassed++;
        } else if (!currentActiveTask && (t.progress?.status === 'OPEN' || t.progress?.status === 'NEEDS_WORK' || ep.status === 'ACTIVE')) {
          currentActiveTask = {
            taskId: t.id,
            taskTitle: t.title,
            projectTitle: ep.project.title,
            projectId: ep.project.id,
            orderIndex: t.orderIndex,
            repoUrl: ep.workspace?.repoUrl || null,
            workspaceId: ep.workspace?.id || null,
            status: t.progress?.status || 'OPEN',
          };
        }
      }
    }

    // Check certificate status
    const certificate = await this.prisma.certificate.findFirst({
      where: { enrollmentId: enrollment.id },
    });

    return {
      firstName: student.firstName,
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
        totalTasks: totalTasksCount,
        passedTasks: totalTasksPassed,
        certificateStatus: certificate ? 'ISSUED' : completionPercentage >= 100 ? 'ELIGIBLE' : 'IN_PROGRESS',
        certificateUrl: certificate?.certificateUrl || null,
      },
      currentActiveTask,
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
                tasks: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    templateTask: {
                      include: {
                        resources: true,
                        rubric: true,
                      },
                    },
                    progress: true,
                    submissions: {
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                      include: {
                        aiReview: true,
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

    return enrollments.map((enrollment) => {
      const totalProgramHours = enrollment.program.durationHours || 120;
      const selectedProjects = enrollment.selectedProjects || [];
      const totalProjects = selectedProjects.length || 3;
      const hoursPerProject = totalProgramHours / (totalProjects || 1);

      let totalWorkspaceTasks = 0;
      let passedWorkspaceTasks = 0;
      let hoursLogged = 0;
      let completedProjectsCount = 0;

      const formattedProjects = selectedProjects.map((ep, pIdx) => {
        const projTasks = ep.workspace?.tasks || [];
        const taskCount = projTasks.length || 1;
        const hoursPerTask = hoursPerProject / taskCount;

        // Directly read stored database project status (DONE, ACTIVE, LOCKED)
        const projectStatus = ep.status === 'DONE' ? 'Done' : ep.status === 'ACTIVE' ? 'Active' : 'Locked';

        if (ep.status === 'DONE') {
          completedProjectsCount++;
        }

        const formattedTasks = projTasks.map((t) => {
          totalWorkspaceTasks++;
          // Directly read stored database task status (PASSED, OPEN, NEEDS_WORK, LOCKED)
          const storedTaskStatus = t.progress?.status || 'LOCKED';
          if (storedTaskStatus === 'PASSED') {
            passedWorkspaceTasks++;
            hoursLogged += hoursPerTask;
          }

          const latestSub = t.submissions?.[0];
          const latestReview = latestSub?.aiReview;

          let criteriaBreakdown: any = null;
          if (latestReview?.criteriaBreakdown) {
            if (typeof latestReview.criteriaBreakdown === 'string') {
              try {
                criteriaBreakdown = JSON.parse(latestReview.criteriaBreakdown);
              } catch {
                criteriaBreakdown = null;
              }
            } else {
              criteriaBreakdown = latestReview.criteriaBreakdown;
            }
          }

          let rubricCriteria: any = null;
          if (t.templateTask?.rubric?.criteria) {
            if (typeof t.templateTask.rubric.criteria === 'string') {
              try {
                rubricCriteria = JSON.parse(t.templateTask.rubric.criteria);
              } catch {
                rubricCriteria = null;
              }
            } else {
              rubricCriteria = t.templateTask.rubric.criteria;
            }
          }

          return {
            id: t.id,
            title: t.title,
            description: t.description,
            orderIndex: t.orderIndex,
            status: storedTaskStatus,
            resources: t.templateTask?.resources || [],
            rubric: t.templateTask?.rubric
              ? {
                  id: t.templateTask.rubric.id,
                  maxScore: t.templateTask.rubric.maxScore || 100,
                  passThreshold: t.templateTask.rubric.passThreshold || 60,
                  criteria: rubricCriteria,
                }
              : null,
            latestSubmission: latestSub
              ? {
                  id: latestSub.id,
                  commitHash: latestSub.commitHash,
                  payloadUrl: latestSub.payloadUrl,
                  submittedAt: latestSub.createdAt,
                }
              : null,
            latestReview: latestReview
              ? {
                  score: latestReview.score,
                  maxScore: latestReview.maxScore || t.templateTask?.rubric?.maxScore || 100,
                  passThreshold: t.templateTask?.rubric?.passThreshold || 60,
                  feedback: latestReview.feedback,
                  criteriaBreakdown,
                  submittedAt: latestSub?.createdAt,
                }
              : null,
          };
        });

        return {
          id: ep.project.id,
          title: ep.project.title,
          description: ep.project.description,
          orderIndex: ep.orderIndex,
          status: projectStatus,
          workspaceId: ep.workspace?.id ?? null,
          repoUrl: ep.workspace?.repoUrl ?? null,
          workspaceTemplate: {
            id: ep.workspace?.workspaceTemplateId || ep.project.id,
            version: ep.workspace?.templateVersion || 1,
            repoUrl: ep.workspace?.repoUrl ?? null,
            tasks: formattedTasks,
          },
        };
      });

      const clusterName = enrollment.program.topics?.[0]?.topic?.cluster?.name || 'Engineering Stream';
      const completionPercentage = totalWorkspaceTasks > 0
        ? Math.round((passedWorkspaceTasks / totalWorkspaceTasks) * 100)
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
                tasks: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    progress: true,
                    templateTask: {
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
        workspaceTask: {
          include: {
            studentWorkspace: true,
          },
        },
        aiReview: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((sub) => ({
      id: sub.id,
      workspaceTaskId: sub.workspaceTaskId,
      workspaceStepId: sub.workspaceTaskId,
      taskTitle: sub.workspaceTask.title,
      stepTitle: sub.workspaceTask.title,
      submittedAt: sub.createdAt,
      status: sub.status,
      attemptIndex: sub.attemptIndex,
      commitHash: sub.commitHash ?? null,
      repoUrl: sub.workspaceTask.studentWorkspace?.repoUrl ?? null,
      payloadUrl: sub.payloadUrl,
      evaluator: 'AI Reviewer Engine (BullMQ Worker)',
      score: sub.aiReview?.score ?? null,
      maxScore: sub.aiReview?.maxScore ?? 100,
      feedback: sub.aiReview?.feedback ?? null,
      criteriaBreakdown: sub.aiReview?.criteriaBreakdown ?? null,
    }));
  }

  /**
   * PATCH /student/workspace/:workspaceId/repo
   * Set or update GitHub repository URL for a student project workspace
   */
  async updateWorkspaceRepo(userId: number, workspaceId: number, repoUrl: string) {
    const workspace = await this.prisma.studentWorkspace.findUnique({
      where: { id: workspaceId },
      include: {
        enrollmentProject: {
          include: {
            enrollment: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Student workspace ID ${workspaceId} not found`);
    }

    if (workspace.enrollmentProject.enrollment.studentId !== userId) {
      throw new ForbiddenException('You do not have permission to configure this project workspace');
    }

    // Clean up repo URL
    const cleanedUrl = repoUrl.trim().replace(/\.git\/?$/, '').replace(/\/+$/, '');

    const updated = await this.prisma.studentWorkspace.update({
      where: { id: workspaceId },
      data: { repoUrl: cleanedUrl },
    });

    return {
      message: 'GitHub repository linked successfully',
      workspaceId: updated.id,
      repoUrl: updated.repoUrl,
    };
  }

  /**
   * POST /student/submissions
   * Submit deliverable for a workspace step (commit hash or repo payload)
   */
  async createSubmission(userId: number, dto: CreateSubmissionDto) {
    const task = await this.prisma.workspaceTask.findUnique({
      where: { id: dto.workspaceTaskId },
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
        templateTask: {
          include: {
            rubric: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Workspace task ID ${dto.workspaceTaskId} not found`);
    }

    const taskStudentId = task.studentWorkspace.enrollmentProject.enrollment.studentId;
    if (taskStudentId !== userId) {
      throw new ForbiddenException('You do not have permission to submit to this workspace task');
    }

    const currentResubmissionCount = task.progress?.resubmissionCount || 0;
    if (currentResubmissionCount >= 5) {
      throw new BadRequestException('Resubmission limit reached (5 attempts max). Task routed to manual mentor review.');
    }

    let finalPayloadUrl = dto.payloadUrl ? dto.payloadUrl.trim() : '';
    let finalCommitHash = dto.commitHash ? dto.commitHash.trim() : null;

    if (finalCommitHash) {
      // Clean commit hash (strip commit/ prefix if pasted full URL)
      const commitMatch = finalCommitHash.match(/([a-f0-9]{6,40})/i);
      if (commitMatch) {
        finalCommitHash = commitMatch[1];
      }

      const workspaceRepo = task.studentWorkspace.repoUrl;
      if (workspaceRepo) {
        const cleanRepo = workspaceRepo.replace(/\.git\/?$/, '').replace(/\/+$/, '');
        finalPayloadUrl = `${cleanRepo}/commit/${finalCommitHash}`;
      } else if (!finalPayloadUrl) {
        throw new BadRequestException(
          'Please link a GitHub repository to this project before submitting task commit hashes.'
        );
      }
    } else if (finalPayloadUrl) {
      const match = finalPayloadUrl.match(/\/commit\/([a-f0-9]{6,40})/i);
      if (match) {
        finalCommitHash = match[1];
      }
    } else {
      throw new BadRequestException('A valid commit hash or deliverable URL is required.');
    }

    const submission = await this.prisma.submission.create({
      data: {
        workspaceTaskId: dto.workspaceTaskId,
        studentId: userId,
        commitHash: finalCommitHash,
        payloadUrl: finalPayloadUrl,
        status: 'EVALUATING',
        attemptIndex: currentResubmissionCount + 1,
      },
    });

    // Update current TaskProgress status to MANUAL_REVIEW (pending admin evaluation)
    await this.prisma.taskProgress.upsert({
      where: { workspaceTaskId: dto.workspaceTaskId },
      update: {
        status: 'MANUAL_REVIEW',
        resubmissionCount: currentResubmissionCount + 1,
      },
      create: {
        workspaceTaskId: dto.workspaceTaskId,
        status: 'MANUAL_REVIEW',
        resubmissionCount: currentResubmissionCount + 1,
        unlockedAt: new Date(),
      },
    });

    return submission;
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
                tasks: {
                  include: {
                    templateTask: {
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
      ep.workspace?.tasks.forEach((t) => {
        if (t.templateTask.rubric) {
          rubricsList.push({
            stepId: t.id,
            stepTitle: t.title,
            passThreshold: t.templateTask.rubric.passThreshold,
            criteria: t.templateTask.rubric.criteria,
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
