import { PrismaClient } from '@prisma/client';

export async function seedCatalog(prisma: PrismaClient) {
  console.log('📚 [5/7] Seeding Academic Curriculum, Programs, Rubrics & Capstones...');

  // 1. Clusters
  const clusters = [
    {
      slug: 'software-engineering',
      name: 'Software Engineering & Full Stack',
      description: 'Production-ready web platforms, distributed backends, and modern frontend architectures.',
    },
    {
      slug: 'ai-data-science',
      name: 'Artificial Intelligence & Data Science',
      description: 'Generative AI, Large Language Models, Deep Neural Networks, and Data Engineering.',
    },
    {
      slug: 'cloud-devops',
      name: 'Cloud Computing & DevOps',
      description: 'Cloud Native Microservices, Kubernetes orchestration, Infrastructure as Code, and CI/CD.',
    },
    {
      slug: 'cybersecurity',
      name: 'Cybersecurity & Ethical Defense',
      description: 'Vulnerability assessment, penetration testing, network defense, and zero-trust security.',
    },
    {
      slug: 'embedded-iot',
      name: 'Embedded Systems & IoT',
      description: 'Firmware programming, microcontrollers, sensor integration, and industrial IoT solutions.',
    },
  ];

  for (const c of clusters) {
    await prisma.cluster.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: { name: c.name, slug: c.slug, description: c.description },
    });
  }

  // 2. Topics
  const topics = [
    { clusterSlug: 'software-engineering', slug: 'fullstack-web-dev', name: 'Full Stack Web Development' },
    { clusterSlug: 'software-engineering', slug: 'mobile-app-dev', name: 'Mobile Application Engineering' },
    { clusterSlug: 'ai-data-science', slug: 'machine-learning', name: 'Machine Learning & LLMs' },
    { clusterSlug: 'ai-data-science', slug: 'data-engineering', name: 'Data Engineering & Analytics' },
    { clusterSlug: 'cloud-devops', slug: 'cloud-devops', name: 'Cloud Native Architecture & CI/CD' },
    { clusterSlug: 'cybersecurity', slug: 'cyber-security', name: 'Offensive & Defensive Security' },
    { clusterSlug: 'embedded-iot', slug: 'embedded-iot-systems', name: 'Embedded Firmware & IoT' },
  ];

  for (const t of topics) {
    const cluster = await prisma.cluster.findUnique({ where: { slug: t.clusterSlug } });
    if (cluster) {
      await prisma.topic.upsert({
        where: { slug: t.slug },
        update: { clusterId: cluster.id, name: t.name, isActive: true },
        create: { clusterId: cluster.id, name: t.name, slug: t.slug, isActive: true },
      });
    }
  }

  // 3. Technologies
  const technologies = [
    { slug: 'nextjs', name: 'Next.js 16' },
    { slug: 'react', name: 'React 19' },
    { slug: 'typescript', name: 'TypeScript' },
    { slug: 'nestjs', name: 'NestJS' },
    { slug: 'prisma', name: 'Prisma ORM' },
    { slug: 'mariadb', name: 'MariaDB / MySQL' },
    { slug: 'postgresql', name: 'PostgreSQL' },
    { slug: 'docker', name: 'Docker Containers' },
    { slug: 'kubernetes', name: 'Kubernetes' },
    { slug: 'aws', name: 'AWS Cloud Services' },
    { slug: 'python', name: 'Python 3.12' },
    { slug: 'pytorch', name: 'PyTorch' },
    { slug: 'langchain', name: 'LangChain & OpenAI' },
    { slug: 'redis', name: 'Redis & BullMQ' },
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: { name: tech.name, isActive: true },
      create: { name: tech.name, slug: tech.slug, isActive: true },
    });
  }

  // 4. Sellable Internship Programs
  const programs = [
    {
      countryId: 1,
      title: 'Full Stack Web Engineering & Cloud Architecture',
      slug: 'fullstack-web-engineering',
      description:
        'A comprehensive 120-hour industry internship delivering 3 real-world production projects with NestJS, Next.js App Router, Prisma ORM, MySQL, and Dockerized microservices.',
      durationHours: 120,
      status: 'published',
      outcomes:
        'Architect scalable REST & GraphQL APIs; Build responsive SSR web applications; Implement JWT auth & RBAC; Deploy containerized workloads with CI/CD.',
      topicSlug: 'fullstack-web-dev',
      techSlugs: ['nextjs', 'react', 'typescript', 'nestjs', 'prisma', 'mariadb', 'docker', 'redis'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4999.0 },
        { countryId: 2, currency: 'USD', amount: 149.0 },
        { countryId: 3, currency: 'GBP', amount: 119.0 },
        { countryId: 4, currency: 'AED', amount: 549.0 },
      ],
    },
    {
      countryId: 1,
      title: 'Applied AI, Machine Learning & LLM Systems',
      slug: 'applied-ai-machine-learning',
      description:
        'Hands-on 120-hour capstone internship in Machine Learning algorithms, Deep Learning with PyTorch, and production RAG (Retrieval-Augmented Generation) applications with LangChain.',
      durationHours: 120,
      status: 'published',
      outcomes:
        'Train neural network classifiers; Deploy LLM agentic pipelines; Implement vector embeddings with Qdrant; Serve low-latency inference APIs.',
      topicSlug: 'machine-learning',
      techSlugs: ['typescript', 'python', 'pytorch', 'langchain', 'postgresql', 'docker'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5999.0 },
        { countryId: 2, currency: 'USD', amount: 179.0 },
        { countryId: 3, currency: 'GBP', amount: 139.0 },
        { countryId: 4, currency: 'AED', amount: 649.0 },
      ],
    },
    {
      countryId: 1,
      title: 'Cloud Native DevOps & Infrastructure Engineering',
      slug: 'cloud-devops-engineering',
      description:
        'Production internship focused on AWS cloud infrastructure, Terraform automation, Docker containerization, Kubernetes clusters, and GitHub Actions CI/CD pipelines.',
      durationHours: 120,
      status: 'published',
      outcomes:
        'Automate multi-region AWS infrastructure; Build zero-downtime Kubernetes deployments; Implement observability with Prometheus & Grafana.',
      topicSlug: 'cloud-devops',
      techSlugs: ['docker', 'kubernetes', 'aws', 'redis', 'typescript'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5499.0 },
        { countryId: 2, currency: 'USD', amount: 169.0 },
        { countryId: 3, currency: 'GBP', amount: 129.0 },
        { countryId: 4, currency: 'AED', amount: 599.0 },
      ],
    },
    {
      countryId: 1,
      title: 'Advanced Cybersecurity & Defense Operations',
      slug: 'advanced-cybersecurity-defense',
      description:
        'Industry-grade security internship covering network vulnerability assessment, web application penetration testing, OWASP Top 10 mitigation, and SOC incident response.',
      durationHours: 120,
      status: 'published',
      outcomes:
        'Audit web applications for security flaws; Perform cryptographic handshakes; Hardening Linux servers and container environments.',
      topicSlug: 'cyber-security',
      techSlugs: ['python', 'docker', 'typescript', 'mariadb'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4999.0 },
        { countryId: 2, currency: 'USD', amount: 149.0 },
      ],
    },
    {
      countryId: 1,
      title: 'Smart Embedded Systems & Industrial IoT',
      slug: 'smart-embedded-iot-systems',
      description:
        'Firmware engineering internship integrating ESP32/ARM microcontrollers, MQTT messaging protocols, real-time sensor processing, and cloud telemetry gateways.',
      durationHours: 120,
      status: 'published',
      outcomes:
        'Program low-level C++ firmware; Implement secure MQTT communications; Build cloud-connected IoT dashboards with telemetry alerts.',
      topicSlug: 'embedded-iot-systems',
      techSlugs: ['typescript', 'python', 'docker', 'redis'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4799.0 },
        { countryId: 2, currency: 'USD', amount: 139.0 },
      ],
    },
  ];

  for (const prog of programs) {
    const program = await prisma.program.upsert({
      where: { slug: prog.slug },
      update: {
        countryId: prog.countryId,
        title: prog.title,
        description: prog.description,
        durationHours: prog.durationHours,
        status: prog.status,
        outcomes: prog.outcomes,
      },
      create: {
        countryId: prog.countryId,
        title: prog.title,
        slug: prog.slug,
        description: prog.description,
        durationHours: prog.durationHours,
        status: prog.status,
        outcomes: prog.outcomes,
      },
    });

    // Program Topics link
    const topic = await prisma.topic.findUnique({ where: { slug: prog.topicSlug } });
    if (topic) {
      await prisma.programTopic.upsert({
        where: { programId_topicId: { programId: program.id, topicId: topic.id } },
        update: {},
        create: { programId: program.id, topicId: topic.id },
      });
    }

    // Program Technologies link
    for (const techSlug of prog.techSlugs) {
      const tech = await prisma.technology.findUnique({ where: { slug: techSlug } });
      if (tech) {
        await prisma.programTechnology.upsert({
          where: { programId_technologyId: { programId: program.id, technologyId: tech.id } },
          update: {},
          create: { programId: program.id, technologyId: tech.id },
        });
      }
    }

    // Program Pricing
    for (const pr of prog.pricings) {
      const existingPricing = await prisma.programPricing.findFirst({
        where: { programId: program.id, countryId: pr.countryId },
      });
      if (existingPricing) {
        await prisma.programPricing.update({
          where: { id: existingPricing.id },
          data: { amount: pr.amount, currency: pr.currency, isActive: true },
        });
      } else {
        await prisma.programPricing.create({
          data: {
            programId: program.id,
            countryId: pr.countryId,
            currency: pr.currency,
            amount: pr.amount,
            isActive: true,
          },
        });
      }
    }

    // Program FAQs
    const faqs = [
      {
        question: 'What is the format and duration of this internship?',
        answer:
          'This is a 120-hour self-paced, mentor-guided capstone internship. You work on 3 real-world projects with step-by-step deliverable tasks and receive instant asynchronous AI rubric evaluation on every submission.',
      },
      {
        question: 'Are the completion certificates recognized for NEP-2020 university credits?',
        answer:
          'Yes. All internship tracks comply with National Education Policy (NEP 2020) skilling norms, with verifiable QR codes and downloadable academic transcripts recognized across top institutions.',
      },
    ];

    for (let i = 0; i < faqs.length; i++) {
      const existingFaq = await prisma.programFaq.findFirst({
        where: { programId: program.id, question: faqs[i].question },
      });
      if (!existingFaq) {
        await prisma.programFaq.create({
          data: {
            programId: program.id,
            question: faqs[i].question,
            answer: faqs[i].answer,
            orderIndex: i + 1,
            isActive: true,
          },
        });
      }
    }

    // Program Testimonials
    const testimonials = [
      {
        authorName: 'Aakash Verma',
        authorRole: 'Software Engineer @ Microsoft (VIT Alumnus)',
        quote:
          'The 3 project deliverables were remarkably close to actual sprint work in big tech. The AI review gave immediate, detailed feedback on code design patterns and edge cases.',
        rating: 5,
      },
      {
        authorName: 'Dr. S. K. Sundaram',
        authorRole: 'Dean of Academic Partnerships, IIT Madras Research Park',
        quote:
          'Engineers Clinic bridges the crucial gap between academic theory and production software delivery. The institutional cohort tracking has been phenomenal for our placement records.',
        rating: 5,
      },
    ];

    for (let i = 0; i < testimonials.length; i++) {
      const existingTestimonial = await prisma.programTestimonial.findFirst({
        where: { programId: program.id, authorName: testimonials[i].authorName },
      });
      if (!existingTestimonial) {
        await prisma.programTestimonial.create({
          data: {
            programId: program.id,
            authorName: testimonials[i].authorName,
            authorRole: testimonials[i].authorRole,
            quote: testimonials[i].quote,
            rating: testimonials[i].rating,
            orderIndex: i + 1,
            isActive: true,
          },
        });
      }
    }
  }

  // 5. Detailed Capstone Projects for Program 1 (Full Stack Web Engineering)
  const progFSW = await prisma.program.findUnique({ where: { slug: 'fullstack-web-engineering' } });
  if (progFSW) {
    const fswProjects = [
      {
        title: 'Production Backend API with NestJS, Prisma & MySQL',
        description:
          'Architect a modular REST API with JWT authentication, RBAC authorization guards, validation pipes, relational Prisma schema, and Jest E2E test suites.',
        orderIndex: 1,
        tasks: [
          {
            orderIndex: 1,
            title: 'Database Schema Modeling & Migration Setup',
            description:
              'Design the multi-table relational schema for users, auth tokens, and business entities in Prisma. Execute migrations and write initial database seed fixtures.',
            rubric: {
              criteria: [
                { name: 'Schema Normalization', maxScore: 30, description: 'Correct foreign key constraints, indexes, and field types.' },
                { name: 'Migration Integrity', maxScore: 30, description: 'Clean Prisma migration execution and seed script.' },
                { name: 'Type Safety', maxScore: 40, description: 'Strict TypeScript typing without any any casting.' },
              ],
              passThreshold: 65,
            },
            resources: [
              { title: 'Prisma 7 Multi-File Schema Documentation', url: 'https://www.prisma.io/docs', type: 'doc' },
              { title: 'Database Design Guide', url: 'https://engineersclinic.com/resources/db-design', type: 'guide' },
            ],
          },
          {
            orderIndex: 2,
            title: 'Authentication & Guard-Protected Endpoints',
            description:
              'Implement register/login endpoints with bcrypt password hashing, Passport JWT strategies, refresh token rotation, and role-based permissions decorators.',
            rubric: {
              criteria: [
                { name: 'Security & Hashing', maxScore: 35, description: 'Bcrypt salt rounds >= 10, safe token expiry handling.' },
                { name: 'Guards & Decorators', maxScore: 35, description: 'Robust AuthGuard & PermissionsGuard middleware.' },
                { name: 'Validation Pipes', maxScore: 30, description: 'class-validator DTOs on all incoming request payloads.' },
              ],
              passThreshold: 70,
            },
            resources: [
              { title: 'NestJS Security & JWT Recipes', url: 'https://docs.nestjs.com/security/authentication', type: 'doc' },
            ],
          },
        ],
      },
      {
        title: 'Responsive Next.js 16 Web Dashboard & Client Portal',
        description:
          'Build a modern, role-aware client application using Next.js App Router, Tailwind CSS, custom responsive sidebar navigation, and real-time state synchronization.',
        orderIndex: 2,
        tasks: [
          {
            orderIndex: 1,
            title: 'Interactive Dashboard Layout & Dynamic Navigation',
            description:
              'Develop the main dashboard layout with responsive collapsible sidebar (full on PC, auto-collapsed rail on tablet, overlay drawer on mobile) and role-based tab routing.',
            rubric: {
              criteria: [
                { name: 'Responsive Viewports', maxScore: 40, description: 'Flawless UI behavior on desktop, tablet, and mobile screens.' },
                { name: 'Component Modularity', maxScore: 30, description: 'Clean separation of shared, student, and admin components.' },
                { name: 'Accessibility & Design System', maxScore: 30, description: 'Semantic HTML, focus states, and Tailwind token usage.' },
              ],
              passThreshold: 65,
            },
            resources: [
              { title: 'Next.js App Router Masterclass', url: 'https://nextjs.org/docs', type: 'doc' },
            ],
          },
          {
            orderIndex: 2,
            title: 'API Integration & Interactive DataTables',
            description:
              'Connect client API services with JWT bearer tokens. Build sortable, searchable datatables with pagination controls and instant toast notifications.',
            rubric: {
              criteria: [
                { name: 'Client Error Handling', maxScore: 35, description: 'Graceful toast error handling and loading spinners.' },
                { name: 'DataTable UX & Performance', maxScore: 35, description: 'Fast search filtering, multi-field sorting, and pagination.' },
                { name: 'State Management', maxScore: 30, description: 'Clean React hooks without unnecessary re-renders.' },
              ],
              passThreshold: 70,
            },
            resources: [
              { title: 'TanStack Table & DataTable Patterns', url: 'https://tanstack.com/table', type: 'doc' },
            ],
          },
        ],
      },
      {
        title: 'Scalable Microservices, BullMQ Queue & Deployment',
        description:
          'Containerize the application with multi-stage Dockerfiles, set up Redis-backed BullMQ asynchronous job queues, and deploy with Nginx reverse proxy.',
        orderIndex: 3,
        tasks: [
          {
            orderIndex: 1,
            title: 'Docker Containerization & Compose Orchestration',
            description:
              'Create production-grade multi-stage Dockerfiles for backend and frontend. Configure docker-compose with MariaDB, Redis, and health check dependencies.',
            rubric: {
              criteria: [
                { name: 'Image Size Optimization', maxScore: 35, description: 'Multi-stage builds, non-root user execution.' },
                { name: 'Compose Configuration', maxScore: 35, description: 'Environment variables, volume mounts, and service networking.' },
                { name: 'Container Health Checks', maxScore: 30, description: 'Configured liveness and readiness health checks.' },
              ],
              passThreshold: 70,
            },
            resources: [
              { title: 'Docker Production Best Practices', url: 'https://docs.docker.com', type: 'doc' },
            ],
          },
        ],
      },
    ];

    for (const p of fswProjects) {
      let project = await prisma.project.findFirst({
        where: { programId: progFSW.id, orderIndex: p.orderIndex },
      });

      if (project) {
        project = await prisma.project.update({
          where: { id: project.id },
          data: { title: p.title, description: p.description },
        });
      } else {
        project = await prisma.project.create({
          data: {
            programId: progFSW.id,
            title: p.title,
            description: p.description,
            orderIndex: p.orderIndex,
          },
        });
      }

      // Workspace Template
      const template = await prisma.workspaceTemplate.upsert({
        where: { projectId: project.id },
        update: { version: 1, isActive: true },
        create: { projectId: project.id, version: 1, isActive: true },
      });

      for (const t of p.tasks) {
        let task = await prisma.templateTask.findFirst({
          where: { workspaceTemplateId: template.id, orderIndex: t.orderIndex },
        });

        if (task) {
          task = await prisma.templateTask.update({
            where: { id: task.id },
            data: { title: t.title, description: t.description },
          });
        } else {
          task = await prisma.templateTask.create({
            data: {
              workspaceTemplateId: template.id,
              orderIndex: t.orderIndex,
              title: t.title,
              description: t.description,
            },
          });
        }

        // Rubric
        await prisma.rubric.upsert({
          where: { taskId: task.id },
          update: {
            criteria: t.rubric.criteria,
            maxScore: 100,
            passThreshold: t.rubric.passThreshold,
          },
          create: {
            taskId: task.id,
            criteria: t.rubric.criteria,
            maxScore: 100,
            passThreshold: t.rubric.passThreshold,
          },
        });

        // Resources
        for (const res of t.resources) {
          const existingRes = await prisma.resource.findFirst({
            where: { taskId: task.id, title: res.title },
          });
          if (!existingRes) {
            await prisma.resource.create({
              data: {
                ownerType: 'TASK',
                taskId: task.id,
                type: res.type,
                title: res.title,
                url: res.url,
              },
            });
          }
        }
      }
    }
  }

  // 6. Detailed Capstone Projects for Program 2 (Applied AI & ML)
  const progAI = await prisma.program.findUnique({ where: { slug: 'applied-ai-machine-learning' } });
  if (progAI) {
    const aiProjects = [
      {
        title: 'Supervised Learning & Deep Neural Network Classifiers',
        description:
          'Develop end-to-end data preprocessing, feature engineering, and train PyTorch deep learning models for classification with cross-validation.',
        orderIndex: 1,
      },
      {
        title: 'Retrieval-Augmented Generation (RAG) with LangChain & Vector DB',
        description:
          'Build a production generative AI knowledge assistant using LangChain, Qdrant vector database, chunking strategies, and OpenAI embeddings.',
        orderIndex: 2,
      },
      {
        title: 'Autonomous Multi-Agent AI System & API Deployment',
        description:
          'Implement an autonomous agentic pair programming assistant with tool calling, memory management, and deploy with FastAPI in Docker.',
        orderIndex: 3,
      },
    ];

    for (const p of aiProjects) {
      let project = await prisma.project.findFirst({
        where: { programId: progAI.id, orderIndex: p.orderIndex },
      });

      if (project) {
        project = await prisma.project.update({
          where: { id: project.id },
          data: { title: p.title, description: p.description },
        });
      } else {
        project = await prisma.project.create({
          data: {
            programId: progAI.id,
            title: p.title,
            description: p.description,
            orderIndex: p.orderIndex,
          },
        });
      }

      const template = await prisma.workspaceTemplate.upsert({
        where: { projectId: project.id },
        update: { version: 1, isActive: true },
        create: { projectId: project.id, version: 1, isActive: true },
      });

      let task = await prisma.templateTask.findFirst({
        where: { workspaceTemplateId: template.id, orderIndex: 1 },
      });

      if (task) {
        task = await prisma.templateTask.update({
          where: { id: task.id },
          data: { title: `${project.title} - Step 1 Deliverable`, description: `Complete implementation for ${project.title}` },
        });
      } else {
        task = await prisma.templateTask.create({
          data: {
            workspaceTemplateId: template.id,
            orderIndex: 1,
            title: `${project.title} - Step 1 Deliverable`,
            description: `Complete implementation for ${project.title}`,
          },
        });
      }

      await prisma.rubric.upsert({
        where: { taskId: task.id },
        update: {
          criteria: [
            { name: 'Model Accuracy & Evaluation', maxScore: 40, description: 'Evaluation metrics precision/recall/F1.' },
            { name: 'Code Modularity & Cleanliness', maxScore: 30, description: 'Clean Python code structure.' },
            { name: 'Inference Latency', maxScore: 30, description: 'Optimized inference throughput.' },
          ],
          maxScore: 100,
          passThreshold: 70,
        },
        create: {
          taskId: task.id,
          criteria: [
            { name: 'Model Accuracy & Evaluation', maxScore: 40, description: 'Evaluation metrics precision/recall/F1.' },
            { name: 'Code Modularity & Cleanliness', maxScore: 30, description: 'Clean Python code structure.' },
            { name: 'Inference Latency', maxScore: 30, description: 'Optimized inference throughput.' },
          ],
          maxScore: 100,
          passThreshold: 70,
        },
      });
    }
  }

  console.log(`  ✅ ${clusters.length} Clusters, ${topics.length} Topics, ${programs.length} Programs & Capstones seeded successfully`);
}
