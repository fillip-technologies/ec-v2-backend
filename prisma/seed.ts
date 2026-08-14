import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
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

  console.log('🌱 Seeding Roles...');
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
  console.log('  ✅ 5 Roles seeded (super_admin, admin, college, student, support)');

  console.log('🌱 Seeding Granular Resource-Action Permissions & RolePermissions Matrix...');
  const permissionsData = [
    // Catalogue Module
    { id: 1, slug: 'program:publish', name: 'Publish Program', module: 'catalogue', description: 'Publish and archive catalog programs', roleIds: [1, 2] },
    { id: 2, slug: 'program:create', name: 'Create Program', module: 'catalogue', description: 'Create new catalog programs', roleIds: [1, 2] },
    { id: 3, slug: 'program:update', name: 'Update Program', module: 'catalogue', description: 'Update catalog program details', roleIds: [1, 2] },
    { id: 4, slug: 'project:create', name: 'Create Project', module: 'catalogue', description: 'Create capstone projects in programs', roleIds: [1, 2] },
    { id: 5, slug: 'project:edit', name: 'Edit Project', module: 'catalogue', description: 'Edit capstone project details and templates', roleIds: [1, 2, 3] },
    { id: 6, slug: 'step:create', name: 'Create Step', module: 'catalogue', description: 'Add workspace template steps to projects', roleIds: [1, 2] },
    { id: 7, slug: 'task:create', name: 'Create Task', module: 'catalogue', description: 'Add deliverable tasks to workspace steps', roleIds: [1, 2] },

    // Evaluation Module
    { id: 8, slug: 'rubric:configure', name: 'Configure AI Rubric', module: 'evaluation', description: 'Configure AI rubric criteria and pass thresholds', roleIds: [1, 2] },
    { id: 9, slug: 'submission:grade', name: 'Manual Grade Submission', module: 'evaluation', description: 'Manual override grading for student submissions', roleIds: [1, 2, 5] },

    // B2B & Admin Module
    { id: 10, slug: 'college:manage', name: 'Manage Colleges', module: 'b2b', description: 'Manage college accounts and seat allocations', roleIds: [1, 2, 3, 5] },
    { id: 11, slug: 'college:vet', name: 'Vet College Application', module: 'b2b', description: 'Approve or reject college registration applications', roleIds: [1, 2] },
    { id: 12, slug: 'user:manage', name: 'Manage Users', module: 'admin', description: 'Manage platform user accounts and roles', roleIds: [1, 2] },

    // Commerce Module
    { id: 13, slug: 'coupon:generate', name: 'Generate Coupons', module: 'commerce', description: 'Generate discount codes and zero-cost B2B coupon batches', roleIds: [1, 2, 3] },

    // Delivery Module
    { id: 14, slug: 'project:enroll', name: 'Enrol & Execute Project', module: 'delivery', description: 'Enrol in programs and execute workspace steps', roleIds: [4] },

    // Credentials Module
    { id: 15, slug: 'certificate:issue', name: 'Issue Certificate', module: 'credentials', description: 'Issue completion certificates to students', roleIds: [1, 2] },
    { id: 16, slug: 'certificate:revoke', name: 'Revoke Certificate', module: 'credentials', description: 'Revoke student completion certificates', roleIds: [1, 2] },

    // Analytics Module
    { id: 17, slug: 'report:view', name: 'View Reports', module: 'analytics', description: 'View progress and completion reports', roleIds: [1, 2, 3, 4, 5] },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { id: p.id },
      update: { slug: p.slug, name: p.name, module: p.module, description: p.description },
      create: { id: p.id, slug: p.slug, name: p.name, module: p.module, description: p.description },
    });

    for (const rId of p.roleIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: rId, permissionId: p.id } },
        update: {},
        create: { roleId: rId, permissionId: p.id },
      });
    }
  }
  console.log('  ✅ 17 Granular Resource-Action Permissions & RolePermissions Matrix seeded');

  console.log('🌱 Seeding Countries...');
  const countries = [
    { id: 1, name: 'India', isoCode: 'IN', defaultLocal: 'en-IN', timezone: 'Asia/Kolkata', currencyCode: 'INR' },
    { id: 2, name: 'United States', isoCode: 'US', defaultLocal: 'en-US', timezone: 'America/New_York', currencyCode: 'USD' },
    { id: 3, name: 'United Kingdom', isoCode: 'GB', defaultLocal: 'en-GB', timezone: 'Europe/London', currencyCode: 'GBP' },
    { id: 4, name: 'UAE', isoCode: 'AE', defaultLocal: 'ar-AE', timezone: 'Asia/Dubai', currencyCode: 'AED' },
  ];

  for (const c of countries) {
    await prisma.country.upsert({
      where: { id: c.id },
      update: { name: c.name, isoCode: c.isoCode, defaultLocal: c.defaultLocal, timezone: c.timezone, currencyCode: c.currencyCode, isActive: true },
      create: { id: c.id, name: c.name, isoCode: c.isoCode, defaultLocal: c.defaultLocal, timezone: c.timezone, currencyCode: c.currencyCode, isActive: true },
    });
  }
  console.log('  ✅ 4 Countries seeded');

  console.log('🌱 Seeding Colleges...');
  const colleges = [
    { id: 1, name: 'Vellore Institute of Technology (VIT)', address: 'Katpadi, Vellore, Tamil Nadu', countryId: 1, status: 'approved' },
    { id: 2, name: 'Indian Institute of Technology (IIT) Madras', address: 'Sardar Patel Rd, Chennai, Tamil Nadu', countryId: 1, status: 'approved' },
    { id: 3, name: 'BITS Pilani', address: 'Vidya Vihar, Pilani, Rajasthan', countryId: 1, status: 'approved' },
  ];

  for (const col of colleges) {
    await prisma.college.upsert({
      where: { id: col.id },
      update: { name: col.name, address: col.address, countryId: col.countryId, status: col.status },
      create: { id: col.id, name: col.name, address: col.address, countryId: col.countryId, status: col.status },
    });
  }
  console.log('  ✅ 3 Colleges seeded');

  console.log('🌱 Seeding Users, CollegeMembers, and Students...');
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // User 1: Super Admin
  const userAdmin = await prisma.user.upsert({
    where: { id: 1 },
    update: { email: 'admin@engineersclinic.com', password: hashedPassword, phoneNo: '9876543210', roleId: 1, countryId: 1, status: 'active' },
    create: { id: 1, email: 'admin@engineersclinic.com', password: hashedPassword, phoneNo: '9876543210', roleId: 1, countryId: 1, status: 'active' },
  });

  // User 2: College Admin
  const userCollege = await prisma.user.upsert({
    where: { id: 2 },
    update: { email: 'admin@vit.ac.in', password: hashedPassword, phoneNo: '9876543211', roleId: 3, countryId: 1, status: 'active' },
    create: { id: 2, email: 'admin@vit.ac.in', password: hashedPassword, phoneNo: '9876543211', roleId: 3, countryId: 1, status: 'active' },
  });

  await prisma.collegeMember.upsert({
    where: { userId: userCollege.id },
    update: { collegeId: 1 },
    create: { userId: userCollege.id, collegeId: 1 },
  });

  // User 3: Student
  const userStudent = await prisma.user.upsert({
    where: { id: 3 },
    update: { email: 'student@example.com', password: hashedPassword, phoneNo: '9876543212', roleId: 4, countryId: 1, status: 'active' },
    create: { id: 3, email: 'student@example.com', password: hashedPassword, phoneNo: '9876543212', roleId: 4, countryId: 1, status: 'active' },
  });

  const student = await prisma.student.upsert({
    where: { userid: userStudent.id },
    update: { firstName: 'Rahul', lastName: 'Sharma', collegeId: 1 },
    create: { userid: userStudent.id, firstName: 'Rahul', lastName: 'Sharma', collegeId: 1 },
  });

  // User 4: Support User
  await prisma.user.upsert({
    where: { id: 4 },
    update: { email: 'support@engineersclinic.com', password: hashedPassword, phoneNo: '9876543213', roleId: 5, countryId: 1, status: 'active' },
    create: { id: 4, email: 'support@engineersclinic.com', password: hashedPassword, phoneNo: '9876543213', roleId: 5, countryId: 1, status: 'active' },
  });

  console.log('  ✅ Users (Super Admin, College Admin, Student, Support) seeded');

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
      update: { slug: c.slug, name: c.name, description: c.description },
      create: { id: c.id, slug: c.slug, name: c.name, description: c.description },
    });

    for (const t of c.topics) {
      await prisma.topic.upsert({
        where: { id: t.id },
        update: { slug: t.slug, name: t.name, clusterId: cluster.id, isActive: t.isActive },
        create: { id: t.id, slug: t.slug, name: t.name, clusterId: cluster.id, isActive: t.isActive },
      });
    }
  }
  console.log('  ✅ Clusters and Topics seeded');

  console.log('🌱 Seeding Technologies...');
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
    await prisma.technology.upsert({
      where: { id: tech.id },
      update: { slug: tech.slug, name: tech.name, isActive: tech.isActive },
      create: { id: tech.id, slug: tech.slug, name: tech.name, isActive: tech.isActive },
    });
  }
  console.log('  ✅ 8 Technologies seeded');

  console.log('🌱 Seeding 10 Programs with MULTIPLE Topics, MULTIPLE Techs, MULTIPLE Testimonials, MULTIPLE FAQs, MULTIPLE Projects, MULTIPLE Steps, MULTIPLE Tasks & MULTIPLE Task Resources...');
  const programsData = [
    {
      id: 1,
      title: 'Full Stack Web Engineering (MERN & Next.js)',
      slug: 'fullstack-web-engineering-mern-nextjs',
      description: 'Master production full stack web development with React, Next.js, Node.js, NestJS, and MariaDB.',
      outcomes: 'Build and deploy production-grade microservice web applications with AI rubric evaluation.\nMaster Next.js server components and SSR optimization.\nImplement secure OAuth2 and JWT authorization systems.',
      durationHours: 120,
      status: 'published',
      topicIds: [1, 5],
      techIds: [4, 5, 1],
      amountInr: 2999.0,
      amountUsd: 49.0,
      testimonials: [
        { name: 'Aarav Mehta', role: 'Software Engineer at TCS', quote: 'Extremely practical program! Helped me build production web microservices.', rating: 5 },
        { name: 'Priya Sharma', role: 'Full Stack Intern at Infosys', quote: 'The guided IDE workspace made learning complex backend system design straightforward.', rating: 5 },
        { name: 'Rohan Gupta', role: 'Junior Developer at Wipro', quote: 'Cleared my technical interviews easily after building these 3 capstones.', rating: 5 },
      ],
      faqs: [
        { q: 'Who is eligible for this program?', a: 'Any engineering, computer science, diploma, or BCA/MCA student.' },
        { q: 'Is the certificate verifiable?', a: 'Yes, every certificate features a QR-verifiable credential link.' },
        { q: 'What are the hardware requirements?', a: 'Any browser-enabled laptop with an internet connection.' },
      ],
      projects: [
        { title: 'E-Commerce Platform Microservice Engine', desc: 'Build a production-grade full stack e-commerce web application with cart and payment checkout.' },
        { title: 'Real-Time Collaborative Workspace Portal', desc: 'Construct a multi-tenant Kanban board workspace with WebSocket real-time syncing.' },
        { title: 'Distributed Authentication & OAuth Service', desc: 'Implement OAuth2, JWT rotation, and RBAC permission guards.' },
      ],
    },
    {
      id: 2,
      title: 'iOS & Android Cross-Platform Mobile Engineering',
      slug: 'mobile-app-engineering-react-native',
      description: 'Build native high-performance mobile applications using React Native and C++ native modules.',
      outcomes: 'Develop mobile apps with offline synchronization and real-time push notifications.\nMaster React Native navigation and state management.\nInterface with native C++ device drivers.',
      durationHours: 120,
      status: 'published',
      topicIds: [2, 1],
      techIds: [2, 7, 5],
      amountInr: 3499.0,
      amountUsd: 59.0,
      testimonials: [
        { name: 'Ananya Verma', role: 'Mobile Dev at Zomato', quote: 'Building real offline tracking apps gave me confidence in mobile engineering.', rating: 5 },
        { name: 'Karan Patel', role: 'Android Intern at Paytm', quote: 'The task-level resources and reference code samples saved me hours.', rating: 5 },
      ],
      faqs: [
        { q: 'Can I test mobile apps without an iPhone/Android device?', a: 'Yes, our web workspace includes built-in mobile device emulators.' },
        { q: 'How long do I get access to the curriculum?', a: 'You get lifetime access to all learning materials and resources.' },
      ],
      projects: [
        { title: 'Real-Time Delivery & Tracking Mobile App', desc: 'Build a mobile tracking application with live GPS location mapping and offline SQLite storage.' },
        { title: 'Cross-Platform Social Feed & Media Engine', desc: 'Develop a responsive media feed app with video caching and push notification triggers.' },
      ],
    },
    {
      id: 3,
      title: 'Applied Machine Learning & Neural Networks',
      slug: 'applied-machine-learning-neural-networks',
      description: 'Train, evaluate, and deploy deep learning models using Python, PyTorch, and FastAPI microservices.',
      outcomes: 'Master model fine-tuning, vector databases, and real-time inference API serving.\nConstruct high-accuracy computer vision classification models.\nDeploy containerized PyTorch inference servers.',
      durationHours: 180,
      status: 'published',
      topicIds: [3, 4],
      techIds: [1, 3, 6],
      amountInr: 4999.0,
      amountUsd: 79.0,
      testimonials: [
        { name: 'Vikram Singh', role: 'AI Researcher at Accenture', quote: 'The AI rubric feedback on my model code quality was incredible.', rating: 5 },
        { name: 'Sneha Nair', role: 'Data Scientist at Mu Sigma', quote: 'I built an entire computer vision pipeline from scratch!', rating: 5 },
      ],
      faqs: [
        { q: 'Do I need a GPU to train models?', a: 'No, GPU workspace environments are provisioned automatically.' },
        { q: 'Is Python knowledge required?', a: 'Basic Python familiarity is recommended.' },
      ],
      projects: [
        { title: 'Automated Image & Document AI Classifier', desc: 'Build a computer vision model with REST API endpoints served via FastAPI.' },
        { title: 'Real-Time Fraud & Anomaly Detection Engine', desc: 'Train an ensemble ML model detecting anomalous transaction patterns.' },
        { title: 'Vector Database & Semantic Search Pipeline', desc: 'Construct a Milvus vector embeddings index with semantic similarity queries.' },
      ],
    },
    {
      id: 4,
      title: 'Big Data Analytics & Pipeline Engineering',
      slug: 'big-data-analytics-pipeline-engineering',
      description: 'Architect scalable data pipelines, ETL streaming workflows, and Django analytics dashboards.',
      outcomes: 'Design real-time data ingestion pipelines and interactive analytics dashboards.',
      durationHours: 120,
      status: 'published',
      topicIds: [4, 3],
      techIds: [1, 6, 8],
      amountInr: 3999.0,
      amountUsd: 65.0,
      testimonials: [
        { name: 'Divya Iyer', role: 'Data Engineer at Tiger Analytics', quote: 'Learned streaming ETL pipelines with real financial datasets.', rating: 5 },
      ],
      faqs: [
        { q: 'What databases are covered?', a: 'PostgreSQL, MariaDB, Redis, and Apache Kafka.' },
      ],
      projects: [
        { title: 'Real-Time Financial Market Data Pipeline', desc: 'Architect a high-throughput streaming ETL pipeline with interactive chart visualizations.' },
        { title: 'Customer Churn Analytics & Prediction Engine', desc: 'Process millions of event logs to build churn risk dashboards.' },
      ],
    },
    {
      id: 5,
      title: 'Cloud Native Kubernetes & CI/CD Automation',
      slug: 'cloud-native-kubernetes-devops',
      description: 'Master Cloud Native DevOps architecture with Docker, Kubernetes, Helm, and Go (Golang).',
      outcomes: 'Automate zero-downtime deployment pipelines with Kubernetes ingress controllers.',
      durationHours: 60,
      status: 'published',
      topicIds: [6, 5],
      techIds: [8, 1],
      amountInr: 2499.0,
      amountUsd: 39.0,
      testimonials: [
        { name: 'Manish Kumar', role: 'DevOps Engineer at Swiggy', quote: 'Building custom Kubernetes operators in Go was a game changer.', rating: 5 },
      ],
      faqs: [
        { q: 'Will I get access to a live K8s cluster?', a: 'Yes, isolated Minikube and K3s clusters are provided in the browser.' },
      ],
      projects: [
        { title: 'Kubernetes GitOps Deployment Controller', desc: 'Build a custom Kubernetes operator in Go for continuous delivery automation.' },
        { title: 'Automated Docker Image Vulnerability Scanner', desc: 'Construct a CLI tool scanning container registries for security patches.' },
      ],
    },
    {
      id: 6,
      title: 'Ethical Hacking & Network Defense Systems',
      slug: 'ethical-hacking-network-defense',
      description: 'Conduct penetration testing, vulnerability analysis, and network packet security audits.',
      outcomes: 'Identify OWASP Top 10 vulnerabilities and harden production server infrastructures.',
      durationHours: 120,
      status: 'published',
      topicIds: [7, 6],
      techIds: [1, 2],
      amountInr: 3999.0,
      amountUsd: 65.0,
      testimonials: [
        { name: 'Siddharth Rao', role: 'Cybersecurity Analyst at PwC', quote: 'Writing C++ packet analyzers gave me deep network protocol insight.', rating: 5 },
      ],
      faqs: [
        { q: 'Is this lab environment secure?', a: 'All security testing is performed in sandboxed container networks.' },
      ],
      projects: [
        { title: 'Network Packet Sniffer & Security Auditor', desc: 'Develop a custom network packet analyzer in C++ with Python intrusion detection scripts.' },
        { title: 'Automated Web Vulnerability Exploitation Suite', desc: 'Build an OWASP security testing engine auditing web application headers.' },
      ],
    },
    {
      id: 7,
      title: 'Embedded Systems & Smart IoT Sensor Gateway',
      slug: 'embedded-systems-smart-iot-gateway',
      description: 'Design smart sensor microcontrollers, MQTT gateways, and embedded firmware using C++ and Python.',
      outcomes: 'Program microcontroller boards, process real-time sensor telemetry, and interface with cloud MQTT brokers.',
      durationHours: 60,
      status: 'published',
      topicIds: [8, 7],
      techIds: [1, 2],
      amountInr: 2799.0,
      amountUsd: 45.0,
      testimonials: [
        { name: 'Pooja Reddy', role: 'IoT Firmware Engineer at Bosch', quote: 'Hands-on MQTT sensor programming is exactly what hardware companies want.', rating: 5 },
      ],
      faqs: [
        { q: 'Are physical hardware kits required?', a: 'No, hardware components are simulated virtually inside the workspace.' },
      ],
      projects: [
        { title: 'Smart Factory Environmental IoT Telemetry Hub', desc: 'Build an embedded C++ sensor node streaming telemetry over MQTT to a Python dashboard.' },
        { title: 'Low-Power Bluetooth Mesh Sensor Network', desc: 'Construct a firmware mesh network forwarding ambient telemetry readings.' },
      ],
    },
    {
      id: 8,
      title: 'Cloud Infrastructure Automation & Terraform GitOps',
      slug: 'cloud-infrastructure-automation-terraform',
      description: 'Architect Infrastructure as Code (IaC) with Terraform, AWS Cloud, and Go automation tools.',
      outcomes: 'Automate multi-region AWS cloud infrastructure provisioning using declarative Terraform configurations.',
      durationHours: 120,
      status: 'published',
      topicIds: [5, 6],
      techIds: [1, 8],
      amountInr: 3699.0,
      amountUsd: 59.0,
      testimonials: [
        { name: 'Amitabh Sen', role: 'Cloud Architect at HCL', quote: 'Terraform IaC best practices taught here are enterprise standard.', rating: 5 },
      ],
      faqs: [
        { q: 'Is AWS cloud credits included?', a: 'Yes, cloud workspace environments come pre-configured with access.' },
      ],
      projects: [
        { title: 'Multi-Region AWS Cloud VPC Infrastructure Blueprint', desc: 'Provision high-availability cloud infrastructure with Terraform modules and automated testing.' },
        { title: 'Serverless Cloud Function API Gateway Stack', desc: 'Build automated CI/CD for AWS Lambda and API Gateway deployments.' },
      ],
    },
    {
      id: 9,
      title: 'Generative AI & LLM Application Engineering',
      slug: 'generative-ai-llm-application-engineering',
      description: 'Build RAG pipelines, fine-tune open source LLMs, and construct AI agent workforces using LangChain and Python.',
      outcomes: 'Design vector search retrieval pipelines and deploy scalable LLM inference API endpoints.',
      durationHours: 180,
      status: 'published',
      topicIds: [3, 4],
      techIds: [1, 3],
      amountInr: 5499.0,
      amountUsd: 89.0,
      testimonials: [
        { name: 'Rithvik Shah', role: 'GenAI Engineer at Microsoft', quote: 'Building autonomous multi-agent swarms prepared me for cutting-edge AI roles.', rating: 5 },
      ],
      faqs: [
        { q: 'Which LLMs are used?', a: 'Open source Llama 3, Mistral, and OpenAI API integrations.' },
      ],
      projects: [
        { title: 'Enterprise Knowledge Base RAG Assistant Engine', desc: 'Build an AI assistant querying company documentation using vector embeddings and LLM orchestration.' },
        { title: 'Autonomous Multi-Agent Task Execution Swarm', desc: 'Construct a self-correcting agent workforce executing web research and automated code generation.' },
      ],
    },
    {
      id: 10,
      title: 'Enterprise Java Microservices & Spring Boot',
      slug: 'enterprise-java-microservices-spring-boot',
      description: 'Architect distributed microservice systems with Java 21, Spring Boot, Kafka, and Next.js frontend portals.',
      outcomes: 'Implement event-driven architecture, API gateway routing, and distributed transaction management.',
      durationHours: 120,
      status: 'published',
      topicIds: [1, 5],
      techIds: [5, 7],
      amountInr: 4299.0,
      amountUsd: 69.0,
      testimonials: [
        { name: 'Nikhil Saxena', role: 'Backend Lead at Morgan Stanley', quote: 'Spring Boot + Kafka event driven architecture mastered in 120 hours!', rating: 5 },
      ],
      faqs: [
        { q: 'Is JDK 21 supported?', a: 'Yes, JDK 21 virtual threads and modern Spring Boot 3.2 features are used.' },
      ],
      projects: [
        { title: 'Banking Event-Driven Payment Gateway System', desc: 'Build a fault-tolerant payment processor with Kafka event streaming and Spring Boot microservices.' },
        { title: 'High-Throughput Inventory Ledger Service', desc: 'Architect an ACID compliant distributed ledger tracking inventory allocations.' },
      ],
    },
  ];

  let globalProjCounter = 1;
  let globalStepCounter = 1;
  let globalTaskCounter = 1;
  let globalResCounter = 1;
  let globalTestimonialCounter = 1;
  let globalFaqCounter = 1;

  for (const p of programsData) {
    const program = await prisma.program.upsert({
      where: { id: p.id },
      update: {
        countryId: 1,
        title: p.title,
        slug: p.slug,
        description: p.description,
        outcomes: p.outcomes,
        durationHours: p.durationHours,
        status: p.status,
      },
      create: {
        id: p.id,
        countryId: 1,
        title: p.title,
        slug: p.slug,
        description: p.description,
        outcomes: p.outcomes,
        durationHours: p.durationHours,
        status: p.status,
      },
    });

    // MULTIPLE ProgramTopics per Program
    for (const tId of p.topicIds) {
      await prisma.programTopic.upsert({
        where: { programId_topicId: { programId: program.id, topicId: tId } },
        update: {},
        create: { programId: program.id, topicId: tId },
      });
    }

    // MULTIPLE ProgramTechnologies per Program
    for (const techId of p.techIds) {
      await prisma.programTechnology.upsert({
        where: { programId_technologyId: { programId: program.id, technologyId: techId } },
        update: {},
        create: { programId: program.id, technologyId: techId },
      });
    }

    // Multi-country pricings
    const pricingsToSeed = [
      { id: p.id * 10 + 1, countryId: 1, currency: 'INR', amount: p.amountInr },
      { id: p.id * 10 + 2, countryId: 2, currency: 'USD', amount: p.amountUsd },
      { id: p.id * 10 + 3, countryId: 3, currency: 'GBP', amount: Math.round(p.amountUsd * 0.8) },
      { id: p.id * 10 + 4, countryId: 4, currency: 'AED', amount: Math.round(p.amountUsd * 3.67) },
    ];

    for (const pr of pricingsToSeed) {
      await prisma.programPricing.upsert({
        where: { id: pr.id },
        update: { programId: program.id, countryId: pr.countryId as number, currency: pr.currency, amount: pr.amount, isActive: true },
        create: { id: pr.id, programId: program.id, countryId: pr.countryId as number, currency: pr.currency, amount: pr.amount, isActive: true },
      });
    }

    // MULTIPLE Testimonials per Program
    for (const tItem of p.testimonials) {
      const tId = globalTestimonialCounter++;
      await prisma.programTestimonial.upsert({
        where: { id: tId },
        update: {
          programId: program.id,
          authorName: tItem.name,
          authorRole: tItem.role,
          quote: tItem.quote,
          rating: tItem.rating,
          isActive: true,
        },
        create: {
          id: tId,
          programId: program.id,
          authorName: tItem.name,
          authorRole: tItem.role,
          quote: tItem.quote,
          rating: tItem.rating,
          isActive: true,
        },
      });
    }

    // MULTIPLE FAQs per Program
    for (const fItem of p.faqs) {
      const fId = globalFaqCounter++;
      await prisma.programFaq.upsert({
        where: { id: fId },
        update: {
          programId: program.id,
          question: fItem.q,
          answer: fItem.a,
          isActive: true,
        },
        create: {
          id: fId,
          programId: program.id,
          question: fItem.q,
          answer: fItem.a,
          isActive: true,
        },
      });
    }

    // MULTIPLE Capstone Projects per Program
    for (let projIdx = 0; projIdx < p.projects.length; projIdx++) {
      const projItem = p.projects[projIdx];
      const projId = globalProjCounter++;

      const project = await prisma.project.upsert({
        where: { id: projId },
        update: { programId: program.id, title: projItem.title, description: projItem.desc, orderIndex: projIdx + 1 },
        create: { id: projId, programId: program.id, title: projItem.title, description: projItem.desc, orderIndex: projIdx + 1 },
      });

      // WorkspaceTemplate
      const workspaceTemplate = await prisma.workspaceTemplate.upsert({
        where: { projectId: project.id },
        update: { version: 1, isActive: true },
        create: { id: projId, projectId: project.id, version: 1, isActive: true },
      });

      // MULTIPLE Tasks per Project (6 Tasks)
      for (let tIdx = 1; tIdx <= 6; tIdx++) {
        const taskId = globalTaskCounter++;
        const taskTitle = tIdx === 1
          ? `Task 1: ${projItem.title} - Architecture & Schema Blueprint`
          : tIdx === 2
          ? `Task 2: ${projItem.title} - Core API Route Setup`
          : tIdx === 3
          ? `Task 3: ${projItem.title} - Database Integrations`
          : tIdx === 4
          ? `Task 4: ${projItem.title} - Controller Core Logic`
          : tIdx === 5
          ? `Task 5: ${projItem.title} - Unit & Integration Testing`
          : `Task 6: ${projItem.title} - CI/CD pipeline Deployment`;

        const task = await prisma.templateTask.upsert({
          where: { id: taskId },
          update: {
            workspaceTemplateId: workspaceTemplate.id,
            orderIndex: tIdx,
            title: taskTitle,
            description: `Complete task ${tIdx} inside environment workspace.`,
          },
          create: {
            id: taskId,
            workspaceTemplateId: workspaceTemplate.id,
            orderIndex: tIdx,
            title: taskTitle,
            description: `Complete task ${tIdx} inside environment workspace.`,
          },
        });

        // Rubric for Task
        await prisma.rubric.upsert({
          where: { taskId: task.id },
          update: {
            version: 1,
            criteria: JSON.stringify([
              { criterion: 'Architecture Cleanliness', maxScore: 50 },
              { criterion: 'Code Quality & Unit Tests', maxScore: 50 },
            ]),
            maxScore: 100,
            passThreshold: 60,
          },
          create: {
            taskId: task.id,
            version: 1,
            criteria: JSON.stringify([
              { criterion: 'Architecture Cleanliness', maxScore: 50 },
              { criterion: 'Code Quality & Unit Tests', maxScore: 50 },
            ]),
            maxScore: 100,
            passThreshold: 60,
          },
        });

        // MULTIPLE Task Resources per Task (2 Resources per Task)
        for (let rIdx = 1; rIdx <= 2; rIdx++) {
          const resId = globalResCounter++;
          const resTitle = rIdx === 1
            ? `${projItem.title} - Official API Documentation`
            : `${projItem.title} - Reference Starter Repo`;
          const resUrl = rIdx === 1 ? 'https://docs.engineersclinic.com' : 'https://github.com/engineersclinic/starter-repo';

          await prisma.resource.upsert({
            where: { id: resId },
            update: {
              ownerType: 'TASK',
              taskId: task.id,
              type: rIdx === 1 ? 'DOCUMENT' : 'REPOSITORY',
              title: resTitle,
              url: resUrl,
            },
            create: {
              id: resId,
              ownerType: 'TASK',
              taskId: task.id,
              type: rIdx === 1 ? 'DOCUMENT' : 'REPOSITORY',
              title: resTitle,
              url: resUrl,
            },
          });
        }
      }
    }
  }

  console.log('  ✅ Total Seeded Projects: ' + (globalProjCounter - 1));
  console.log('  ✅ Total Seeded Tasks: ' + (globalTaskCounter - 1));
  console.log('  ✅ Total Seeded Task Resources: ' + (globalResCounter - 1));
  console.log('  ✅ Total Seeded Testimonials: ' + (globalTestimonialCounter - 1));
  console.log('  ✅ Total Seeded FAQs: ' + (globalFaqCounter - 1));

  console.log('🌱 Seeding Enrollments & StudentWorkspaces...');
  console.log('  🧹 Cleaning stale delivery execution tables...');
  await prisma.aiReview.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.taskProgress.deleteMany({});
  await prisma.workspaceTask.deleteMany({});
  await prisma.studentWorkspace.deleteMany({});
  await prisma.enrollmentProject.deleteMany({});
  await prisma.enrollment.deleteMany({});

  const enrollment = await prisma.enrollment.upsert({
    where: { id: 1 },
    update: { studentId: student.userid, programId: 1, status: 'ACTIVE' },
    create: { id: 1, studentId: student.userid, programId: 1, status: 'ACTIVE' },
  });

  let wsTaskIdCounter = 1;

  await seedStudentWorkspace(enrollment.id, 1, 1, ['PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED']);
  await seedStudentWorkspace(enrollment.id, 2, 2, ['PASSED', 'PASSED', 'PASSED', 'OPEN', 'LOCKED', 'LOCKED']);
  await seedStudentWorkspace(enrollment.id, 3, 3, ['LOCKED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED']);
  console.log('  ✅ Default Enrollment 1 seeded with 3 Capstone Projects (Project 1 Passed, Project 2 Active, Project 3 Locked)');

  console.log('🌱 Seeding Scenario Diversity (single, multi, partial, completed)...');

  const scenarioUsers = [
    { id: 5, email: 'priya@example.com', firstName: 'Priya', lastName: 'Iyer', collegeId: 1 },
    { id: 6, email: 'vikram@example.com', firstName: 'Vikram', lastName: 'Nair', collegeId: 2 },
    { id: 7, email: 'kavya@example.com', firstName: 'Kavya', lastName: 'Reddy', collegeId: 1 },
  ];

  async function seedStudentWorkspace(
    enrollmentId: number,
    projectId: number,
    orderIndex: number,
    stepStatuses: Array<'LOCKED' | 'OPEN' | 'PASSED' | 'NEEDS_WORK'>,
  ) {
    const allPassed = stepStatuses.length > 0 && stepStatuses.every((s) => s === 'PASSED');
    const anyActive = stepStatuses.some((s) => s === 'OPEN' || s === 'NEEDS_WORK' || s === 'PASSED');
    const projectStatus = allPassed ? 'DONE' : anyActive ? 'ACTIVE' : 'LOCKED';

    const ep = await prisma.enrollmentProject.upsert({
      where: {
        enrollmentId_projectId: { enrollmentId, projectId },
      },
      update: { orderIndex, status: projectStatus },
      create: { enrollmentId, projectId, orderIndex, status: projectStatus },
    });

    const workspace = await prisma.studentWorkspace.upsert({
      where: { enrollmentProjectId: ep.id },
      update: { workspaceTemplateId: projectId, templateVersion: 1 },
      create: { enrollmentProjectId: ep.id, workspaceTemplateId: projectId, templateVersion: 1 },
    });

    const templateTasks = await prisma.templateTask.findMany({
      where: { workspaceTemplate: { projectId } },
      orderBy: { orderIndex: 'asc' },
    });

    for (let i = 0; i < templateTasks.length; i++) {
      const tt = templateTasks[i];
      const status = stepStatuses[i] ?? 'LOCKED';
      const taskId = wsTaskIdCounter++;

      const newWsTask = await prisma.workspaceTask.upsert({
        where: { id: taskId },
        update: {
          studentWorkspaceId: workspace.id,
          templateTaskId: tt.id,
          orderIndex: tt.orderIndex,
          title: tt.title,
          description: tt.description,
        },
        create: {
          id: taskId,
          studentWorkspaceId: workspace.id,
          templateTaskId: tt.id,
          orderIndex: tt.orderIndex,
          title: tt.title,
          description: tt.description,
        },
      });

      const passed = status === 'PASSED';
      const opened = status === 'OPEN' || status === 'NEEDS_WORK' || passed;
      await prisma.taskProgress.upsert({
        where: { workspaceTaskId: newWsTask.id },
        update: {
          status,
          resubmissionCount: status === 'NEEDS_WORK' ? 1 : 0,
          unlockedAt: opened ? new Date() : null,
          passedAt: passed ? new Date() : null,
        },
        create: {
          workspaceTaskId: newWsTask.id,
          status,
          resubmissionCount: status === 'NEEDS_WORK' ? 1 : 0,
          unlockedAt: opened ? new Date() : null,
          passedAt: passed ? new Date() : null,
        },
      });

      if (opened) {
        const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
        if (enrollment) {
          const subId = 1000 + newWsTask.id;
          const subStatus = passed ? 'PASSED' : status === 'NEEDS_WORK' ? 'NEEDS_WORK' : 'EVALUATING';
          const sub = await prisma.submission.upsert({
            where: { id: subId },
            update: {
              workspaceTaskId: newWsTask.id,
              studentId: enrollment.studentId,
              payloadUrl: `https://github.com/engineersclinic/capstone-task-${newWsTask.id}-submission`,
              status: subStatus,
              attemptIndex: status === 'NEEDS_WORK' ? 2 : 1,
            },
            create: {
              id: subId,
              workspaceTaskId: newWsTask.id,
              studentId: enrollment.studentId,
              payloadUrl: `https://github.com/engineersclinic/capstone-task-${newWsTask.id}-submission`,
              status: subStatus,
              attemptIndex: status === 'NEEDS_WORK' ? 2 : 1,
            },
          });

          if (passed || status === 'NEEDS_WORK') {
            const score = passed ? (85 + (newWsTask.id % 10)) : 45;
            await prisma.aiReview.upsert({
              where: { submissionId: sub.id },
              update: {
                score,
                maxScore: 100,
                passed,
                criteriaBreakdown: [
                  { criterion: 'Architecture Cleanliness', score: passed ? 45 : 20, maxScore: 50 },
                  { criterion: 'Code Quality & Unit Tests', score: passed ? (score - 45) : 25, maxScore: 50 },
                ],
                feedback: passed
                  ? 'Clean API controller isolation and zero lint errors across all microservice routes.'
                  : 'Unit tests failed for edge case handling. Please fix failing assertions and resubmit.',
                improvements: passed ? 'Consider adding Redis caching for hot paths.' : 'Fix broken unit test specs in test/suite.spec.ts',
              },
              create: {
                submissionId: sub.id,
                score,
                maxScore: 100,
                passed,
                criteriaBreakdown: [
                  { criterion: 'Architecture Cleanliness', score: passed ? 45 : 20, maxScore: 50 },
                  { criterion: 'Code Quality & Unit Tests', score: passed ? (score - 45) : 25, maxScore: 50 },
                ],
                feedback: passed
                  ? 'Clean API controller isolation and zero lint errors across all microservice routes.'
                  : 'Unit tests failed for edge case handling. Please fix failing assertions and resubmit.',
                improvements: passed ? 'Consider adding Redis caching for hot paths.' : 'Fix broken unit test specs in test/suite.spec.ts',
              },
            });
          }
        }
      }
    }
  }

  for (const su of scenarioUsers) {
    await prisma.user.upsert({
      where: { id: su.id },
      update: { email: su.email, password: hashedPassword, phoneNo: '98765432' + su.id, roleId: 4, countryId: 1, status: 'active' },
      create: { id: su.id, email: su.email, password: hashedPassword, phoneNo: '98765432' + su.id, roleId: 4, countryId: 1, status: 'active' },
    });
    await prisma.student.upsert({
      where: { userid: su.id },
      update: { firstName: su.firstName, lastName: su.lastName, collegeId: su.collegeId },
      create: { userid: su.id, firstName: su.firstName, lastName: su.lastName, collegeId: su.collegeId },
    });
  }

  // Priya: Cybersecurity Incident Response (Program 6)
  const priyaEnrollment = await prisma.enrollment.upsert({
    where: { id: 2 },
    update: { studentId: 5, programId: 6, status: 'ACTIVE' },
    create: { id: 2, studentId: 5, programId: 6, status: 'ACTIVE' },
  });
  await seedStudentWorkspace(priyaEnrollment.id, 11, 1, ['PASSED', 'OPEN', 'LOCKED']);
  await seedStudentWorkspace(priyaEnrollment.id, 12, 2, ['OPEN', 'LOCKED', 'LOCKED']);

  // Vikram: MULTIPLE programs (Cloud Infrastructure + Full Stack)
  const vikramP1 = await prisma.enrollment.upsert({
    where: { id: 3 },
    update: { studentId: 6, programId: 8, status: 'ACTIVE' },
    create: { id: 3, studentId: 6, programId: 8, status: 'ACTIVE' },
  });
  await seedStudentWorkspace(vikramP1.id, 15, 1, ['PASSED', 'PASSED', 'OPEN']);
  await seedStudentWorkspace(vikramP1.id, 16, 2, ['PASSED', 'OPEN', 'LOCKED']);

  const vikramP2 = await prisma.enrollment.upsert({
    where: { id: 4 },
    update: { studentId: 6, programId: 1, status: 'ACTIVE' },
    create: { id: 4, studentId: 6, programId: 1, status: 'ACTIVE' },
  });
  await seedStudentWorkspace(vikramP2.id, 1, 1, ['OPEN', 'LOCKED']);
  await seedStudentWorkspace(vikramP2.id, 2, 2, ['LOCKED', 'LOCKED']);

  // Kavya: Embedded Systems & Smart IoT Sensor Gateway (Program 7), ALL steps COMPLETED
  const kavyaEnrollment = await prisma.enrollment.upsert({
    where: { id: 5 },
    update: { studentId: 7, programId: 7, status: 'COMPLETED', completedAt: new Date() },
    create: { id: 5, studentId: 7, programId: 7, status: 'COMPLETED', completedAt: new Date() },
  });
  await seedStudentWorkspace(kavyaEnrollment.id, 13, 1, ['PASSED', 'PASSED', 'PASSED']);
  await seedStudentWorkspace(kavyaEnrollment.id, 14, 2, ['PASSED', 'PASSED', 'PASSED']);
  console.log('  ✅ Scenario students seeded with distinct programs: Priya (Cybersecurity), Vikram (Cloud + Fullstack), Kavya (IoT Completed)');

  await prisma.$disconnect();
  console.log('✨ GRANULAR RESOURCE-ACTION PERMISSIONS SEEDED SUCCESSFULLY!');
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
