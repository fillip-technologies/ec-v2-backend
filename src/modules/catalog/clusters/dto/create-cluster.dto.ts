import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClusterDto {
  /** Unique cluster slug (e.g. software-engineering) */
  @IsString()
  @IsNotEmpty({ message: 'Cluster slug is required' })
  slug: string;

  /** Cluster display name */
  @IsString()
  @IsNotEmpty({ message: 'Cluster name is required' })
  name: string;

  /** Optional cluster description */
  @IsOptional()
  @IsString()
  description?: string;
}
