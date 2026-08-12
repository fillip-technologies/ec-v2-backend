import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramPricingDto {
  /** Country ID for this pricing option */
  @Type(() => Number)
  @IsInt({ message: 'Country ID must be a valid integer' })
  @IsNotEmpty({ message: 'Country ID is required' })
  countryId: number;

  /** Currency code (e.g. INR, USD, EUR) */
  @IsString()
  @IsNotEmpty({ message: 'Currency code is required' })
  currency: string;

  /** Pricing amount (e.g. 4999.00 or 99.00) */
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0, { message: 'Amount cannot be negative' })
  amount: number;

  /** Is pricing option active */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Optional valid from date */
  @IsOptional()
  @IsDateString({}, { message: 'validFrom must be a valid ISO date string' })
  validFrom?: string;

  /** Optional valid until date */
  @IsOptional()
  @IsDateString({}, { message: 'validUntil must be a valid ISO date string' })
  validUntil?: string;
}
