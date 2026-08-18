import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Razorpay Order ID',
    example: 'order_Ek12345678',
  })
  @IsNotEmpty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty({
    description: 'Razorpay Payment ID',
    example: 'pay_Ek98765432',
  })
  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty({
    description: 'Razorpay HMAC signature',
    example: '9efba45c123...',
  })
  @IsNotEmpty()
  @IsString()
  razorpay_signature: string;
}
