import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateSeatOrderDto {
  @ApiProperty({
    description: 'Program ID for the internship seats',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  programId: number;

  @ApiProperty({
    description: 'Number of internship seats requested',
    example: 50,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  seatsPurchased: number;

  @ApiPropertyOptional({
    description: 'Total agreed amount for invoice (calculated from program pricing if omitted)',
    example: 249950.0,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'INR',
    default: 'INR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Optional invoice reference or PO number',
    example: 'INV-2026-08-001',
  })
  @IsOptional()
  @IsString()
  invoiceRef?: string;

  @ApiPropertyOptional({
    description: 'College ID (required when Admin creates seat order directly)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  collegeId?: number;

  @ApiPropertyOptional({
    description: 'If true, automatically marks as PAID and generates coupons immediately (Admin only)',
    example: true,
  })
  @IsOptional()
  autoGenerateCoupons?: boolean;

  @ApiPropertyOptional({
    description: 'Optional batch code prefix (e.g. EC-CAMPUS)',
    example: 'EC-VIT',
  })
  @IsOptional()
  @IsString()
  batchCodePrefix?: string;
}

export class ConfirmSeatOrderPaymentDto {
  @ApiPropertyOptional({
    description: 'Optional custom batch code prefix for generated coupons',
    example: 'EC-CAMPUS',
  })
  @IsOptional()
  @IsString()
  batchCodePrefix?: string;

  @ApiPropertyOptional({
    description: 'Optional invoice payment reference',
    example: 'BANK-TRF-98765',
  })
  @IsOptional()
  @IsString()
  invoiceRef?: string;

  @ApiPropertyOptional({
    description: 'Optional override of seats count upon confirmation',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  seatsPurchased?: number;

  @ApiPropertyOptional({
    description: 'Optional override of agreed invoice amount upon confirmation',
    example: 75000,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;
}

export class RejectSeatOrderDto {
  @ApiPropertyOptional({
    description: 'Reason for rejection/cancellation',
    example: 'Payment verification failed or duplicate request',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
