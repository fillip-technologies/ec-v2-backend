import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkspaceTemplateDto {
  /** Project ID this template belongs to (populated from route param or body) */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Project ID must be an integer' })
  projectId?: number;

  /** Template version number (default 1) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;

  /** Is active template */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
