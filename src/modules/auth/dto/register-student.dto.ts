import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterStudentDto {
  /** Unique student email address */
  @IsEmail({}, { message: 'Valid email address is required' })
  @IsNotEmpty()
  email: string;

  /** Account password (minimum 8 characters) */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  /** Contact phone number */
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNo: string;

  /** Country ID from countries table */
  @Type(() => Number)
  @IsInt({ message: 'Country ID must be a valid integer' })
  @IsNotEmpty({ message: 'Country ID is required' })
  countryId: number;

  /** Student first name */
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  /** Student last name */
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  /** Optional College ID (if student belongs to a registered college) */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'College ID must be a valid integer' })
  collegeId?: number;
}
