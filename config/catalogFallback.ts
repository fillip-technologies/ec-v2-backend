export interface FallbackCluster {
  id: number;
  slug: string;
  name: string;
  description: string;
  topics: {
    id: number;
    slug: string;
    name: string;
  }[];
}

export interface FallbackProgram {
  id: number;
  slug: string;
  title: string;
  description: string;
  durationHours: number;
  outcomes: string;
  status: string;
  clusterSlug: string;
  topicSlug: string;
  technologies: { id: number; slug: string; name: string }[];
  projectsCount: number;
  pricings: { currency: string; amount: number }[];
}

export const FALLBACK_CLUSTERS: FallbackCluster[] = [
  {
    id: 1,
    slug: 'software-engineering',
    name: 'Software Engineering & Full Stack',
    description: 'Production-ready web platforms, distributed microservices backends, and modern frontend architectures.',
    topics: [
      { id: 1, slug: 'fullstack-web-dev', name: 'Full Stack Web Development' },
      { id: 2, slug: 'distributed-microservices', name: 'Distributed Microservices & APIs' },
      { id: 3, slug: 'mobile-app-dev', name: 'Cross-Platform Mobile Engineering' },
      { id: 4, slug: 'frontend-architecture', name: 'Advanced Frontend Architecture' },
    ],
  },
  {
    id: 2,
    slug: 'ai-data-science',
    name: 'Artificial Intelligence & Data Science',
    description: 'Generative AI, Large Language Models, Deep Neural Networks, and Data Engineering pipelines.',
    topics: [
      { id: 5, slug: 'machine-learning', name: 'Machine Learning & Deep Neural Nets' },
      { id: 6, slug: 'generative-ai-llms', name: 'Generative AI & Agentic LLMs' },
      { id: 7, slug: 'data-engineering', name: 'Big Data Engineering & Streaming' },
      { id: 8, slug: 'computer-vision', name: 'Computer Vision & Edge Deep Learning' },
    ],
  },
  {
    id: 3,
    slug: 'cloud-devops',
    name: 'Cloud Computing & DevOps',
    description: 'Cloud Native Microservices, Kubernetes orchestration, Infrastructure as Code, and CI/CD pipelines.',
    topics: [
      { id: 9, slug: 'cloud-devops', name: 'Cloud Native Architecture & CI/CD' },
      { id: 10, slug: 'site-reliability', name: 'Site Reliability Engineering (SRE)' },
      { id: 11, slug: 'infrastructure-as-code', name: 'Infrastructure as Code (IaC)' },
    ],
  },
  {
    id: 4,
    slug: 'cybersecurity',
    name: 'Cybersecurity & Ethical Defense',
    description: 'Vulnerability assessment, penetration testing, network defense, and zero-trust security operations.',
    topics: [
      { id: 12, slug: 'cyber-security', name: 'Offensive Security & Ethical Hacking' },
      { id: 13, slug: 'cloud-security', name: 'Cloud Security & Zero-Trust Defense' },
      { id: 14, slug: 'soc-incident-response', name: 'SOC Operations & Threat Hunting' },
    ],
  },
  {
    id: 5,
    slug: 'embedded-iot',
    name: 'Embedded Systems & IoT',
    description: 'Firmware programming, RTOS microcontrollers, sensor integration, and industrial IoT solutions.',
    topics: [
      { id: 15, slug: 'embedded-iot-systems', name: 'Embedded Firmware & IoT Systems' },
      { id: 16, slug: 'automotive-embedded', name: 'Automotive CAN Bus & AUTOSAR' },
      { id: 17, slug: 'robotics-sensors', name: 'Robotics, RTOS & Sensor Fusion' },
    ],
  },
];

export const FALLBACK_PROGRAMS: FallbackProgram[] = [
  // =========================================================================
  // Cluster 1: Software Engineering & Full Stack
  // =========================================================================
  {
    id: 1,
    slug: 'fullstack-web-engineering',
    title: 'Full Stack Web Engineering & Cloud Architecture',
    description: 'A comprehensive industry internship delivering 3 real-world production projects with NestJS, Next.js App Router, Prisma ORM, MySQL, and Dockerized microservices.',
    durationHours: 120,
    outcomes: 'Architect scalable REST & GraphQL APIs; Build responsive SSR web applications; Deploy containerized microservices.',
    status: 'published',
    clusterSlug: 'software-engineering',
    topicSlug: 'fullstack-web-dev',
    technologies: [
      { id: 1, slug: 'nextjs', name: 'Next.js 16' },
      { id: 2, slug: 'react', name: 'React 19' },
      { id: 3, slug: 'typescript', name: 'TypeScript' },
      { id: 4, slug: 'nestjs', name: 'NestJS' },
      { id: 5, slug: 'prisma', name: 'Prisma ORM' },
      { id: 6, slug: 'docker', name: 'Docker' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4999 },
      { currency: 'USD', amount: 149 },
      { currency: 'GBP', amount: 119 },
      { currency: 'AED', amount: 549 },
    ],
  },
  {
    id: 2,
    slug: 'distributed-microservices-backend',
    title: 'Distributed Microservices & Event-Driven Backends',
    description: 'Master scalable high-throughput microservices using Go, Apache Kafka event streaming, PostgreSQL partitioning, and Kubernetes deployment.',
    durationHours: 100,
    outcomes: 'Build high-performance Go RPC services; Architect Kafka event producers/consumers; Implement saga patterns for distributed transactions; Deploy on Kubernetes.',
    status: 'published',
    clusterSlug: 'software-engineering',
    topicSlug: 'distributed-microservices',
    technologies: [
      { id: 19, slug: 'go', name: 'Go (Golang)' },
      { id: 16, slug: 'kafka', name: 'Apache Kafka' },
      { id: 7, slug: 'postgresql', name: 'PostgreSQL' },
      { id: 14, slug: 'redis', name: 'Redis' },
      { id: 9, slug: 'kubernetes', name: 'Kubernetes' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5499 },
      { currency: 'USD', amount: 169 },
      { currency: 'GBP', amount: 129 },
      { currency: 'AED', amount: 599 },
    ],
  },
  {
    id: 3,
    slug: 'crossplatform-mobile-app-engineering',
    title: 'Cross-Platform Mobile App Engineering with React Native',
    description: 'Build native iOS & Android applications with React Native, TypeScript, Redux Toolkit, offline SQLite caching, and REST/GraphQL backend sync.',
    durationHours: 90,
    outcomes: 'Develop native-feeling mobile UI layouts; Manage global state with Redux; Implement offline-first local storage; Integrate push notifications & biometric auth.',
    status: 'published',
    clusterSlug: 'software-engineering',
    topicSlug: 'mobile-app-dev',
    technologies: [
      { id: 21, slug: 'react-native', name: 'React Native' },
      { id: 2, slug: 'react', name: 'React 19' },
      { id: 3, slug: 'typescript', name: 'TypeScript' },
      { id: 15, slug: 'graphql', name: 'GraphQL' },
      { id: 4, slug: 'nestjs', name: 'NestJS' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4499 },
      { currency: 'USD', amount: 139 },
      { currency: 'GBP', amount: 109 },
      { currency: 'AED', amount: 499 },
    ],
  },

  // =========================================================================
  // Cluster 2: Artificial Intelligence & Data Science
  // =========================================================================
  {
    id: 4,
    slug: 'applied-ai-machine-learning',
    title: 'Applied AI, Machine Learning & LLM Systems',
    description: 'Hands-on capstone internship in Machine Learning algorithms, Deep Learning with PyTorch, and production RAG (Retrieval-Augmented Generation) applications with LangChain.',
    durationHours: 120,
    outcomes: 'Train neural network classifiers; Deploy LLM agentic pipelines; Implement vector embeddings with Qdrant; Serve low-latency inference APIs.',
    status: 'published',
    clusterSlug: 'ai-data-science',
    topicSlug: 'machine-learning',
    technologies: [
      { id: 11, slug: 'python', name: 'Python 3.12' },
      { id: 12, slug: 'pytorch', name: 'PyTorch' },
      { id: 13, slug: 'langchain', name: 'LangChain' },
      { id: 23, slug: 'qdrant', name: 'Qdrant Vector DB' },
      { id: 22, slug: 'fastapi', name: 'FastAPI' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5999 },
      { currency: 'USD', amount: 179 },
      { currency: 'GBP', amount: 139 },
      { currency: 'AED', amount: 649 },
    ],
  },
  {
    id: 5,
    slug: 'generative-ai-agentic-systems',
    title: 'Generative AI Engineering & Autonomous Agents',
    description: 'Architect advanced AI agents with multi-step reasoning, tool execution, structured output validation, and LangGraph multi-agent orchestration.',
    durationHours: 90,
    outcomes: 'Build LangGraph stateful multi-agent workflows; Implement automated code synthesis tools; Enforce strict Pydantic JSON schemas; Deploy serverless AI workers.',
    status: 'published',
    clusterSlug: 'ai-data-science',
    topicSlug: 'generative-ai-llms',
    technologies: [
      { id: 11, slug: 'python', name: 'Python' },
      { id: 13, slug: 'langchain', name: 'LangChain' },
      { id: 22, slug: 'fastapi', name: 'FastAPI' },
      { id: 23, slug: 'qdrant', name: 'Qdrant' },
      { id: 8, slug: 'docker', name: 'Docker' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5499 },
      { currency: 'USD', amount: 169 },
      { currency: 'GBP', amount: 129 },
      { currency: 'AED', amount: 599 },
    ],
  },
  {
    id: 6,
    slug: 'big-data-streaming-pipelines',
    title: 'Big Data Engineering & Real-Time Streaming',
    description: 'Engineer distributed data lakes, Apache Spark transformation jobs, and real-time Kafka streaming analytics pipelines for multi-terabyte datasets.',
    durationHours: 100,
    outcomes: 'Build Apache Spark batch processing jobs; Stream IoT metrics with Kafka & Spark Streaming; Architect Delta Lake storage; Query data with PySpark SQL.',
    status: 'published',
    clusterSlug: 'ai-data-science',
    topicSlug: 'data-engineering',
    technologies: [
      { id: 28, slug: 'spark', name: 'Apache Spark' },
      { id: 16, slug: 'kafka', name: 'Apache Kafka' },
      { id: 11, slug: 'python', name: 'Python' },
      { id: 7, slug: 'postgresql', name: 'PostgreSQL' },
      { id: 8, slug: 'docker', name: 'Docker' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5199 },
      { currency: 'USD', amount: 159 },
      { currency: 'GBP', amount: 119 },
      { currency: 'AED', amount: 569 },
    ],
  },

  // =========================================================================
  // Cluster 3: Cloud Computing & DevOps
  // =========================================================================
  {
    id: 7,
    slug: 'cloud-devops-engineering',
    title: 'Cloud Native DevOps & Infrastructure Engineering',
    description: 'Production internship focused on AWS cloud infrastructure, Terraform automation, Docker containerization, Kubernetes clusters, and GitHub Actions CI/CD pipelines.',
    durationHours: 120,
    outcomes: 'Automate multi-region AWS infrastructure; Build zero-downtime Kubernetes deployments; Implement observability with Prometheus & Grafana.',
    status: 'published',
    clusterSlug: 'cloud-devops',
    topicSlug: 'cloud-devops',
    technologies: [
      { id: 8, slug: 'docker', name: 'Docker' },
      { id: 9, slug: 'kubernetes', name: 'Kubernetes' },
      { id: 10, slug: 'aws', name: 'AWS' },
      { id: 17, slug: 'terraform', name: 'Terraform' },
      { id: 14, slug: 'redis', name: 'Redis' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5499 },
      { currency: 'USD', amount: 169 },
      { currency: 'GBP', amount: 129 },
      { currency: 'AED', amount: 599 },
    ],
  },
  {
    id: 8,
    slug: 'sre-observability-engineering',
    title: 'Site Reliability Engineering (SRE) & Observability',
    description: 'Implement enterprise observability with Prometheus metric exporters, Grafana monitoring dashboards, OpenTelemetry distributed tracing, and Chaos Engineering experiments.',
    durationHours: 90,
    outcomes: 'Formulate SLIs/SLOs and error budgets; Instrument applications with OpenTelemetry; Configure Alertmanager routing; Conduct chaos injection tests.',
    status: 'published',
    clusterSlug: 'cloud-devops',
    topicSlug: 'site-reliability',
    technologies: [
      { id: 18, slug: 'prometheus', name: 'Prometheus & Grafana' },
      { id: 9, slug: 'kubernetes', name: 'Kubernetes' },
      { id: 8, slug: 'docker', name: 'Docker' },
      { id: 19, slug: 'go', name: 'Go' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4899 },
      { currency: 'USD', amount: 149 },
      { currency: 'GBP', amount: 119 },
      { currency: 'AED', amount: 539 },
    ],
  },
  {
    id: 9,
    slug: 'infrastructure-as-code-automation',
    title: 'Multi-Cloud Infrastructure Automation with Terraform & Ansible',
    description: 'Automate hybrid multi-cloud infrastructure provisioning, immutable server configurations with Ansible, and compliance policy-as-code with Open Policy Agent.',
    durationHours: 80,
    outcomes: 'Write production Terraform modules; Automate Linux fleet configurations with Ansible playbooks; Enforce Sentinel / OPA security guardrails.',
    status: 'published',
    clusterSlug: 'cloud-devops',
    topicSlug: 'infrastructure-as-code',
    technologies: [
      { id: 17, slug: 'terraform', name: 'Terraform' },
      { id: 29, slug: 'ansible', name: 'Ansible' },
      { id: 10, slug: 'aws', name: 'AWS' },
      { id: 8, slug: 'docker', name: 'Docker' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4499 },
      { currency: 'USD', amount: 139 },
      { currency: 'GBP', amount: 109 },
      { currency: 'AED', amount: 499 },
    ],
  },

  // =========================================================================
  // Cluster 4: Cybersecurity & Ethical Defense
  // =========================================================================
  {
    id: 10,
    slug: 'advanced-cybersecurity-defense',
    title: 'Advanced Cybersecurity & Defense Operations',
    description: 'Industry-grade security internship covering network vulnerability assessment, web application penetration testing, OWASP Top 10 mitigation, and SOC incident response.',
    durationHours: 120,
    outcomes: 'Audit web applications for security flaws; Perform cryptographic handshakes; Hardening Linux servers and container environments.',
    status: 'published',
    clusterSlug: 'cybersecurity',
    topicSlug: 'cyber-security',
    technologies: [
      { id: 11, slug: 'python', name: 'Python' },
      { id: 8, slug: 'docker', name: 'Docker' },
      { id: 24, slug: 'wireshark', name: 'Wireshark' },
      { id: 25, slug: 'metasploit', name: 'Metasploit' },
      { id: 30, slug: 'suricata', name: 'Suricata' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4999 },
      { currency: 'USD', amount: 149 },
      { currency: 'GBP', amount: 119 },
      { currency: 'AED', amount: 549 },
    ],
  },
  {
    id: 11,
    slug: 'offensive-ethical-hacking-pentesting',
    title: 'Offensive Security & Web Penetration Testing',
    description: 'Perform ethical hacking assessments across active directory environments, API authorization flaws, and buffer overflow memory vulnerabilities.',
    durationHours: 90,
    outcomes: 'Conduct ethical black-box assessments; Exploit JWT forgery and SSRF; Perform privilege escalation; Deliver professional client penetration test reports.',
    status: 'published',
    clusterSlug: 'cybersecurity',
    topicSlug: 'cyber-security',
    technologies: [
      { id: 25, slug: 'metasploit', name: 'Metasploit' },
      { id: 24, slug: 'wireshark', name: 'Wireshark' },
      { id: 11, slug: 'python', name: 'Python' },
      { id: 8, slug: 'docker', name: 'Docker' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4699 },
      { currency: 'USD', amount: 139 },
      { currency: 'GBP', amount: 109 },
      { currency: 'AED', amount: 519 },
    ],
  },
  {
    id: 12,
    slug: 'cloud-security-zero-trust',
    title: 'Cloud Security Architecture & Zero-Trust Defense',
    description: 'Implement zero-trust enterprise security architectures, IAM least privilege policies, Kubernetes security admission controllers, and automated cloud compliance auditing.',
    durationHours: 100,
    outcomes: 'Architect AWS IAM permission boundaries; Deploy Kyverno admission controllers on Kubernetes; Implement mTLS with Istio service mesh.',
    status: 'published',
    clusterSlug: 'cybersecurity',
    topicSlug: 'cloud-security',
    technologies: [
      { id: 10, slug: 'aws', name: 'AWS' },
      { id: 9, slug: 'kubernetes', name: 'Kubernetes' },
      { id: 8, slug: 'docker', name: 'Docker' },
      { id: 30, slug: 'suricata', name: 'Suricata' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5399 },
      { currency: 'USD', amount: 159 },
      { currency: 'GBP', amount: 129 },
      { currency: 'AED', amount: 589 },
    ],
  },

  // =========================================================================
  // Cluster 5: Embedded Systems & IoT
  // =========================================================================
  {
    id: 13,
    slug: 'smart-embedded-iot-systems',
    title: 'Smart Embedded Systems & Industrial IoT',
    description: 'Firmware engineering internship integrating ESP32/ARM microcontrollers, MQTT messaging protocols, real-time sensor processing, and cloud telemetry gateways.',
    durationHours: 120,
    outcomes: 'Program low-level C++ firmware; Implement secure MQTT communications; Build cloud-connected IoT dashboards with telemetry alerts.',
    status: 'published',
    clusterSlug: 'embedded-iot',
    topicSlug: 'embedded-iot-systems',
    technologies: [
      { id: 20, slug: 'cpp', name: 'C / C++' },
      { id: 26, slug: 'esp32', name: 'ESP32 / ARM' },
      { id: 27, slug: 'freertos', name: 'FreeRTOS' },
      { id: 11, slug: 'python', name: 'Python' },
      { id: 14, slug: 'redis', name: 'Redis' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 4799 },
      { currency: 'USD', amount: 139 },
      { currency: 'GBP', amount: 109 },
      { currency: 'AED', amount: 529 },
    ],
  },
  {
    id: 14,
    slug: 'automotive-embedded-systems',
    title: 'Automotive Embedded Systems & CAN Bus Networks',
    description: 'Engineer automotive electronic control units (ECUs) with FreeRTOS, CAN bus message arbitration, OBD-II diagnostic protocols, and ISO 26262 functional safety concepts.',
    durationHours: 90,
    outcomes: 'Implement CAN 2.0B frame transceiver drivers; Decode OBD-II engine parameters; Design FreeRTOS deterministic task scheduling; Apply functional safety standards.',
    status: 'published',
    clusterSlug: 'embedded-iot',
    topicSlug: 'automotive-embedded',
    technologies: [
      { id: 20, slug: 'cpp', name: 'Embedded C++' },
      { id: 27, slug: 'freertos', name: 'FreeRTOS' },
      { id: 26, slug: 'esp32', name: 'STM32 / ESP32' },
      { id: 11, slug: 'python', name: 'Python' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5299 },
      { currency: 'USD', amount: 159 },
      { currency: 'GBP', amount: 129 },
      { currency: 'AED', amount: 579 },
    ],
  },
  {
    id: 15,
    slug: 'robotics-firmware-rtos',
    title: 'Robotics Firmware Engineering & FreeRTOS Control',
    description: 'Develop real-time robotic motion controllers with FreeRTOS, PID closed-loop feedback algorithms, quadrature encoder decoding, and ROS2 micro-ROS integration.',
    durationHours: 100,
    outcomes: 'Program deterministic RTOS motor control loops; Implement PID speed and position controllers; Communicate with ROS2 via micro-ROS serial transport.',
    status: 'published',
    clusterSlug: 'embedded-iot',
    topicSlug: 'robotics-sensors',
    technologies: [
      { id: 20, slug: 'cpp', name: 'C++ 20' },
      { id: 27, slug: 'freertos', name: 'FreeRTOS' },
      { id: 26, slug: 'esp32', name: 'ESP32' },
      { id: 11, slug: 'python', name: 'ROS2 / Python' },
    ],
    projectsCount: 3,
    pricings: [
      { currency: 'INR', amount: 5199 },
      { currency: 'USD', amount: 159 },
      { currency: 'GBP', amount: 119 },
      { currency: 'AED', amount: 569 },
    ],
  },
];
