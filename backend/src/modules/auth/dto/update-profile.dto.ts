import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  // Common User fields
  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phoneNo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  countryId?: number;

  // Student specific fields
  @ApiPropertyOptional({ example: 'Rahul' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Sharma' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  collegeId?: number;

  @ApiPropertyOptional({ example: 'Vellore Institute of Technology' })
  @IsOptional()
  @IsString()
  customCollegeName?: string;

  @ApiPropertyOptional({ example: '1VE21CS048' })
  @IsOptional()
  @IsString()
  usn?: string;

  @ApiPropertyOptional({ example: 'Computer Science & Engineering' })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  // College specific fields
  @ApiPropertyOptional({ example: 'Vellore Institute of Technology' })
  @IsOptional()
  @IsString()
  collegeName?: string;

  @ApiPropertyOptional({ example: 'Katpadi, Vellore, Tamil Nadu' })
  @IsOptional()
  @IsString()
  collegeAddress?: string;
}
