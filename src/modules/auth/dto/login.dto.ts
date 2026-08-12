import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  /** Registered user email address */
  @IsEmail({}, { message: 'Valid email address is required' })
  @IsNotEmpty()
  email: string;

  /** Account password */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  /** Selected portal role (student, college, admin) */
  @IsOptional()
  @IsString()
  role?: string;
}
