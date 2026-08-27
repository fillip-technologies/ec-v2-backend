import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateTaskDto {
  /** Workspace Template ID this task belongs to */
  @Type(() => Number)
  @IsInt({ message: 'Workspace Template ID must be an integer' })
  @IsNotEmpty({ message: 'Workspace Template ID is required' })
  workspaceTemplateId: number;

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
