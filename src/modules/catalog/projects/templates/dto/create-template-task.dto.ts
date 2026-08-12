import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateTaskDto {
  /** Template Step ID this task belongs to */
  @Type(() => Number)
  @IsInt({ message: 'Template Step ID must be an integer' })
  @IsNotEmpty({ message: 'Template Step ID is required' })
  stepId: number;

  /** Order index of task (1, 2, 3...) */
  @Type(() => Number)
  @IsInt({ message: 'Order index must be an integer' })
  @Min(1)
  orderIndex: number;

  /** Task title */
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

  /** Task description */
  @IsOptional()
  @IsString()
  description?: string;
}
