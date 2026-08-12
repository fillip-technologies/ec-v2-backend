import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  /** Program ID this project belongs to */
  @Type(() => Number)
  @IsInt({ message: 'Program ID must be an integer' })
  @IsNotEmpty({ message: 'Program ID is required' })
  programId: number;

  /** Project title */
  @IsString()
  @IsNotEmpty({ message: 'Project title is required' })
  title: string;

  /** Project description */
  @IsOptional()
  @IsString()
  description?: string;

  /** Order index within the program (1, 2, 3) */
  @Type(() => Number)
  @IsInt({ message: 'Order index must be an integer' })
  @Min(1)
  orderIndex: number;
}
