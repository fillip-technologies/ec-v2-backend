import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({
    description: 'Coupon code to validate',
    example: 'EC-KONGU-2026-A1',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Program ID for the internship',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  programId: number;
}
