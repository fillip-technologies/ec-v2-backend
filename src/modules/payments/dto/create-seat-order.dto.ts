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
}
