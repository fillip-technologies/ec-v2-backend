import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProgramPricingDto } from './create-program-pricing.dto';

export class CreateResourceDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsString()
  @IsNotEmpty({ message: 'Resource title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Resource URL is required' })
  url: string;
}

export class CreateRubricDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  passThreshold?: number;

  @IsOptional()
  criteria?: any;
}

export class CreateTemplateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRubricDto)
  rubric?: CreateRubricDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResourceDto)
  resources?: CreateResourceDto[];
}

export class CreateWorkspaceTemplateDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateTaskDto)
  tasks?: CreateTemplateTaskDto[];
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project title is required' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateWorkspaceTemplateDto)
  workspaceTemplate?: CreateWorkspaceTemplateDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResourceDto)
  resources?: CreateResourceDto[];
}

export class CreateProgramTestimonialDto {
  @IsString()
  @IsNotEmpty({ message: 'Author name is required' })
  authorName: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsString()
  @IsNotEmpty({ message: 'Quote is required' })
  quote: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rating?: number;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProgramFaqDto {
  @IsString()
  @IsNotEmpty({ message: 'Question is required' })
  question: string;

  @IsString()
  @IsNotEmpty({ message: 'Answer is required' })
  answer: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProgramDto {
  /** Country ID this program is configured for */
  @Type(() => Number)
  @IsInt({ message: 'Country ID must be a valid integer' })
  @IsNotEmpty({ message: 'Country ID is required' })
  countryId: number;

  /** Program title */
  @IsString()
  @IsNotEmpty({ message: 'Program title is required' })
  title: string;

  /** Unique program slug */
  @IsString()
  @IsNotEmpty({ message: 'Program slug is required' })
  slug: string;

  /** Optional program description */
  @IsOptional()
  @IsString()
  description?: string;

  /** Optional learning outcomes */
  @IsOptional()
  @IsString()
  outcomes?: string;

  /** Total duration in hours (e.g. 120) */
  @Type(() => Number)
  @IsInt({ message: 'Duration hours must be an integer' })
  @Min(1, { message: 'Duration hours must be at least 1' })
  durationHours: number;

  /** Program status: draft, published, archived */
  @IsOptional()
  @IsString()
  status?: string;

  /** List of Topic IDs linked to this program */
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  topicIds?: number[];

  /** List of Technology IDs linked to this program */
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  technologyIds?: number[];

  /** Optional pricing options linked to this program */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramPricingDto)
  pricings?: CreateProgramPricingDto[];

  /** Optional student testimonials */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramTestimonialDto)
  testimonials?: CreateProgramTestimonialDto[];

  /** Optional FAQs */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramFaqDto)
  faqs?: CreateProgramFaqDto[];

  /** Optional projects with workspace templates, tasks, rubrics, and resources */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectDto)
  projects?: CreateProjectDto[];
}
