import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateStepDto {
  /** Workspace Template ID this step belongs to */
  @Type(() => Number)
  @IsInt({ message: 'Workspace Template ID must be an integer' })
  @IsNotEmpty({ message: 'Workspace Template ID is required' })
  workspaceTemplateId: number;

  /** Order index of step (1, 2, 3...) */
  @Type(() => Number)
  @IsInt({ message: 'Order index must be an integer' })
  @Min(1)
  orderIndex: number;

  /** Step title */
  @IsString()
  @IsNotEmpty({ message: 'Step title is required' })
  title: string;

  /** Step description */
  @IsOptional()
  @IsString()
  description?: string;
}
