import { IsString, IsIn } from 'class-validator';

export class UpdateCollegeStatusDto {
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status: string;
}
