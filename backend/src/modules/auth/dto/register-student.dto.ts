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
  @IsOptional()
  @IsString()
  phoneNo?: string;

  /** Country ID from countries table (defaults to 1 if omitted) */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Country ID must be a valid integer' })
  countryId?: number;

  /** Student first name (or combined full name in 'name' or 'firstName') */
  @IsOptional()
  @IsString()
  firstName?: string;

  /** Student last name */
  @IsOptional()
  @IsString()
  lastName?: string;

  /** Optional full name */
  @IsOptional()
  @IsString()
  name?: string;

  /** Optional College ID (if student belongs to a registered partner college) */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'College ID must be a valid integer' })
  collegeId?: number;

  /** Custom / Unlisted College Name (if college is not in partner list or "Other" is chosen) */
  @IsOptional()
  @IsString()
  customCollegeName?: string;

  /** Alias for custom college name passed from frontend */
  @IsOptional()
  @IsString()
  college_name?: string;

  /** University Roll No / USN */
  @IsOptional()
  @IsString()
  usn?: string;

  /** Branch / Stream / Discipline (e.g. Computer Science, Mechanical, Law) */
  @IsOptional()
  @IsString()
  branch?: string;

  /** Expected Graduation Year (e.g. 2026, 2027) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  graduationYear?: number;
}
