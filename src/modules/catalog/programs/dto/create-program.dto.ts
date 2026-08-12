import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProgramPricingDto } from './create-program-pricing.dto';

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
}
