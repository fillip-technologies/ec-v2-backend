import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CheckoutDto {
  @ApiPropertyOptional({
    description: 'Coupon code for 100% discount / seat redemption',
    example: 'EC-FREE-2026',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'ISO currency code for payment',
    example: 'INR',
    default: 'INR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Country ID for location-specific pricing',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  countryId?: number;
}
