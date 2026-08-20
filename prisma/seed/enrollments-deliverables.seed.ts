import {
  PrismaClient,
  OrderStatus,
  PaymentStatus,
  CouponStatus,
  EnrollmentStatus,
  EnrolledProjectStatus,
  StepStatus,
  SubmissionStatus,
} from '@prisma/client';

export async function seedEnrollmentsAndDeliverables(prisma: PrismaClient) {
  console.log('🚀 [7/7] Seeding Real-World Orders, Enrollments, Workspace Steps & AI Reviews...');

  // 1. Resolve Dynamic Student and Program Records
  const student1 = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
  const student2 = await prisma.user.findUnique({ where: { email: 'priya.patel@vit.ac.in' } });
  const student3 = await prisma.user.findUnique({ where: { email: 'arjun.nair@iitm.ac.in' } });
  const student4 = await prisma.user.findUnique({ where: { email: 'rohit.verma@gmail.com' } });

  const progFSW = await prisma.program.findUnique({ where: { slug: 'fullstack-web-engineering' } });
  const progAI = await prisma.program.findUnique({ where: { slug: 'applied-ai-machine-learning' } });

  if (!student1 || !student2 || !student3 || !student4 || !progFSW || !progAI) {
    console.warn('⚠️ Some student users or programs not found, skipping partial enrollment deliverables.');
    return;
  }

  // 2. Redeem Coupons for Student 1, 2, 3
  const coupon1 = await prisma.coupon.findFirst({ where: { code: 'VIT-FSW-2026-1001' } });
  if (coupon1) {
    await prisma.coupon.update({
      where: { id: coupon1.id },
      data: { status: CouponStatus.REDEEMED, redeemedByUserId: student1.id, redeemedAt: new Date('2026-07-01') },
    });
  }

  const coupon2 = await prisma.coupon.findFirst({ where: { code: 'VIT-FSW-2026-1002' } });
  if (coupon2) {
    await prisma.coupon.update({
      where: { id: coupon2.id },
      data: { status: CouponStatus.REDEEMED, redeemedByUserId: student2.id, redeemedAt: new Date('2026-07-10') },
    });
  }

  const coupon3 = await prisma.coupon.findFirst({ where: { code: 'IITM-AIML-2026-1001' } });
  if (coupon3) {
    await prisma.coupon.update({
      where: { id: coupon3.id },
      data: { status: CouponStatus.REDEEMED, redeemedByUserId: student3.id, redeemedAt: new Date('2026-07-15') },
    });
  }

  // 3. Orders and Payments
  // Order 1: Rahul Sharma (VIT) - Sponsored by Coupon
  const order1 = await prisma.order.upsert({
    where: { receipt: 'rcpt_vit_rahul_001' },
    update: {
      studentId: student1.id,
      programId: progFSW.id,
      couponId: coupon1?.id,
      amount: 0.0,
      currency: 'INR',
      status: OrderStatus.PAID,
    },
    create: {
      studentId: student1.id,
      programId: progFSW.id,
      couponId: coupon1?.id,
      amount: 0.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      receipt: 'rcpt_vit_rahul_001',
    },
  });

  // Order 2: Priya Patel (VIT) - Sponsored by Coupon
  const order2 = await prisma.order.upsert({
    where: { receipt: 'rcpt_vit_priya_002' },
    update: {
      studentId: student2.id,
      programId: progFSW.id,
      couponId: coupon2?.id,
      amount: 0.0,
      currency: 'INR',
      status: OrderStatus.PAID,
    },
    create: {
      studentId: student2.id,
      programId: progFSW.id,
      couponId: coupon2?.id,
      amount: 0.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      receipt: 'rcpt_vit_priya_002',
    },
  });

  // Order 3: Arjun Nair (IITM) - Sponsored by Coupon
  const order3 = await prisma.order.upsert({
    where: { receipt: 'rcpt_iitm_arjun_003' },
    update: {
      studentId: student3.id,
      programId: progAI.id,
      couponId: coupon3?.id,
      amount: 0.0,
      currency: 'INR',
      status: OrderStatus.PAID,
    },
    create: {
      studentId: student3.id,
      programId: progAI.id,
      couponId: coupon3?.id,
      amount: 0.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      receipt: 'rcpt_iitm_arjun_003',
    },
  });

  // Order 4: Rohit Verma (Direct Learner) - Paid via Razorpay
  const order4 = await prisma.order.upsert({
    where: { receipt: 'rcpt_direct_rohit_004' },
    update: {
      studentId: student4.id,
      programId: progFSW.id,
      amount: 4999.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      gateway: 'razorpay',
      gatewayOrderId: 'order_NxL892348123',
    },
    create: {
      studentId: student4.id,
      programId: progFSW.id,
      amount: 4999.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      gateway: 'razorpay',
      gatewayOrderId: 'order_NxL892348123',
      receipt: 'rcpt_direct_rohit_004',
    },
  });

  // Payment Reconciliation for Order 4
  const existingPayment = await prisma.payment.findFirst({
    where: { orderId: order4.id },
  });
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: order4.id,
        gateway: 'razorpay',
        gatewayPaymentId: 'pay_NxL981249712',
        status: PaymentStatus.CAPTURED,
        amount: 4999.0,
        currency: 'INR',
        method: 'card',
        fee: 99.98,
        tax: 17.99,
        rawPayload: {
          id: 'pay_NxL981249712',
          entity: 'payment',
          amount: 499900,
          currency: 'INR',
          status: 'captured',
          method: 'card',
          card: { network: 'MasterCard', type: 'debit' },
        },
      },
    });
  }

  // 4. Enrollments
  // Enrollment 1: Rahul Sharma - Completed all 3 projects
  let enrollment1 = await prisma.enrollment.findFirst({
    where: { studentId: student1.id, programId: progFSW.id },
  });
  if (!enrollment1) {
    enrollment1 = await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        programId: progFSW.id,
        orderId: order1.id,
        status: EnrollmentStatus.COMPLETED,
        completedAt: new Date('2026-08-10'),
      },
    });
  } else {
    await prisma.enrollment.update({
      where: { id: enrollment1.id },
      data: { status: EnrollmentStatus.COMPLETED, orderId: order1.id },
    });
  }

  // Enrollment 2: Priya Patel - Active in Program 1
  let enrollment2 = await prisma.enrollment.findFirst({
    where: { studentId: student2.id, programId: progFSW.id },
  });
  if (!enrollment2) {
    enrollment2 = await prisma.enrollment.create({
      data: {
        studentId: student2.id,
        programId: progFSW.id,
        orderId: order2.id,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  // Enrollment 3: Arjun Nair - Active in Program 2
  let enrollment3 = await prisma.enrollment.findFirst({
    where: { studentId: student3.id, programId: progAI.id },
  });
  if (!enrollment3) {
    enrollment3 = await prisma.enrollment.create({
      data: {
        studentId: student3.id,
        programId: progAI.id,
        orderId: order3.id,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  // Enrollment 4: Rohit Verma - Active in Program 1
  let enrollment4 = await prisma.enrollment.findFirst({
    where: { studentId: student4.id, programId: progFSW.id },
  });
  if (!enrollment4) {
    enrollment4 = await prisma.enrollment.create({
      data: {
        studentId: student4.id,
        programId: progFSW.id,
        orderId: order4.id,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  // 5. Cloned Workspaces and Tasks for Enrollment 1 (Rahul Sharma)
  const fswProjects = await prisma.project.findMany({
    where: { programId: progFSW.id },
    orderBy: { orderIndex: 'asc' },
  });

  for (let i = 0; i < fswProjects.length; i++) {
    const proj = fswProjects[i];
    const enrolledProj = await prisma.enrollmentProject.upsert({
      where: { enrollmentId_projectId: { enrollmentId: enrollment1.id, projectId: proj.id } },
      update: { orderIndex: i + 1, status: EnrolledProjectStatus.DONE },
      create: { enrollmentId: enrollment1.id, projectId: proj.id, orderIndex: i + 1, status: EnrolledProjectStatus.DONE },
    });

    const template = await prisma.workspaceTemplate.findUnique({ where: { projectId: proj.id } });
    if (template) {
      const workspace = await prisma.studentWorkspace.upsert({
        where: { enrollmentProjectId: enrolledProj.id },
        update: {
          workspaceTemplateId: template.id,
          templateVersion: 1,
          repoUrl: `https://github.com/rahul-sharma/fsw-capstone-project-${proj.id}`,
        },
        create: {
          enrollmentProjectId: enrolledProj.id,
          workspaceTemplateId: template.id,
          templateVersion: 1,
          repoUrl: `https://github.com/rahul-sharma/fsw-capstone-project-${proj.id}`,
        },
      });

      const templateTasks = await prisma.templateTask.findMany({ where: { workspaceTemplateId: template.id } });
      for (const tt of templateTasks) {
        let wTask = await prisma.workspaceTask.findFirst({
          where: { studentWorkspaceId: workspace.id, templateTaskId: tt.id },
        });

        if (!wTask) {
          wTask = await prisma.workspaceTask.create({
            data: {
              studentWorkspaceId: workspace.id,
              templateTaskId: tt.id,
              orderIndex: tt.orderIndex,
              title: tt.title,
              description: tt.description,
            },
          });
        }

        // Task Progress - Passed
        await prisma.taskProgress.upsert({
          where: { workspaceTaskId: wTask.id },
          update: { status: StepStatus.PASSED, resubmissionCount: 1, passedAt: new Date('2026-08-05') },
          create: { workspaceTaskId: wTask.id, status: StepStatus.PASSED, resubmissionCount: 1, passedAt: new Date('2026-08-05') },
        });

        // Submissions and AI Review
        let submission = await prisma.submission.findFirst({
          where: { workspaceTaskId: wTask.id, studentId: student1.id },
        });

        if (!submission) {
          submission = await prisma.submission.create({
            data: {
              workspaceTaskId: wTask.id,
              studentId: student1.id,
              commitHash: 'a7b92f4',
              payloadUrl: `https://github.com/rahul-sharma/fsw-capstone-project-${proj.id}/commit/a7b92f4`,
              status: SubmissionStatus.PASSED,
              attemptIndex: 1,
            },
          });
        }

        // AI Review
        await prisma.aiReview.upsert({
          where: { submissionId: submission.id },
          update: {
            score: 94,
            maxScore: 100,
            passed: true,
            criteriaBreakdown: {
              'Architecture & Structure': '30/30 - Clean domain-driven design',
              'Code Quality & Types': '34/40 - Strongly typed TypeScript with clean interfaces',
              'Testing & Validation': '30/30 - Complete coverage of edge cases',
            },
            feedback:
              'Outstanding implementation! The repository adheres to all architectural constraints, follows clean separation of concerns, and includes comprehensive validation and test assertions.',
          },
          create: {
            submissionId: submission.id,
            score: 94,
            maxScore: 100,
            passed: true,
            criteriaBreakdown: {
              'Architecture & Structure': '30/30 - Clean domain-driven design',
              'Code Quality & Types': '34/40 - Strongly typed TypeScript with clean interfaces',
              'Testing & Validation': '30/30 - Complete coverage of edge cases',
            },
            feedback:
              'Outstanding implementation! The repository adheres to all architectural constraints, follows clean separation of concerns, and includes comprehensive validation and test assertions.',
          },
        });
      }
    }
  }

  // 6. Verifiable Certificate for Rahul Sharma
  await prisma.certificate.upsert({
    where: { enrollmentId: enrollment1.id },
    update: {
      studentId: student1.id,
      uuid: 'EC-CERT-2026-VIT-1048-A91B',
      certificateUrl: 'https://engineersclinic.com/verify/EC-CERT-2026-VIT-1048-A91B',
      issuedAt: new Date('2026-08-11'),
    },
    create: {
      enrollmentId: enrollment1.id,
      studentId: student1.id,
      uuid: 'EC-CERT-2026-VIT-1048-A91B',
      certificateUrl: 'https://engineersclinic.com/verify/EC-CERT-2026-VIT-1048-A91B',
      issuedAt: new Date('2026-08-11'),
    },
  });

  // 7. Workspaces for Priya Patel (All 3 projects seeded: Project 1 ACTIVE, Project 2 & 3 LOCKED)
  for (let i = 0; i < fswProjects.length; i++) {
    const proj = fswProjects[i];
    const projStatus = i === 0 ? EnrolledProjectStatus.ACTIVE : EnrolledProjectStatus.LOCKED;

    const priyaEnrolledProj = await prisma.enrollmentProject.upsert({
      where: { enrollmentId_projectId: { enrollmentId: enrollment2.id, projectId: proj.id } },
      update: { orderIndex: i + 1, status: projStatus },
      create: { enrollmentId: enrollment2.id, projectId: proj.id, orderIndex: i + 1, status: projStatus },
    });

    const fswTemplate = await prisma.workspaceTemplate.findUnique({ where: { projectId: proj.id } });
    if (fswTemplate) {
      const priyaWorkspace = await prisma.studentWorkspace.upsert({
        where: { enrollmentProjectId: priyaEnrolledProj.id },
        update: {
          workspaceTemplateId: fswTemplate.id,
          templateVersion: 1,
          repoUrl: i === 0 ? 'https://github.com/priya-patel-vit/fsw-ecommerce-backend' : null,
        },
        create: {
          enrollmentProjectId: priyaEnrolledProj.id,
          workspaceTemplateId: fswTemplate.id,
          templateVersion: 1,
          repoUrl: i === 0 ? 'https://github.com/priya-patel-vit/fsw-ecommerce-backend' : null,
        },
      });

      const tasks = await prisma.templateTask.findMany({ where: { workspaceTemplateId: fswTemplate.id } });
      for (const tt of tasks) {
        let wTask = await prisma.workspaceTask.findFirst({
          where: { studentWorkspaceId: priyaWorkspace.id, templateTaskId: tt.id },
        });

        if (!wTask) {
          wTask = await prisma.workspaceTask.create({
            data: {
              studentWorkspaceId: priyaWorkspace.id,
              templateTaskId: tt.id,
              orderIndex: tt.orderIndex,
              title: tt.title,
              description: tt.description,
            },
          });
        }

        // For Project 1: Step 1 passed, Step 2 open, Step 3 locked
        // For Project 2 & 3: all tasks locked
        const stepStatus =
          i === 0
            ? tt.orderIndex === 1
              ? StepStatus.PASSED
              : tt.orderIndex === 2
              ? StepStatus.OPEN
              : StepStatus.LOCKED
            : StepStatus.LOCKED;

        await prisma.taskProgress.upsert({
          where: { workspaceTaskId: wTask.id },
          update: { status: stepStatus, resubmissionCount: i === 0 && tt.orderIndex === 1 ? 1 : 0 },
          create: { workspaceTaskId: wTask.id, status: stepStatus, resubmissionCount: i === 0 && tt.orderIndex === 1 ? 1 : 0 },
        });

        if (i === 0 && tt.orderIndex === 1) {
          let sub = await prisma.submission.findFirst({
            where: { workspaceTaskId: wTask.id, studentId: student2.id },
          });

          if (!sub) {
            sub = await prisma.submission.create({
              data: {
                workspaceTaskId: wTask.id,
                studentId: student2.id,
                commitHash: 'b819ac2',
                payloadUrl: 'https://github.com/priya-patel-vit/fsw-ecommerce-backend/commit/b819ac2',
                status: SubmissionStatus.PASSED,
                attemptIndex: 1,
              },
            });
          }

          await prisma.aiReview.upsert({
            where: { submissionId: sub.id },
            update: {
              score: 89,
              maxScore: 100,
              passed: true,
              criteriaBreakdown: {
                'Schema Normalization': '28/30',
                'Migration Integrity': '27/30',
                'Type Safety': '34/40',
              },
              feedback:
                'Great schema design and clean entity relationships. All migrations applied cleanly without errors.',
            },
            create: {
              submissionId: sub.id,
              score: 89,
              maxScore: 100,
              passed: true,
              criteriaBreakdown: {
                'Schema Normalization': '28/30',
                'Migration Integrity': '27/30',
                'Type Safety': '34/40',
              },
              feedback:
                'Great schema design and clean entity relationships. All migrations applied cleanly without errors.',
            },
          });
        }
      }
    }
  }

  console.log('  ✅ Real-world Orders, Paid Transactions, Student Workspaces, Submissions & Certificates seeded successfully');
}
