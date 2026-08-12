import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterCollegeDto {
  /** Official college administrator email address */
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

  /** Unique Institution / College name */
  @IsString()
  @IsNotEmpty({ message: 'College name is required' })
  collegeName: string;

  /** Physical campus address */
  @IsString()
  @IsNotEmpty({ message: 'College address is required' })
  address: string;
}
