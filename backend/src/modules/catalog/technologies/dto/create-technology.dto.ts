import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTechnologyDto {
  /** Unique technology slug (e.g. python, fastapi, mern-stack) */
  @IsString()
  @IsNotEmpty({ message: 'Technology slug is required' })
  slug: string;

  /** Technology display name (e.g. Python, FastAPI, MERN Stack) */
  @IsString()
  @IsNotEmpty({ message: 'Technology name is required' })
  name: string;

  /** Optional active status flag */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
