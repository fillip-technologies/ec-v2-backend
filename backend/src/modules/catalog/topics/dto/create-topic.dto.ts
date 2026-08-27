import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTopicDto {
  /** Cluster ID this topic belongs to */
  @Type(() => Number)
  @IsInt({ message: 'Cluster ID must be a valid integer' })
  @IsNotEmpty({ message: 'Cluster ID is required' })
  clusterId: number;

  /** Unique topic slug (e.g. fullstack-web-dev) */
  @IsString()
  @IsNotEmpty({ message: 'Topic slug is required' })
  slug: string;

  /** Topic display name */
  @IsString()
  @IsNotEmpty({ message: 'Topic name is required' })
  name: string;

  /** Optional active status flag */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
