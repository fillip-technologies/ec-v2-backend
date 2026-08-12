import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

async function main() {
  const user = process.env.DATABASE_USER || 'engineers_user';
  const rawPassword =
    process.env.DATABASE_PASSWORD !== undefined ? process.env.DATABASE_PASSWORD : 'password123';
  const password = rawPassword ? encodeURIComponent(rawPassword) : '';
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = process.env.DATABASE_PORT || '3306';
  const database = process.env.DATABASE_NAME || 'engineers_clinic';

  const connectionString = password
    ? `mysql://${user}:${password}@${host}:${port}/${database}`
    : `mysql://${user}@${host}:${port}/${database}`;

  const adapter = new PrismaMariaDb(connectionString);
  const prisma = new PrismaClient({ adapter });

  console.log(
    '🌱 Seeding default roles (1: super_admin, 2: admin, 3: college, 4: student, 5: support)...',
  );

  const roles = [
    { id: 1, name: 'super_admin' },
    { id: 2, name: 'admin' },
    { id: 3, name: 'college' },
    { id: 4, name: 'student' },
    { id: 5, name: 'support' },
  ];

  for (const role of roles) {
    const upserted = await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: { id: role.id, name: role.name },
    });
    console.log(`  ✅ Role [ID ${upserted.id}]: '${upserted.name}'`);
  }

  console.log('🌱 Seeding default country (1: India)...');

  const country = await prisma.country.upsert({
    where: { id: 1 },
    update: {
      name: 'India',
      isoCode: 'IN',
      defaultLocal: 'en-IN',
      timezone: 'Asia/Kolkata',
      currencyCode: 'INR',
      isActive: true,
    },
    create: {
      id: 1,
      name: 'India',
      isoCode: 'IN',
      defaultLocal: 'en-IN',
      timezone: 'Asia/Kolkata',
      currencyCode: 'INR',
      isActive: true,
    },
  });

  console.log(`  ✅ Country [ID ${country.id}]: '${country.name}' (${country.isoCode})`);

  console.log('🌱 Seeding Clusters & Topics...');

  const clustersData = [
    {
      id: 1,
      slug: 'software-engineering',
      name: 'Software Engineering & Full Stack',
      description: 'Web, Mobile, and Distributed Software Systems Engineering',
      topics: [
        { id: 1, slug: 'fullstack-web-dev', name: 'Full Stack Web Development', isActive: true },
        { id: 2, slug: 'mobile-app-dev', name: 'Mobile Application Engineering', isActive: true },
      ],
    },
    {
      id: 2,
      slug: 'ai-data-science',
      name: 'Artificial Intelligence & Data Science',
      description: 'Machine Learning, Deep Learning, LLMs, and Data Engineering',
      topics: [
        { id: 3, slug: 'machine-learning', name: 'Machine Learning & Neural Networks', isActive: true },
        { id: 4, slug: 'data-analytics', name: 'Data Analytics & Big Data', isActive: true },
      ],
    },
    {
      id: 3,
      slug: 'cloud-devops',
      name: 'Cloud Computing & DevOps',
      description: 'Cloud Architecture, Containerization, and CI/CD Automation',
      topics: [
        { id: 5, slug: 'cloud-architecture', name: 'Cloud Native Architecture', isActive: true },
        { id: 6, slug: 'devops-automation', name: 'DevOps & CI/CD Pipelines', isActive: true },
      ],
    },
    {
      id: 4,
      slug: 'cybersecurity',
      name: 'Cybersecurity & Ethical Hacking',
      description: 'Network Security, Vulnerability Assessment, and Defense',
      topics: [
        { id: 7, slug: 'network-security', name: 'Network & System Security', isActive: true },
      ],
    },
    {
      id: 5,
      slug: 'embedded-iot',
      name: 'Embedded Systems & IoT',
      description: 'Hardware Programming, Microcontrollers, and Smart IoT Devices',
      topics: [
        { id: 8, slug: 'smart-iot-devices', name: 'Smart IoT & Sensor Systems', isActive: true },
      ],
    },
  ];

  for (const c of clustersData) {
    const cluster = await prisma.cluster.upsert({
      where: { id: c.id },
      update: {
        slug: c.slug,
        name: c.name,
        description: c.description,
      },
      create: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
      },
    });

    console.log(`  📦 Cluster [ID ${cluster.id}]: '${cluster.name}'`);

    for (const t of c.topics) {
      const topic = await prisma.topic.upsert({
        where: { id: t.id },
        update: {
          slug: t.slug,
          name: t.name,
          clusterId: cluster.id,
          isActive: t.isActive,
        },
        create: {
          id: t.id,
          slug: t.slug,
          name: t.name,
          clusterId: cluster.id,
          isActive: t.isActive,
        },
      });
      console.log(`    🔹 Topic [ID ${topic.id}]: '${topic.name}'`);
    }
  }

  console.log('🌱 Seeding Specific Technologies (Python, C++, FastAPI, MERN, etc.)...');

  const techData = [
    { id: 1, slug: 'python', name: 'Python', isActive: true },
    { id: 2, slug: 'cpp', name: 'C++', isActive: true },
    { id: 3, slug: 'fastapi', name: 'FastAPI', isActive: true },
    { id: 4, slug: 'mern-stack', name: 'MERN Stack', isActive: true },
    { id: 5, slug: 'nextjs', name: 'Next.js', isActive: true },
    { id: 6, slug: 'django', name: 'Django', isActive: true },
    { id: 7, slug: 'java', name: 'Java', isActive: true },
    { id: 8, slug: 'golang', name: 'Go (Golang)', isActive: true },
  ];

  for (const tech of techData) {
    const t = await prisma.technology.upsert({
      where: { id: tech.id },
      update: {
        slug: tech.slug,
        name: tech.name,
        isActive: tech.isActive,
      },
      create: {
        id: tech.id,
        slug: tech.slug,
        name: tech.name,
        isActive: tech.isActive,
      },
    });
    console.log(`  ⚡ Technology [ID ${t.id}]: '${t.name}' (${t.slug})`);
  }

  console.log('🌱 Seeding Sample Program & Project...');

  const program = await prisma.program.upsert({
    where: { id: 1 },
    update: {
      countryId: 1,
      title: 'Full Stack Web Engineering (MERN & Next.js)',
      slug: 'fullstack-web-engineering-mern-nextjs',
      description: 'Master full stack web development with React, Next.js, Node.js, NestJS, and MariaDB.',
      durationHours: 120,
      status: 'published',
    },
    create: {
      id: 1,
      countryId: 1,
      title: 'Full Stack Web Engineering (MERN & Next.js)',
      slug: 'fullstack-web-engineering-mern-nextjs',
      description: 'Master full stack web development with React, Next.js, Node.js, NestJS, and MariaDB.',
      durationHours: 120,
      status: 'published',
    },
  });
  console.log(`  🚀 Program [ID ${program.id}]: '${program.title}'`);

  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {
      programId: program.id,
      title: 'E-Commerce Platform Microservice Engine',
      description: 'Build a production-grade full stack e-commerce web application.',
      orderIndex: 1,
    },
    create: {
      id: 1,
      programId: program.id,
      title: 'E-Commerce Platform Microservice Engine',
      description: 'Build a production-grade full stack e-commerce web application.',
      orderIndex: 1,
    },
  });
  console.log(`  🛠️ Project [ID ${project.id}]: '${project.title}'`);

  console.log('🌱 Seeding WorkspaceTemplate, TemplateStep & TemplateTask...');

  const workspaceTemplate = await prisma.workspaceTemplate.upsert({
    where: { projectId: project.id },
    update: {
      version: 1,
      isActive: true,
    },
    create: {
      id: 1,
      projectId: project.id,
      version: 1,
      isActive: true,
    },
  });
  console.log(`  📋 WorkspaceTemplate [ID ${workspaceTemplate.id}]: Version ${workspaceTemplate.version}`);

  const stepsData = [
    {
      id: 1,
      orderIndex: 1,
      title: 'Architecture Setup & Schema Design',
      description: 'Configure multi-file Prisma 7 schema and setup NestJS project modules.',
      tasks: [
        { id: 1, orderIndex: 1, title: 'Initialize NestJS backend project with Prisma 7 ORM', description: 'Setup NestJS CLI starter and configure Prisma MariaDB driver adapter.' },
        { id: 2, orderIndex: 2, title: 'Configure MariaDB database connections and multi-file schemas', description: 'Split schemas into user.prisma and program.prisma files.' },
      ],
    },
    {
      id: 2,
      orderIndex: 2,
      title: 'Authentication & JWT Security',
      description: 'Implement Passport JWT Strategy, bcrypt password hashing, and role guards.',
      tasks: [
        { id: 3, orderIndex: 1, title: 'Implement Passport JWT Authentication strategy', description: 'Create JwtStrategy and JwtAuthGuard for Bearer token validation.' },
        { id: 4, orderIndex: 2, title: 'Add password hashing using bcrypt & class-validator pipes', description: 'Hash passwords with salt round 10 and validate DTO request bodies.' },
      ],
    },
    {
      id: 3,
      orderIndex: 3,
      title: 'RESTful API & E2E Testing',
      description: 'Build CRUD API controllers and write mirrored E2E route integration tests.',
      tasks: [
        { id: 5, orderIndex: 1, title: 'Build CRUD API endpoints for catalog & project management', description: 'Create REST controllers for Clusters, Topics, Technologies, and Programs.' },
        { id: 6, orderIndex: 2, title: 'Write end-to-end integration test suites using Jest', description: 'Create mirrored E2E test files in test/modules folder.' },
      ],
    },
  ];

  for (const s of stepsData) {
    const step = await prisma.templateStep.upsert({
      where: { id: s.id },
      update: {
        workspaceTemplateId: workspaceTemplate.id,
        orderIndex: s.orderIndex,
        title: s.title,
        description: s.description,
      },
      create: {
        id: s.id,
        workspaceTemplateId: workspaceTemplate.id,
        orderIndex: s.orderIndex,
        title: s.title,
        description: s.description,
      },
    });

    console.log(`    📌 TemplateStep [ID ${step.id}]: '${step.title}'`);

    for (const t of s.tasks) {
      const task = await prisma.templateTask.upsert({
        where: { id: t.id },
        update: {
          stepId: step.id,
          orderIndex: t.orderIndex,
          title: t.title,
          description: t.description,
        },
        create: {
          id: t.id,
          stepId: step.id,
          orderIndex: t.orderIndex,
          title: t.title,
          description: t.description,
        },
      });
      console.log(`      ✏️ TemplateTask [ID ${task.id}]: '${task.title}'`);
    }
  }

  await prisma.$disconnect();
  console.log('✨ All Roles, Country, Clusters, Topics, Technologies, Program, Project, WorkspaceTemplate, Steps, and Tasks seeded successfully!');
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
