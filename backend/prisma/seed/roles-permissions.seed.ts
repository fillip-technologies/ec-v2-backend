import { PrismaClient } from '@prisma/client';

export async function seedRolesAndPermissions(prisma: PrismaClient) {
  console.log('🛡️ [2/7] Seeding Roles, Permissions & RBAC Matrix...');

  // 1. Roles Definition
  const roles = [
    { id: 1, name: 'super_admin' },
    { id: 2, name: 'admin' },
    { id: 3, name: 'college' },
    { id: 4, name: 'student' },
    { id: 5, name: 'support' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: { id: role.id, name: role.name },
    });
  }

  // 2. Granular Permissions Definition
  const permissionsData = [
    // Catalogue Management
    {
      id: 1,
      slug: 'program:publish',
      name: 'Publish Program',
      module: 'catalogue',
      description: 'Publish and archive catalog internship programs',
      roleIds: [1, 2],
    },
    {
      id: 2,
      slug: 'program:create',
      name: 'Create Program',
      module: 'catalogue',
      description: 'Create new catalog curriculum programs',
      roleIds: [1, 2],
    },
    {
      id: 3,
      slug: 'program:update',
      name: 'Update Program',
      module: 'catalogue',
      description: 'Update catalog program details, pricing, and FAQs',
      roleIds: [1, 2],
    },
    {
      id: 4,
      slug: 'project:create',
      name: 'Create Project',
      module: 'catalogue',
      description: 'Create capstone project blueprints in programs',
      roleIds: [1, 2],
    },
    {
      id: 5,
      slug: 'project:edit',
      name: 'Edit Project',
      module: 'catalogue',
      description: 'Edit capstone project blueprints and workspace templates',
      roleIds: [1, 2, 3],
    },
    {
      id: 6,
      slug: 'step:create',
      name: 'Create Step',
      module: 'catalogue',
      description: 'Add workspace template steps and milestones to projects',
      roleIds: [1, 2],
    },
    {
      id: 7,
      slug: 'task:create',
      name: 'Create Task',
      module: 'catalogue',
      description: 'Add deliverable tasks to workspace steps',
      roleIds: [1, 2],
    },

    // AI Evaluation & Grading Subsystem
    {
      id: 8,
      slug: 'rubric:configure',
      name: 'Configure AI Rubric',
      module: 'evaluation',
      description: 'Configure automated AI rubric criteria and pass thresholds',
      roleIds: [1, 2],
    },
    {
      id: 9,
      slug: 'submission:grade',
      name: 'Manual Grade Submission',
      module: 'evaluation',
      description: 'Manual override evaluation for student task submissions',
      roleIds: [1, 2, 5],
    },

    // B2B College Institution Management
    {
      id: 10,
      slug: 'college:manage',
      name: 'Manage Colleges',
      module: 'b2b',
      description: 'Manage college profiles, member coordinators, and seat allocations',
      roleIds: [1, 2, 3, 5],
    },
    {
      id: 11,
      slug: 'college:vet',
      name: 'Vet College Application',
      module: 'b2b',
      description: 'Approve or reject college institutional partner applications',
      roleIds: [1, 2],
    },

    // Admin & User Operations
    {
      id: 12,
      slug: 'user:manage',
      name: 'Manage Users',
      module: 'admin',
      description: 'Manage platform user accounts, status activations, and roles',
      roleIds: [1, 2],
    },
    {
      id: 13,
      slug: 'student:read',
      name: 'View Student Details',
      module: 'admin',
      description: 'View 360-degree student dossier (academics, steps, reviews, orders)',
      roleIds: [1, 2, 5],
    },

    // Commerce & Coupon Management
    {
      id: 14,
      slug: 'coupon:generate',
      name: 'Generate Coupons',
      module: 'commerce',
      description: 'Generate discount codes and zero-cost B2B coupon batches',
      roleIds: [1, 2, 3],
    },
    {
      id: 15,
      slug: 'order:view',
      name: 'View Orders',
      module: 'commerce',
      description: 'View student order billing and gateway reconciliation records',
      roleIds: [1, 2, 5],
    },

    // Learning & Delivery
    {
      id: 16,
      slug: 'project:enroll',
      name: 'Enrol & Execute Project',
      module: 'delivery',
      description: 'Enrol in programs, execute workspace tasks, and submit deliverables',
      roleIds: [4],
    },

    // Credentials & Certificates
    {
      id: 17,
      slug: 'certificate:issue',
      name: 'Issue Certificate',
      module: 'credentials',
      description: 'Issue verifiable completion certificates to learners',
      roleIds: [1, 2],
    },
    {
      id: 18,
      slug: 'certificate:revoke',
      name: 'Revoke Certificate',
      module: 'credentials',
      description: 'Revoke student completion certificates on integrity violations',
      roleIds: [1, 2],
    },

    // Analytics & Telemetry
    {
      id: 19,
      slug: 'report:view',
      name: 'View Reports',
      module: 'analytics',
      description: 'View progress telemetry and institutional cohort reports',
      roleIds: [1, 2, 3, 4, 5],
    },
  ];

  for (const p of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        module: p.module,
        description: p.description,
      },
      create: {
        slug: p.slug,
        name: p.name,
        module: p.module,
        description: p.description,
      },
    });

    for (const rId of p.roleIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: rId, permissionId: permission.id } },
        update: {},
        create: { roleId: rId, permissionId: permission.id },
      });
    }
  }

  console.log(`  ✅ ${roles.length} Roles & ${permissionsData.length} Permissions matrix seeded successfully`);
}
