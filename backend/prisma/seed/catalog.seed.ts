import { PrismaClient } from '@prisma/client';

export async function seedCatalog(prisma: PrismaClient) {
  console.log('📚 [5/7] Seeding Academic Curriculum, Programs, Rubrics & Capstones...');

  // =========================================================================
  // 1. CLUSTERS (5 Academic Engineering Clusters)
  // =========================================================================
  const clusters = [
    {
      slug: 'software-engineering',
      name: 'Software Engineering & Full Stack',
      description: 'Production-ready web platforms, distributed microservices, and modern frontend architectures.',
    },
    {
      slug: 'ai-data-science',
      name: 'Artificial Intelligence & Data Science',
      description: 'Generative AI, Large Language Models, Deep Neural Networks, and Big Data Engineering.',
    },
    {
      slug: 'cloud-devops',
      name: 'Cloud Computing & DevOps',
      description: 'Cloud Native Microservices, Kubernetes orchestration, Infrastructure as Code, and CI/CD automation.',
    },
    {
      slug: 'cybersecurity',
      name: 'Cybersecurity & Ethical Defense',
      description: 'Vulnerability assessment, web penetration testing, network defense, SOC operations, and zero-trust security.',
    },
    {
      slug: 'embedded-iot',
      name: 'Embedded Systems & IoT',
      description: 'Firmware programming, microcontrollers, sensor integration, real-time operating systems, and industrial IoT.',
    },
  ];

  for (const c of clusters) {
    await prisma.cluster.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: { name: c.name, slug: c.slug, description: c.description },
    });
  }

  // =========================================================================
  // 2. TOPICS (18 Specialized Domain Topics across all 5 Clusters)
  // =========================================================================
  const topics = [
    // Software Engineering
    { clusterSlug: 'software-engineering', slug: 'fullstack-web-dev', name: 'Full Stack Web Development' },
    { clusterSlug: 'software-engineering', slug: 'distributed-microservices', name: 'Distributed Microservices & APIs' },
    { clusterSlug: 'software-engineering', slug: 'mobile-app-dev', name: 'Cross-Platform Mobile Engineering' },
    { clusterSlug: 'software-engineering', slug: 'frontend-architecture', name: 'Advanced Frontend Architecture' },

    // AI & Data Science
    { clusterSlug: 'ai-data-science', slug: 'machine-learning', name: 'Machine Learning & Deep Neural Nets' },
    { clusterSlug: 'ai-data-science', slug: 'generative-ai-llms', name: 'Generative AI & Agentic LLMs' },
    { clusterSlug: 'ai-data-science', slug: 'data-engineering', name: 'Big Data Engineering & Streaming' },
    { clusterSlug: 'ai-data-science', slug: 'computer-vision', name: 'Computer Vision & Edge Deep Learning' },

    // Cloud & DevOps
    { clusterSlug: 'cloud-devops', slug: 'cloud-devops', name: 'Cloud Native Architecture & CI/CD' },
    { clusterSlug: 'cloud-devops', slug: 'site-reliability', name: 'Site Reliability Engineering (SRE)' },
    { clusterSlug: 'cloud-devops', slug: 'infrastructure-as-code', name: 'Infrastructure as Code (IaC)' },

    // Cybersecurity
    { clusterSlug: 'cybersecurity', slug: 'cyber-security', name: 'Offensive Security & Ethical Hacking' },
    { clusterSlug: 'cybersecurity', slug: 'cloud-security', name: 'Cloud Security & Zero-Trust Defense' },
    { clusterSlug: 'cybersecurity', slug: 'soc-incident-response', name: 'SOC Operations & Threat Hunting' },

    // Embedded Systems & IoT
    { clusterSlug: 'embedded-iot', slug: 'embedded-iot-systems', name: 'Embedded Firmware & IoT Systems' },
    { clusterSlug: 'embedded-iot', slug: 'automotive-embedded', name: 'Automotive CAN Bus & AUTOSAR' },
    { clusterSlug: 'embedded-iot', slug: 'robotics-sensors', name: 'Robotics, RTOS & Sensor Fusion' },
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

  // =========================================================================
  // 3. TECHNOLOGIES (30 Industry Standard Tools & Frameworks)
  // =========================================================================
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
    { slug: 'aws', name: 'AWS Cloud' },
    { slug: 'python', name: 'Python 3.12' },
    { slug: 'pytorch', name: 'PyTorch' },
    { slug: 'langchain', name: 'LangChain & OpenAI' },
    { slug: 'redis', name: 'Redis & BullMQ' },
    { slug: 'graphql', name: 'GraphQL' },
    { slug: 'kafka', name: 'Apache Kafka' },
    { slug: 'terraform', name: 'Terraform' },
    { slug: 'prometheus', name: 'Prometheus & Grafana' },
    { slug: 'go', name: 'Go (Golang)' },
    { slug: 'cpp', name: 'C / C++' },
    { slug: 'react-native', name: 'React Native' },
    { slug: 'fastapi', name: 'FastAPI' },
    { slug: 'qdrant', name: 'Qdrant Vector DB' },
    { slug: 'wireshark', name: 'Wireshark' },
    { slug: 'metasploit', name: 'Metasploit' },
    { slug: 'esp32', name: 'ESP32 & Arduino' },
    { slug: 'freertos', name: 'FreeRTOS' },
    { slug: 'spark', name: 'Apache Spark' },
    { slug: 'ansible', name: 'Ansible' },
    { slug: 'suricata', name: 'Suricata IDS/IPS' },
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: { name: tech.name, isActive: true },
      create: { name: tech.name, slug: tech.slug, isActive: true },
    });
  }

  // =========================================================================
  // 4. SELLABLE INTERNSHIP PROGRAMS (15 Programs across all 5 Clusters)
  // =========================================================================
  const programsData = [
    // -----------------------------------------------------------------------
    // Cluster 1: Software Engineering & Full Stack
    // -----------------------------------------------------------------------
    {
      countryId: 1,
      title: 'Full Stack Web Engineering & Cloud Architecture',
      slug: 'fullstack-web-engineering',
      description:
        'A comprehensive industry internship delivering 3 real-world production projects with NestJS, Next.js App Router, Prisma ORM, MySQL, and Dockerized microservices.',
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
      projects: [
        {
          title: 'Production Backend API with NestJS, Prisma & MySQL',
          description: 'Architect a modular REST API with JWT authentication, RBAC authorization guards, validation pipes, relational Prisma schema, and Jest E2E test suites.',
          tasks: [
            {
              title: 'Database Schema Modeling & Migration Setup',
              description: 'Design multi-table relational schema for users, auth tokens, and business entities. Execute migrations and write initial seed fixtures.',
              criteria: [
                { name: 'Schema Normalization', maxScore: 30, description: 'Correct foreign key constraints, indexes, and field types.' },
                { name: 'Migration Integrity', maxScore: 30, description: 'Clean Prisma migration execution and seed script.' },
                { name: 'Type Safety', maxScore: 40, description: 'Strict TypeScript typing without any any casting.' },
              ],
            },
            {
              title: 'Authentication & Guard-Protected Endpoints',
              description: 'Implement register/login endpoints with bcrypt password hashing, Passport JWT strategies, refresh token rotation, and role-based permissions decorators.',
              criteria: [
                { name: 'Security & Hashing', maxScore: 35, description: 'Bcrypt salt rounds >= 10, safe token expiry handling.' },
                { name: 'Guards & Decorators', maxScore: 35, description: 'Robust AuthGuard & PermissionsGuard middleware.' },
                { name: 'Validation Pipes', maxScore: 30, description: 'class-validator DTOs on all incoming request payloads.' },
              ],
            },
          ],
        },
        {
          title: 'Responsive Next.js 16 Web Dashboard & Client Portal',
          description: 'Build a modern, role-aware client application using Next.js App Router, Tailwind CSS, custom responsive navigation, and real-time state synchronization.',
          tasks: [
            {
              title: 'Interactive Dashboard Layout & Dynamic Navigation',
              description: 'Develop the main dashboard layout with responsive collapsible sidebar and role-based tab routing.',
              criteria: [
                { name: 'Responsive Viewports', maxScore: 40, description: 'Flawless UI behavior on desktop, tablet, and mobile screens.' },
                { name: 'Component Modularity', maxScore: 30, description: 'Clean separation of shared, student, and admin components.' },
                { name: 'Accessibility', maxScore: 30, description: 'Semantic HTML, focus states, and Tailwind token usage.' },
              ],
            },
            {
              title: 'API Integration & Interactive DataTables',
              description: 'Connect client API services with JWT bearer tokens. Build sortable, searchable datatables with pagination controls.',
              criteria: [
                { name: 'Client Error Handling', maxScore: 35, description: 'Graceful toast error handling and loading spinners.' },
                { name: 'DataTable UX & Performance', maxScore: 35, description: 'Fast search filtering, multi-field sorting, and pagination.' },
                { name: 'State Management', maxScore: 30, description: 'Clean React hooks without unnecessary re-renders.' },
              ],
            },
          ],
        },
        {
          title: 'Scalable Microservices, BullMQ Queue & Deployment',
          description: 'Containerize the application with multi-stage Dockerfiles, set up Redis-backed BullMQ asynchronous job queues, and deploy with Nginx reverse proxy.',
          tasks: [
            {
              title: 'Docker Containerization & Compose Orchestration',
              description: 'Create production-grade multi-stage Dockerfiles for backend and frontend. Configure docker-compose with MariaDB and Redis.',
              criteria: [
                { name: 'Image Size Optimization', maxScore: 35, description: 'Multi-stage builds, non-root user execution.' },
                { name: 'Compose Configuration', maxScore: 35, description: 'Environment variables, volume mounts, and service networking.' },
                { name: 'Health Checks', maxScore: 30, description: 'Configured liveness and readiness health checks.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Distributed Microservices & Event-Driven Backends',
      slug: 'distributed-microservices-backend',
      description:
        'Master scalable high-throughput microservices using Go, Apache Kafka event streaming, PostgreSQL partitioning, and Kubernetes deployment.',
      durationHours: 100,
      status: 'published',
      outcomes:
        'Build high-performance Go RPC services; Architect Kafka event producers/consumers; Implement saga patterns for distributed transactions; Deploy on Kubernetes.',
      topicSlug: 'distributed-microservices',
      techSlugs: ['go', 'kafka', 'postgresql', 'redis', 'kubernetes', 'docker'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5499.0 },
        { countryId: 2, currency: 'USD', amount: 169.0 },
        { countryId: 3, currency: 'GBP', amount: 129.0 },
        { countryId: 4, currency: 'AED', amount: 599.0 },
      ],
      projects: [
        {
          title: 'High-Concurrency Go API Gateway & Auth Service',
          description: 'Build a low-latency API gateway handling rate limiting, token introspection, and reverse routing with Go and Redis.',
          tasks: [
            {
              title: 'Gateway Reverse Routing & Token Verification',
              description: 'Implement reverse proxy request dispatching, JWT claims caching in Redis, and distributed rate limiting.',
              criteria: [
                { name: 'Throughput & Latency', maxScore: 40, description: 'Benchmarked with wrk/hey for sub-5ms routing overhead.' },
                { name: 'Concurrent Goroutine Safety', maxScore: 30, description: 'Zero race conditions verified with go test -race.' },
                { name: 'Configuration & Metrics', maxScore: 30, description: 'Structured JSON logging and Prometheus middleware.' },
              ],
            },
          ],
        },
        {
          title: 'Kafka Event-Driven Order Processing Engine',
          description: 'Design asynchronous order intake and billing pipelines with partitioned Kafka topics and idempotent consumers.',
          tasks: [
            {
              title: 'Kafka Producer/Consumer Group Implementation',
              description: 'Publish transactional events and handle partition rebalances with exactly-once consumer semantics.',
              criteria: [
                { name: 'Idempotency & Deduplication', maxScore: 40, description: 'Guaranteed message deduplication in PostgreSQL.' },
                { name: 'Failure & Dead-Letter Handling', maxScore: 30, description: 'Structured DLT retry mechanism.' },
                { name: 'Schema Evolution', maxScore: 30, description: 'Avro / JSON schema backward compatibility.' },
              ],
            },
          ],
        },
        {
          title: 'Kubernetes Cluster Manifests & Helm Deployment',
          description: 'Write production Helm charts with ConfigMaps, Secrets, Horizontal Pod Autoscaling (HPA), and ingress TLS rules.',
          tasks: [
            {
              title: 'Helm Chart Packaging & Cluster Rolling Updates',
              description: 'Deploy Go services and Kafka brokers into Minikube / EKS with zero-downtime rolling update strategies.',
              criteria: [
                { name: 'HPA & Resource Limits', maxScore: 35, description: 'Appropriate CPU/Memory request and limit definitions.' },
                { name: 'Security Contexts', maxScore: 35, description: 'ReadOnlyRootFilesystem and non-privileged containers.' },
                { name: 'Probes & Ingress', maxScore: 30, description: 'Working liveness/readiness probes and ingress host routing.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Cross-Platform Mobile App Engineering with React Native',
      slug: 'crossplatform-mobile-app-engineering',
      description:
        'Build native iOS & Android applications with React Native, TypeScript, Redux Toolkit, offline SQLite caching, and REST/GraphQL backend sync.',
      durationHours: 90,
      status: 'published',
      outcomes:
        'Develop native-feeling mobile UI layouts; Manage global state with Redux; Implement offline-first local storage; Integrate push notifications & biometric auth.',
      topicSlug: 'mobile-app-dev',
      techSlugs: ['react-native', 'react', 'typescript', 'graphql', 'nestjs'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4499.0 },
        { countryId: 2, currency: 'USD', amount: 139.0 },
        { countryId: 3, currency: 'GBP', amount: 109.0 },
        { countryId: 4, currency: 'AED', amount: 499.0 },
      ],
      projects: [
        {
          title: 'Mobile UI Kit & Navigation Architecture',
          description: 'Construct a reusable atomic UI design system with React Navigation tabs, stacks, and fluid gesture animations.',
          tasks: [
            {
              title: 'React Navigation & Safe Area Layout',
              description: 'Implement dark/light themes, nested tab navigators, and responsive notch/island layouts.',
              criteria: [
                { name: 'Navigation Fluidity', maxScore: 40, description: '60 FPS transition animations on iOS and Android.' },
                { name: 'Design Consistency', maxScore: 30, description: 'Modular theme tokens and reusable typography.' },
                { name: 'Platform Parity', maxScore: 30, description: 'Pixel-perfect rendering on both platforms.' },
              ],
            },
          ],
        },
        {
          title: 'Offline-First Data Sync & Local Cache Engine',
          description: 'Synchronize remote GraphQL/REST feeds with local SQLite storage for offline browsing and queued mutation sync.',
          tasks: [
            {
              title: 'Async Storage & Network State Interceptor',
              description: 'Queue outbound API mutations while offline and automatically replay on network reconnection.',
              criteria: [
                { name: 'Offline Data Reliability', maxScore: 40, description: 'Zero state corruption during intermittent connectivity.' },
                { name: 'Conflict Resolution', maxScore: 30, description: 'Timestamp-based conflict resolution.' },
                { name: 'Optimistic UI Updates', maxScore: 30, description: 'Instant UI response with rollback handling.' },
              ],
            },
          ],
        },
        {
          title: 'Native Device Features & App Store Release Build',
          description: 'Integrate biometric FaceID login, camera uploads, push notifications, and configure EAS production builds.',
          tasks: [
            {
              title: 'Biometric Auth & Native Camera Integration',
              description: 'Implement secure keychain storage for refresh tokens unlocked via native fingerprint/FaceID sensors.',
              criteria: [
                { name: 'Keychain Security', maxScore: 40, description: 'Encrypted storage with hardware keystore backed security.' },
                { name: 'Permissions Handling', maxScore: 30, description: 'Graceful camera/photo library permission prompts.' },
                { name: 'Build Packaging', maxScore: 30, description: 'Clean Android APK/AAB bundle generation.' },
              ],
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Cluster 2: Artificial Intelligence & Data Science
    // -----------------------------------------------------------------------
    {
      countryId: 1,
      title: 'Applied AI, Machine Learning & LLM Systems',
      slug: 'applied-ai-machine-learning',
      description:
        'Hands-on capstone internship in Machine Learning algorithms, Deep Learning with PyTorch, and production RAG (Retrieval-Augmented Generation) applications with LangChain.',
      durationHours: 120,
      status: 'published',
      outcomes:
        'Train neural network classifiers; Deploy LLM agentic pipelines; Implement vector embeddings with Qdrant; Serve low-latency inference APIs.',
      topicSlug: 'machine-learning',
      techSlugs: ['typescript', 'python', 'pytorch', 'langchain', 'postgresql', 'docker', 'fastapi'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5999.0 },
        { countryId: 2, currency: 'USD', amount: 179.0 },
        { countryId: 3, currency: 'GBP', amount: 139.0 },
        { countryId: 4, currency: 'AED', amount: 649.0 },
      ],
      projects: [
        {
          title: 'Supervised Learning & Deep Neural Network Classifiers',
          description: 'Develop end-to-end data preprocessing, feature engineering, and train PyTorch deep learning models with cross-validation.',
          tasks: [
            {
              title: 'Dataset Pipeline & Neural Architecture',
              description: 'Implement PyTorch Dataset/DataLoader, custom MLP/CNN architectures, and loss optimization with AdamW.',
              criteria: [
                { name: 'Model Accuracy', maxScore: 40, description: 'Evaluation metrics precision/recall/F1 above target threshold.' },
                { name: 'Overfitting Mitigation', maxScore: 30, description: 'Dropout, batch normalization, and early stopping.' },
                { name: 'Code Modularity', maxScore: 30, description: 'Clean OOP PyTorch module design.' },
              ],
            },
          ],
        },
        {
          title: 'Retrieval-Augmented Generation (RAG) with LangChain & Qdrant',
          description: 'Build a production generative AI knowledge assistant using LangChain, Qdrant vector database, chunking strategies, and OpenAI embeddings.',
          tasks: [
            {
              title: 'Document Ingestion & Semantic Search Pipeline',
              description: 'Parse PDFs/markdown, compute vector embeddings, and implement hybrid semantic search with re-ranking.',
              criteria: [
                { name: 'Retrieval Precision', maxScore: 40, description: 'Accurate chunk relevance without hallucination.' },
                { name: 'Context Window Optimization', maxScore: 30, description: 'Compact prompt construction.' },
                { name: 'Vector Index Performance', maxScore: 30, description: 'Sub-50ms vector query execution.' },
              ],
            },
          ],
        },
        {
          title: 'Autonomous Multi-Agent AI System & API Deployment',
          description: 'Implement an autonomous agentic pair programming assistant with tool calling, memory management, and deploy with FastAPI in Docker.',
          tasks: [
            {
              title: 'FastAPI Production Inference Server',
              description: 'Build asynchronous streaming endpoints with SSE (Server-Sent Events) and containerize with Docker.',
              criteria: [
                { name: 'Streaming Response', maxScore: 40, description: 'Smooth token-by-token streaming.' },
                { name: 'Error Handling', maxScore: 30, description: 'API rate limit and timeout fallbacks.' },
                { name: 'Container Readiness', maxScore: 30, description: 'Non-root Docker container execution.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Generative AI Engineering & Autonomous Agents',
      slug: 'generative-ai-agentic-systems',
      description:
        'Architect advanced AI agents with multi-step reasoning, tool execution, structured output validation, and LangGraph multi-agent orchestration.',
      durationHours: 90,
      status: 'published',
      outcomes:
        'Build LangGraph stateful multi-agent workflows; Implement automated code synthesis tools; Enforce strict Pydantic JSON schemas; Deploy serverless AI workers.',
      topicSlug: 'generative-ai-llms',
      techSlugs: ['python', 'langchain', 'fastapi', 'qdrant', 'docker'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5499.0 },
        { countryId: 2, currency: 'USD', amount: 169.0 },
        { countryId: 3, currency: 'GBP', amount: 129.0 },
        { countryId: 4, currency: 'AED', amount: 599.0 },
      ],
      projects: [
        {
          title: 'Autonomous Multi-Agent Workflow Engine',
          description: 'Design a cooperative supervisor-worker agent system capable of web search, Python code execution, and summarizing results.',
          tasks: [
            {
              title: 'LangGraph State Graph & Tool Binding',
              description: 'Define conditional branching edges, state reduction, and secure sandboxed tool execution.',
              criteria: [
                { name: 'Agent Reasoning Flow', maxScore: 40, description: 'Correct tool invocation decisions and loop termination.' },
                { name: 'State Persistence', maxScore: 30, description: 'Fault-tolerant checkpointing of conversation memory.' },
                { name: 'Sandboxing', maxScore: 30, description: 'Safe code evaluation with execution timeouts.' },
              ],
            },
          ],
        },
        {
          title: 'Structured Output Extraction & Data Synthesis',
          description: 'Extract complex nested JSON entities from unstructured legal and technical documents with 99.5% schema adherence.',
          tasks: [
            {
              title: 'Pydantic Schema Validation & Repair Logic',
              description: 'Implement self-correcting validation loops that re-prompt the LLM on schema validation errors.',
              criteria: [
                { name: 'Schema Conformance', maxScore: 40, description: '100% valid Pydantic type matching across 100 test cases.' },
                { name: 'Cost Optimization', maxScore: 30, description: 'Efficient token usage with minimal re-prompt overhead.' },
                { name: 'Benchmarking', maxScore: 30, description: 'Automated evaluation dataset with accuracy metrics.' },
              ],
            },
          ],
        },
        {
          title: 'Production Agent API & Observability Gateway',
          description: 'Deploy the agent system with OpenTelemetry tracing, LangSmith telemetry logging, and token cost budgeting.',
          tasks: [
            {
              title: 'Telemetry & Cost Monitoring Server',
              description: 'Expose FastAPI endpoints with user-level token rate limits and detailed step-by-step reasoning logs.',
              criteria: [
                { name: 'Trace Visibility', maxScore: 40, description: 'Full trace visualization for every tool call.' },
                { name: 'Rate Limiting', maxScore: 30, description: 'Token budget enforcement per user key.' },
                { name: 'API Docs', maxScore: 30, description: 'Comprehensive OpenAPI Swagger documentation.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Big Data Engineering & Real-Time Streaming',
      slug: 'big-data-streaming-pipelines',
      description:
        'Engineer distributed data lakes, Apache Spark transformation jobs, and real-time Kafka streaming analytics pipelines for multi-terabyte datasets.',
      durationHours: 100,
      status: 'published',
      outcomes:
        'Build Apache Spark batch processing jobs; Stream IoT metrics with Kafka & Spark Streaming; Architect Delta Lake storage; Query data with PySpark SQL.',
      topicSlug: 'data-engineering',
      techSlugs: ['spark', 'kafka', 'python', 'postgresql', 'docker'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5199.0 },
        { countryId: 2, currency: 'USD', amount: 159.0 },
        { countryId: 3, currency: 'GBP', amount: 119.0 },
        { countryId: 4, currency: 'AED', amount: 569.0 },
      ],
      projects: [
        {
          title: 'Distributed ETL Pipeline with Apache Spark',
          description: 'Process raw multi-gigabyte log datasets, perform aggregations, handle schema drift, and write optimized Parquet tables.',
          tasks: [
            {
              title: 'PySpark Transformation & Partitioning',
              description: 'Implement distributed DataFrame transformations with broadcast joins and custom UDFs.',
              criteria: [
                { name: 'Spark Job Performance', maxScore: 40, description: 'Optimized shuffle partitions avoiding data skews.' },
                { name: 'Data Cleanliness', maxScore: 30, description: 'Null handling and data type validation.' },
                { name: 'Storage Optimization', maxScore: 30, description: 'Snappy-compressed Parquet partitioned by date.' },
              ],
            },
          ],
        },
        {
          title: 'Real-Time Streaming Anomaly Detection Engine',
          description: 'Consume high-frequency IoT sensor telemetry from Kafka, apply sliding time-window aggregations, and emit anomaly alerts.',
          tasks: [
            {
              title: 'Structured Streaming & Watermarking',
              description: 'Configure Spark Structured Streaming with 10-minute tumbling windows and event-time watermarking.',
              criteria: [
                { name: 'Late Data Handling', maxScore: 40, description: 'Accurate watermarking capturing out-of-order events.' },
                { name: 'Sink Reliability', maxScore: 30, description: 'Checkpointing ensuring zero event loss.' },
                { name: 'Alert Latency', maxScore: 30, description: 'End-to-end processing delay under 2 seconds.' },
              ],
            },
          ],
        },
        {
          title: 'Analytics Data Warehouse & Superset Visualizations',
          description: 'Load processed facts and dimensions into PostgreSQL / ClickHouse and build real-time executive analytics dashboards.',
          tasks: [
            {
              title: 'Star Schema Modeling & Fast Indexing',
              description: 'Design analytical tables with BRIN/B-Tree indexes and materialized views for sub-second dashboard queries.',
              criteria: [
                { name: 'Query Speed', maxScore: 40, description: 'Sub-500ms aggregation queries across 10M rows.' },
                { name: 'Data Freshness', maxScore: 30, description: 'Automated materialized view refresh triggers.' },
                { name: 'Schema Integrity', maxScore: 30, description: 'Strict dimensional constraints and surrogate keys.' },
              ],
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Cluster 3: Cloud Computing & DevOps
    // -----------------------------------------------------------------------
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
      techSlugs: ['docker', 'kubernetes', 'aws', 'terraform', 'redis', 'typescript'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5499.0 },
        { countryId: 2, currency: 'USD', amount: 169.0 },
        { countryId: 3, currency: 'GBP', amount: 129.0 },
        { countryId: 4, currency: 'AED', amount: 599.0 },
      ],
      projects: [
        {
          title: 'Multi-Tier AWS Cloud Infrastructure with Terraform',
          description: 'Provision VPC, public/private subnets, NAT gateways, ALB, and RDS Postgres using modular Terraform code.',
          tasks: [
            {
              title: 'VPC Networking & Security Groups',
              description: 'Write reusable Terraform modules for networking with strict ingress/egress rules and remote S3 state locks.',
              criteria: [
                { name: 'Module Reusability', maxScore: 40, description: 'Clean input variables and output definitions.' },
                { name: 'State Security', maxScore: 30, description: 'Encrypted remote backend with DynamoDB locking.' },
                { name: 'Least Privilege', maxScore: 30, description: 'Isolated database subnet without public IP exposure.' },
              ],
            },
          ],
        },
        {
          title: 'Kubernetes Microservices & GitOps with ArgoCD',
          description: 'Deploy a microservices application onto Kubernetes with automated GitOps synchronization and canary deployments.',
          tasks: [
            {
              title: 'K8s Deployment, Service & Ingress Rules',
              description: 'Configure ConfigMaps, Secrets, ClusterIP services, NGINX ingress controller, and cert-manager SSL.',
              criteria: [
                { name: 'Zero-Downtime Rollouts', maxScore: 40, description: 'Rolling update strategy with health check probes.' },
                { name: 'Secret Management', maxScore: 30, description: 'SealedSecrets / ExternalSecrets integration.' },
                { name: 'Pod Security Standards', maxScore: 30, description: 'Non-root containers with dropped capabilities.' },
              ],
            },
          ],
        },
        {
          title: 'Enterprise CI/CD Pipelines & Security Scanning',
          description: 'Build automated GitHub Actions workflows with linting, unit tests, Docker build caching, Trivy vulnerability scanning, and deploy stages.',
          tasks: [
            {
              title: 'GitHub Actions Matrix & Trivy Scanning',
              description: 'Implement multi-stage CI workflows that halt on critical CVE vulnerabilities and publish images to AWS ECR.',
              criteria: [
                { name: 'Pipeline Speed', maxScore: 40, description: 'BuildKit layer caching reducing CI run to sub-3 minutes.' },
                { name: 'Security Scanning', maxScore: 30, description: 'Automated vulnerability scanning and SARIF reporting.' },
                { name: 'Environment Gating', maxScore: 30, description: 'Manual approval gates for production deployments.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Site Reliability Engineering (SRE) & Observability',
      slug: 'sre-observability-engineering',
      description:
        'Implement enterprise observability with Prometheus metric exporters, Grafana monitoring dashboards, OpenTelemetry distributed tracing, and Chaos Engineering experiments.',
      durationHours: 90,
      status: 'published',
      outcomes:
        'Formulate SLIs/SLOs and error budgets; Instrument applications with OpenTelemetry; Configure Alertmanager routing; Conduct chaos injection tests.',
      topicSlug: 'site-reliability',
      techSlugs: ['prometheus', 'grafana', 'kubernetes', 'docker', 'go'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4899.0 },
        { countryId: 2, currency: 'USD', amount: 149.0 },
        { countryId: 3, currency: 'GBP', amount: 119.0 },
        { countryId: 4, currency: 'AED', amount: 539.0 },
      ],
      projects: [
        {
          title: 'Prometheus Metric Exporters & Grafana Dashboard Suite',
          description: 'Instrument Go and Node.js microservices with RED (Rate, Errors, Duration) metrics and custom business counters.',
          tasks: [
            {
              title: 'Prometheus Instrumentation & Alert Rules',
              description: 'Expose /metrics endpoints and configure Alertmanager rules for P99 latency breaches and error rate spikes.',
              criteria: [
                { name: 'Metric Granularity', maxScore: 40, description: 'Accurate histogram buckets for request latencies.' },
                { name: 'Dashboard Design', maxScore: 30, description: 'Golden Signals Grafana layout with threshold colors.' },
                { name: 'Alert Routing', maxScore: 30, description: 'Working webhook alerts with severity classification.' },
              ],
            },
          ],
        },
        {
          title: 'Distributed Tracing with OpenTelemetry & Jaeger',
          description: 'Trace asynchronous request flows across multiple microservices with context propagation and root cause analysis.',
          tasks: [
            {
              title: 'W3C TraceContext Propagation Middleware',
              description: 'Inject and extract traceparent headers across HTTP and message queues to visualize end-to-end call waterfalls.',
              criteria: [
                { name: 'Span Completeness', maxScore: 40, description: 'Detailed database and cache span annotations.' },
                { name: 'Sampling Strategy', maxScore: 30, description: 'Head/Tail sampling preserving all error traces.' },
                { name: 'Performance Overhead', maxScore: 30, description: 'Trace collection overhead under 1% CPU utilization.' },
              ],
            },
          ],
        },
        {
          title: 'Chaos Engineering & Automated Incident Response',
          description: 'Inject network latency, pod kills, and CPU exhaustion in staging to validate automatic failover and resilience.',
          tasks: [
            {
              title: 'Chaos Mesh Experiments & Postmortem Report',
              description: 'Execute automated chaos experiments and document incident recovery time (MTTR) with action items.',
              criteria: [
                { name: 'Failure Recovery', maxScore: 40, description: 'System auto-recovers without manual pod intervention.' },
                { name: 'Graceful Degradation', maxScore: 30, description: 'Circuit breaker trips and serves fallback content.' },
                { name: 'Postmortem Quality', maxScore: 30, description: 'Root cause analysis with 5-Whys methodology.' },
              ],
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Cluster 4: Cybersecurity & Ethical Defense
    // -----------------------------------------------------------------------
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
      techSlugs: ['python', 'docker', 'wireshark', 'metasploit', 'suricata'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4999.0 },
        { countryId: 2, currency: 'USD', amount: 149.0 },
        { countryId: 3, currency: 'GBP', amount: 119.0 },
        { countryId: 4, currency: 'AED', amount: 549.0 },
      ],
      projects: [
        {
          title: 'Web Application Penetration Testing & OWASP Mitigation',
          description: 'Audit deliberately vulnerable applications, exploit SQL injection, XSS, CSRF, and Broken Object Level Auth (BOLA), and implement code fixes.',
          tasks: [
            {
              title: 'Vulnerability Assessment & Exploit Proof-of-Concept',
              description: 'Identify injection vulnerabilities, craft payload exploits, and document remediation patches in backend code.',
              criteria: [
                { name: 'Exploitation Accuracy', maxScore: 40, description: 'Reproducible proof-of-concept exploit scripts.' },
                { name: 'Remediation Quality', maxScore: 30, description: 'Parameterized queries and CSP headers eliminating vulnerabilities.' },
                { name: 'Audit Report', maxScore: 30, description: 'CVSS 3.1 score calculations and executive vulnerability summary.' },
              ],
            },
          ],
        },
        {
          title: 'Network Traffic Analysis & Malware Detection',
          description: 'Analyze malicious PCAP captures with Wireshark, detect C2 beaconing, identify credential exfiltration, and write Suricata detection rules.',
          tasks: [
            {
              title: 'PCAP Forensics & Suricata Rule Authoring',
              description: 'Extract suspicious payloads from TCP streams and write custom IDS signatures alerting on attack patterns.',
              criteria: [
                { name: 'Signature Precision', maxScore: 40, description: 'Suricata rule catches exploit without false positive alerts.' },
                { name: 'Protocol Decryption', maxScore: 30, description: 'TLS session key extraction and payload analysis.' },
                { name: 'Indicator Extraction', maxScore: 30, description: 'Accurate extraction of IPs, domains, and file hashes.' },
              ],
            },
          ],
        },
        {
          title: 'Linux Server Hardening & Container Security Auditing',
          description: 'Harden production Ubuntu servers with CIS benchmarks, AppArmor profiles, Fail2ban intrusion defense, and Docker bench security audits.',
          tasks: [
            {
              title: 'CIS Hardening Script & Container Policy Enforcement',
              description: 'Automate Linux kernel parameter tuning, SSH key enforcement, and non-root Docker runtime enforcement.',
              criteria: [
                { name: 'CIS Benchmark Score', maxScore: 40, description: 'Passing 85%+ on automated Lynis / CIS audit scans.' },
                { name: 'Access Control', maxScore: 30, description: 'Zero password-based SSH access and sudo restrictions.' },
                { name: 'Runtime Protection', maxScore: 30, description: 'AppArmor / Seccomp profile blocking unauthorized syscalls.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Offensive Security & Web Penetration Testing',
      slug: 'offensive-ethical-hacking-pentesting',
      description:
        'Perform ethical hacking assessments across active directory environments, API authorization flaws, and buffer overflow memory vulnerabilities.',
      durationHours: 90,
      status: 'published',
      outcomes:
        'Conduct ethical black-box assessments; Exploit JWT forgery and SSRF; Perform privilege escalation; Deliver professional client penetration test reports.',
      topicSlug: 'cyber-security',
      techSlugs: ['metasploit', 'wireshark', 'python', 'docker'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4699.0 },
        { countryId: 2, currency: 'USD', amount: 139.0 },
        { countryId: 3, currency: 'GBP', amount: 109.0 },
        { countryId: 4, currency: 'AED', amount: 519.0 },
      ],
      projects: [
        {
          title: 'API Security Testing & Authorization Flaw Exploitation',
          description: 'Intercept REST API requests, bypass IDOR / BOLA authorization checks, forge HMAC tokens, and patch access control logic.',
          tasks: [
            {
              title: 'API Reconnaissance & BOLA Attack Scenarios',
              description: 'Map hidden endpoints, exploit multi-tenant tenant leakage, and enforce tenant-scoped database queries.',
              criteria: [
                { name: 'Flaw Identification', maxScore: 40, description: 'Accurate identification of broken object-level access.' },
                { name: 'Security Fixes', maxScore: 30, description: 'Tenant ID validation middleware on all queries.' },
                { name: 'Testing Report', maxScore: 30, description: 'Clear risk ratings with remediation guidelines.' },
              ],
            },
          ],
        },
        {
          title: 'Linux Privilege Escalation & Memory Exploitation',
          description: 'Leverage vulnerable SUID binaries, cron job misconfigurations, and develop simple Python buffer overflow exploit scripts.',
          tasks: [
            {
              title: 'SUID Analysis & Exploit Development',
              description: 'Identify unquoted path vulnerabilities, escalate from standard user to root, and implement secure binary permissions.',
              criteria: [
                { name: 'Escalation Technique', maxScore: 40, description: 'Successful root shell acquisition in sandboxed target.' },
                { name: 'Script Quality', maxScore: 30, description: 'Clean Python exploit script with payload offsets.' },
                { name: 'Defensive Remediation', maxScore: 30, description: 'Elimination of insecure SUID and capability flags.' },
              ],
            },
          ],
        },
        {
          title: 'Professional Red Team Engagement Report',
          description: 'Compile an end-to-end security penetration testing audit report with executive summaries, technical findings, and CVSS calculators.',
          tasks: [
            {
              title: 'Audit Documentation & Client Briefing',
              description: 'Format a comprehensive 15-page security report suitable for CTO and compliance review.',
              criteria: [
                { name: 'Report Thoroughness', maxScore: 40, description: 'All findings include CVSS scores and reproduction steps.' },
                { name: 'Executive Summary', maxScore: 30, description: 'Clear non-technical risk summary for stakeholders.' },
                { name: 'Remediation Roadmap', maxScore: 30, description: 'Prioritized 30-60-90 day fix recommendations.' },
              ],
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Cluster 5: Embedded Systems & IoT
    // -----------------------------------------------------------------------
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
      techSlugs: ['cpp', 'esp32', 'freertos', 'python', 'docker', 'redis'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4799.0 },
        { countryId: 2, currency: 'USD', amount: 139.0 },
        { countryId: 3, currency: 'GBP', amount: 109.0 },
        { countryId: 4, currency: 'AED', amount: 529.0 },
      ],
      projects: [
        {
          title: 'ESP32 Real-Time Sensor Processing & Power Management',
          description: 'Write C++ firmware reading I2C/SPI sensors (BME280, MPU6050), configure hardware timer interrupts, and implement deep sleep power optimization.',
          tasks: [
            {
              title: 'Sensor Driver Architecture & Interrupt Handlers',
              description: 'Implement non-blocking sensor sampling routines with DMA and hardware watchdog timers.',
              criteria: [
                { name: 'Sampling Accuracy', maxScore: 40, description: 'Accurate sensor telemetry decoding with zero lockups.' },
                { name: 'Power Consumption', maxScore: 30, description: 'Deep sleep current consumption under 25 microamps.' },
                { name: 'Memory Footprint', maxScore: 30, description: 'Zero heap fragmentation with static buffer allocation.' },
              ],
            },
          ],
        },
        {
          title: 'Secure TLS-MQTT Telemetry Gateway to AWS IoT Core',
          description: 'Connect ESP32 devices to AWS IoT Core using X.509 client certificates, mutual TLS authentication, and JSON message payloads.',
          tasks: [
            {
              title: 'Mutual TLS Handshake & MQTT Topic Architecture',
              description: 'Store client private keys in secure NVS partitions, publish sensor telemetry, and handle remote shadow updates.',
              criteria: [
                { name: 'TLS Handshake Security', maxScore: 40, description: 'Verified mutual certificate authentication.' },
                { name: 'Reconnection Resilience', maxScore: 30, description: 'Exponential backoff on WiFi / MQTT dropouts.' },
                { name: 'Topic Hierarchy', maxScore: 30, description: 'RESTful MQTT topic conventions (devices/{id}/telemetry).' },
              ],
            },
          ],
        },
        {
          title: 'Industrial Web Dashboard & Over-The-Air (OTA) Updates',
          description: 'Build a Next.js live telemetry dashboard with WebSocket streaming and implement cryptographically signed OTA firmware updates.',
          tasks: [
            {
              title: 'Secure OTA Firmware Upgrade Pipeline',
              description: 'Download binary images over HTTPS, verify SHA-256 signatures, and perform atomic rollback on boot failure.',
              criteria: [
                { name: 'Signature Verification', maxScore: 40, description: 'Cryptographic signature check before flashing.' },
                { name: 'Atomic Rollback', maxScore: 30, description: 'Automatic fallback to previous partition on crash.' },
                { name: 'Live Telemetry UI', maxScore: 30, description: 'Sub-second sensor chart updates via WebSockets.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Automotive Embedded Systems & CAN Bus Networks',
      slug: 'automotive-embedded-systems',
      description:
        'Engineer automotive electronic control units (ECUs) with FreeRTOS, CAN bus message arbitration, OBD-II diagnostic protocols, and ISO 26262 functional safety concepts.',
      durationHours: 90,
      status: 'published',
      outcomes:
        'Implement CAN 2.0B frame transceiver drivers; Decode OBD-II engine parameters; Design FreeRTOS deterministic task scheduling; Apply functional safety standards.',
      topicSlug: 'automotive-embedded',
      techSlugs: ['cpp', 'freertos', 'esp32', 'python'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5299.0 },
        { countryId: 2, currency: 'USD', amount: 159.0 },
        { countryId: 3, currency: 'GBP', amount: 129.0 },
        { countryId: 4, currency: 'AED', amount: 579.0 },
      ],
      projects: [
        {
          title: 'CAN 2.0B Frame Parser & ECU Simulator',
          description: 'Simulate vehicle speed, RPM, and brake sensor telemetry frames over a two-wire CAN bus using MCP2515 controllers.',
          tasks: [
            {
              title: 'CAN Message Arbitration & Filter Masks',
              description: 'Configure hardware acceptance filters to prioritize critical braking packets over standard telemetry frames.',
              criteria: [
                { name: 'Bus Arbitration', maxScore: 40, description: 'Zero packet collisions on 500kbps CAN bus.' },
                { name: 'DBC Signal Decoding', maxScore: 30, description: 'Accurate decoding of multiplexed signals from DBC files.' },
                { name: 'Timing Determinism', maxScore: 30, description: 'Cyclic transmission jitter under 1 millisecond.' },
              ],
            },
          ],
        },
        {
          title: 'FreeRTOS Hard Real-Time ECU Task Architecture',
          description: 'Design preemptive FreeRTOS tasks with task priorities, mutexes, message queues, and deterministic deadline guarantees.',
          tasks: [
            {
              title: 'Priority Inversion Prevention & Queue Synchronization',
              description: 'Pass CAN frame pointers between interrupt handlers and processing tasks using thread-safe FreeRTOS queues.',
              criteria: [
                { name: 'Deadline Adherence', maxScore: 40, description: 'Zero missed deadlines across 10,000 simulated cycles.' },
                { name: 'Priority Inheritance', maxScore: 30, description: 'Clean mutex usage preventing priority inversion.' },
                { name: 'Stack Overflow Guard', maxScore: 30, description: 'Proper task stack sizing with hook checks.' },
              ],
            },
          ],
        },
        {
          title: 'OBD-II Diagnostic Gateway & Vehicle Telemetry Logger',
          description: 'Respond to standard OBD-II PID query requests over CAN and log trip diagnostics onto an encrypted SD card partition.',
          tasks: [
            {
              title: 'OBD-II Standard PID Protocol Handler',
              description: 'Implement Mode 01 diagnostic requests for coolant temperature, engine RPM, and speed.',
              criteria: [
                { name: 'Protocol Conformance', maxScore: 40, description: 'Complies 100% with SAE J1979 OBD-II standard.' },
                { name: 'Storage Throughput', maxScore: 30, description: 'Continuous SD card streaming without bus stalls.' },
                { name: 'Fault Code Handling', maxScore: 30, description: 'Accurate DTC diagnostic trouble code emission.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Multi-Cloud Infrastructure Automation with Terraform & Ansible',
      slug: 'infrastructure-as-code-automation',
      description:
        'Automate hybrid multi-cloud infrastructure provisioning, immutable server configurations with Ansible, and compliance policy-as-code with Open Policy Agent.',
      durationHours: 80,
      status: 'published',
      outcomes:
        'Write production Terraform modules; Automate Linux fleet configurations with Ansible playbooks; Enforce Sentinel / OPA security guardrails.',
      topicSlug: 'infrastructure-as-code',
      techSlugs: ['terraform', 'ansible', 'aws', 'docker', 'python'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 4499.0 },
        { countryId: 2, currency: 'USD', amount: 139.0 },
        { countryId: 3, currency: 'GBP', amount: 109.0 },
        { countryId: 4, currency: 'AED', amount: 499.0 },
      ],
      projects: [
        {
          title: 'Modular Multi-Region Cloud Blueprint',
          description: 'Construct reusable Terraform modules deploying compute, storage, and networking across multiple AWS availability zones.',
          tasks: [
            {
              title: 'Terraform Module Abstraction & Remote State',
              description: 'Create standardized module inputs and outputs with strict linting via tflint and checkov.',
              criteria: [
                { name: 'Module Design', maxScore: 40, description: 'Clean abstraction with zero hardcoded region parameters.' },
                { name: 'Security Scanning', maxScore: 30, description: 'Passing Checkov static analysis without security warnings.' },
                { name: 'State Locking', maxScore: 30, description: 'Safe concurrent execution with DynamoDB locks.' },
              ],
            },
          ],
        },
        {
          title: 'Ansible Playbook Fleet Configuration Engine',
          description: 'Automate NGINX, SSL certificates, and security baseline hardening across 50 simulated EC2 servers.',
          tasks: [
            {
              title: 'Ansible Roles & Dynamic Inventory',
              description: 'Write idempotent Ansible roles with dynamic AWS EC2 inventory filtering by tags.',
              criteria: [
                { name: 'Idempotency', maxScore: 40, description: 'Subsequent playbook runs result in 0 changes (ok=X, changed=0).' },
                { name: 'Role Modularity', maxScore: 30, description: 'Clean role structure with separate handlers and templates.' },
                { name: 'Vault Encryption', maxScore: 30, description: 'Sensitive tokens encrypted with Ansible Vault.' },
              ],
            },
          ],
        },
        {
          title: 'Policy-as-Code Compliance with Open Policy Agent',
          description: 'Block insecure Terraform plans (such as public S3 buckets and open 0.0.0.0/0 SSH rules) before cloud apply.',
          tasks: [
            {
              title: 'OPA Rego Policy Enforcement Guardrails',
              description: 'Write custom Rego compliance rules evaluating Terraform JSON plan output in CI.',
              criteria: [
                { name: 'Policy Coverage', maxScore: 40, description: 'Comprehensive checks for unencrypted EBS and public buckets.' },
                { name: 'Error Messaging', maxScore: 30, description: 'Actionable developer remediation messages on failure.' },
                { name: 'CI Integration', maxScore: 30, description: 'Automated blocking step in GitHub Actions.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Cloud Security Architecture & Zero-Trust Defense',
      slug: 'cloud-security-zero-trust',
      description:
        'Implement zero-trust enterprise security architectures, IAM least privilege policies, Kubernetes security admission controllers, and automated cloud compliance auditing.',
      durationHours: 100,
      status: 'published',
      outcomes:
        'Architect AWS IAM permission boundaries; Deploy Kyverno admission controllers on Kubernetes; Implement mTLS with Istio service mesh.',
      topicSlug: 'cloud-security',
      techSlugs: ['aws', 'kubernetes', 'docker', 'suricata', 'python'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5399.0 },
        { countryId: 2, currency: 'USD', amount: 159.0 },
        { countryId: 3, currency: 'GBP', amount: 129.0 },
        { countryId: 4, currency: 'AED', amount: 589.0 },
      ],
      projects: [
        {
          title: 'Cloud IAM Least Privilege & Identity Federation',
          description: 'Audit overly permissive cloud IAM roles, construct role-chaining policies, and implement temporary STS session tokens.',
          tasks: [
            {
              title: 'IAM Policy Hardening & STS Token Rotation',
              description: 'Eliminate permanent access keys in favor of short-lived STS tokens with MFA conditions.',
              criteria: [
                { name: 'Least Privilege', maxScore: 40, description: 'Zero wildcard (*) action permissions in production policies.' },
                { name: 'MFA Enforcement', maxScore: 30, description: 'Mandatory MFA condition keys on sensitive administrative calls.' },
                { name: 'Audit Logging', maxScore: 30, description: 'CloudTrail alert integration on unauthorized API calls.' },
              ],
            },
          ],
        },
        {
          title: 'Kubernetes Admission Controllers & Pod Security',
          description: 'Deploy Kyverno / OPA Gatekeeper admission webhooks preventing privileged pod deployment and enforcing image signature verification with Cosign.',
          tasks: [
            {
              title: 'Admission Webhook & Cosign Image Verification',
              description: 'Reject all pod deployments containing unsigned images or root UID users.',
              criteria: [
                { name: 'Policy Enforcement', maxScore: 40, description: '100% rejection rate for non-compliant pod manifests.' },
                { name: 'Cosign Verification', maxScore: 30, description: 'Cryptographic signature check against public key.' },
                { name: 'Admission Latency', maxScore: 30, description: 'Webhook processing overhead under 15ms.' },
              ],
            },
          ],
        },
        {
          title: 'Zero-Trust Service Mesh & Mutual TLS',
          description: 'Configure Istio service mesh with STRICT mutual TLS (mTLS) enforcement and granular Layer 7 authorization policies.',
          tasks: [
            {
              title: 'Istio STRICT mTLS & Service Authorization',
              description: 'Enforce cryptographically verified service identities using SPIFFE IDs and restrict cross-namespace traffic.',
              criteria: [
                { name: 'mTLS Enforcement', maxScore: 40, description: '100% encrypted in-transit traffic between pods.' },
                { name: 'L7 Auth Policies', maxScore: 30, description: 'Granular HTTP method and path access restrictions.' },
                { name: 'Observability', maxScore: 30, description: 'Kiali service topology visualization with security badges.' },
              ],
            },
          ],
        },
      ],
    },
    {
      countryId: 1,
      title: 'Robotics Firmware Engineering & FreeRTOS Control',
      slug: 'robotics-firmware-rtos',
      description:
        'Develop real-time robotic motion controllers with FreeRTOS, PID closed-loop feedback algorithms, quadrature encoder decoding, and ROS2 micro-ROS integration.',
      durationHours: 100,
      status: 'published',
      outcomes:
        'Program deterministic RTOS motor control loops; Implement PID speed and position controllers; Communicate with ROS2 via micro-ROS serial transport.',
      topicSlug: 'robotics-sensors',
      techSlugs: ['cpp', 'freertos', 'esp32', 'python'],
      pricings: [
        { countryId: 1, currency: 'INR', amount: 5199.0 },
        { countryId: 2, currency: 'USD', amount: 159.0 },
        { countryId: 3, currency: 'GBP', amount: 119.0 },
        { countryId: 4, currency: 'AED', amount: 569.0 },
      ],
      projects: [
        {
          title: 'Closed-Loop PID Motor Velocity & Position Controller',
          description: 'Design a deterministic 1kHz control loop tuning Proportional-Integral-Derivative gains for precise robotic wheel velocity.',
          tasks: [
            {
              title: 'Hardware Timer Interrupt & PID Algorithm',
              description: 'Sample optical encoders, compute velocity error, and modulate PWM duty cycle with anti-windup clamping.',
              criteria: [
                { name: 'Step Response', maxScore: 40, description: 'Settling time under 200ms with less than 5% overshoot.' },
                { name: 'Loop Determinism', maxScore: 30, description: '1kHz interrupt execution with sub-microsecond jitter.' },
                { name: 'Anti-Windup Protection', maxScore: 30, description: 'Clean integral anti-windup handling during motor stalls.' },
              ],
            },
          ],
        },
        {
          title: 'IMU Sensor Fusion & Orientation Estimation',
          description: 'Implement complementary and Madgwick filter algorithms fusing accelerometer and gyroscope telemetry for 6-DOF robot pose estimation.',
          tasks: [
            {
              title: 'Madgwick Quaternion Filter Implementation',
              description: 'Read 6-axis IMU data over high-speed SPI bus and compute real-time Roll, Pitch, and Yaw orientation angles.',
              criteria: [
                { name: 'Angle Accuracy', maxScore: 40, description: 'Static orientation drift under 0.5 degrees per minute.' },
                { name: 'Filter Latency', maxScore: 30, description: 'Quaternion computation executing in under 500 microseconds.' },
                { name: 'Calibration Routines', maxScore: 30, description: 'Automated gyro zero-rate bias calibration on startup.' },
              ],
            },
          ],
        },
        {
          title: 'micro-ROS Telemetry Bridge & Remote Navigation Control',
          description: 'Publish robot odometry and subscribe to /cmd_vel velocity commands from a master ROS2 workstation over micro-ROS serial transport.',
          tasks: [
            {
              title: 'micro-ROS Node & Topic Publishers',
              description: 'Initialize micro-ROS agent transport, create custom geometry_msgs/Twist subscribers, and stream status.',
              criteria: [
                { name: 'ROS2 Topic Compatibility', maxScore: 40, description: 'Native interoperability with standard ROS2 navigation stack.' },
                { name: 'Transport Reliability', maxScore: 30, description: 'Automatic reconnection on USB serial unplug/replug.' },
                { name: 'Emergency Stop Safety', maxScore: 30, description: 'Hardware watchdog killing motor PWM on communication loss.' },
              ],
            },
          ],
        },
      ],
    },
  ];

  // =========================================================================
  // 5. SEED PROGRAMS, PROJECTS, WORKSPACES, TASKS, RUBRICS & PRICINGS
  // =========================================================================
  for (const prog of programsData) {
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

    // Link Topic
    const topic = await prisma.topic.findUnique({ where: { slug: prog.topicSlug } });
    if (topic) {
      await prisma.programTopic.upsert({
        where: { programId_topicId: { programId: program.id, topicId: topic.id } },
        update: {},
        create: { programId: program.id, topicId: topic.id },
      });
    }

    // Link Technologies
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

    // Multi-Currency Pricing
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
        question: `What is the learning flow and structure of the ${prog.title} track?`,
        answer:
          `This is a ${prog.durationHours}-hour guided capstone internship. You develop 3 sequential real-world production projects with Kanban milestone deliverables, automated AI rubric feedback, and personal GitHub sync.`,
      },
      {
        question: 'How do recruiters and universities verify my completion certificate?',
        answer:
          'Every issued certificate features a tamper-proof verification ID and QR code linking to an immutable digital audit transcript with detailed rubric scores and GitHub commit proof.',
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
          'The 3 sequential project deliverables were remarkably close to actual sprint work in big tech. The AI evaluation gave immediate, structured feedback on code architecture.',
        rating: 5,
      },
      {
        authorName: 'Dr. S. K. Sundaram',
        authorRole: 'Dean of Academic Partnerships, Research Park',
        quote:
          'Engineers Clinic bridges the crucial gap between textbook theory and production software delivery. Institutional cohort tracking has elevated our student placement records.',
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

    // 3 Capstone Projects with WorkspaceTemplates, Tasks, Rubrics & Resources
    if (prog.projects && prog.projects.length > 0) {
      for (let pIdx = 0; pIdx < prog.projects.length; pIdx++) {
        const projData = prog.projects[pIdx];
        let project = await prisma.project.findFirst({
          where: { programId: program.id, orderIndex: pIdx + 1 },
        });

        if (project) {
          project = await prisma.project.update({
            where: { id: project.id },
            data: { title: projData.title, description: projData.description },
          });
        } else {
          project = await prisma.project.create({
            data: {
              programId: program.id,
              title: projData.title,
              description: projData.description,
              orderIndex: pIdx + 1,
            },
          });
        }

        // Workspace Template
        const template = await prisma.workspaceTemplate.upsert({
          where: { projectId: project.id },
          update: { version: 1, isActive: true },
          create: { projectId: project.id, version: 1, isActive: true },
        });

        // Template Tasks
        for (let tIdx = 0; tIdx < projData.tasks.length; tIdx++) {
          const taskData = projData.tasks[tIdx];
          let task = await prisma.templateTask.findFirst({
            where: { workspaceTemplateId: template.id, orderIndex: tIdx + 1 },
          });

          if (task) {
            task = await prisma.templateTask.update({
              where: { id: task.id },
              data: { title: taskData.title, description: taskData.description },
            });
          } else {
            task = await prisma.templateTask.create({
              data: {
                workspaceTemplateId: template.id,
                orderIndex: tIdx + 1,
                title: taskData.title,
                description: taskData.description,
              },
            });
          }

          // 100-Point Rubric
          await prisma.rubric.upsert({
            where: { taskId: task.id },
            update: {
              criteria: taskData.criteria,
              maxScore: 100,
              passThreshold: 65,
            },
            create: {
              taskId: task.id,
              criteria: taskData.criteria,
              maxScore: 100,
              passThreshold: 65,
            },
          });

          // Documentation Resources
          const defaultResources = [
            { title: `${taskData.title} - Official Technical Spec`, url: 'https://docs.engineersclinic.com', type: 'doc' },
            { title: 'Production Architecture Guide', url: 'https://engineersclinic.com/resources/architecture', type: 'guide' },
          ];

          for (const res of defaultResources) {
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
  }

  console.log(`  ✅ ${clusters.length} Clusters, ${topics.length} Topics, ${technologies.length} Techs, and ${programsData.length} Capstone Programs seeded successfully.`);
}

