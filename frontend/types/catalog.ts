export interface Cluster {
  id: number;
  slug: string;
  name: string;
  description?: string;
  topics?: Topic[];
}

export interface Topic {
  id: number;
  clusterId: number;
  slug: string;
  name: string;
  isActive: boolean;
  cluster?: Cluster;
}

export interface Technology {
  id: number;
  slug: string;
  name: string;
  isActive: boolean;
}

export interface Country {
  id: number;
  isoCode: string;
  name: string;
  defaultLocal: string;
  timezone: string;
  currencyCode: string;
  isActive: boolean;
}

export interface ProgramPricing {
  id: number;
  programId: number;
  countryId: number;
  currency: string;
  amount: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  country?: Country;
}

export interface Resource {
  id: number;
  ownerType: 'PROJECT' | 'STEP' | 'TASK';
  projectId?: number;
  stepId?: number;
  taskId?: number;
  type: string;
  title: string;
  url: string;
}

export interface TemplateTask {
  id?: number;
  workspaceTemplateId?: number;
  stepId?: number;
  orderIndex: number;
  title: string;
  description?: string;
  status?: string;
  rubric?: Rubric;
  resources?: Resource[];
  latestSubmission?: {
    id?: number;
    commitHash?: string;
    payloadUrl?: string;
    submittedAt?: string;
  };
  latestReview?: {
    score?: number;
    maxScore?: number;
    passThreshold?: number;
    feedback?: string;
    criteriaBreakdown?: any;
    submittedAt?: string;
  };
}

export interface Rubric {
  id?: number;
  taskId?: number;
  stepId?: number;
  version?: number;
  criteria: any;
  maxScore: number;
  passThreshold: number;
}

export interface TemplateStep {
  id?: number;
  workspaceTemplateId?: number;
  orderIndex: number;
  title: string;
  description?: string;
  tasks?: TemplateTask[];
  rubric?: Rubric;
  resources?: Resource[];
}

export interface WorkspaceTemplate {
  id?: number;
  projectId?: number;
  version: number;
  isActive: boolean;
  repoUrl?: string;
  tasks?: TemplateTask[];
  steps?: TemplateStep[];
}

export interface Project {
  id: number;
  programId: number;
  title: string;
  description?: string;
  orderIndex: number;
  status?: string;
  hours?: number;
  workspaceId?: number;
  repoUrl?: string;
  workspaceTemplate?: WorkspaceTemplate;
  resources?: Resource[];
}

export interface ProgramTestimonial {
  id: number;
  programId: number;
  authorName: string;
  authorRole?: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  orderIndex?: number;
  isActive: boolean;
}

export interface ProgramFaq {
  id: number;
  programId: number;
  question: string;
  answer: string;
  orderIndex?: number;
  isActive: boolean;
}

export interface Program {
  id: number;
  countryId: number;
  title: string;
  slug: string;
  description?: string;
  outcomes?: string;
  durationHours: number;
  status: string;
  country?: Country;
  topics?: { topic: Topic }[];
  technologies?: { technology: Technology }[];
  pricings?: ProgramPricing[];
  projects?: Project[];
  testimonials?: ProgramTestimonial[];
  faqs?: ProgramFaq[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogFilterState {
  search: string;
  clusterId: number | null;
  topicId: number | null;
  technologyId: number | null;
  durationHours: number | null;
  status: string;
}

export type ProgramTestimonialForm = Partial<ProgramTestimonial> & {
  authorName: string;
  quote: string;
};

export type ProgramFaqForm = Partial<ProgramFaq> & {
  question: string;
  answer: string;
};

export type DomainCluster = Cluster;
export type ProgramTopic = Topic;

