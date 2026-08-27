import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGatewayConfigDto {
  @ApiProperty({
    description: 'Unique gateway code (e.g. razorpay, stripe)',
    example: 'razorpay',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Gateway display name',
    example: 'Razorpay',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Whether this gateway is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Gateway priority order (lower = preferred)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'List of supported country IDs',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  supportedCountryIds?: number[];
}

export class UpdateGatewayConfigDto {
  @ApiPropertyOptional({
    description: 'Whether this gateway is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Gateway priority order',
  })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'List of supported country IDs',
  })
  @IsOptional()
  @IsArray()
  supportedCountryIds?: number[];
}
