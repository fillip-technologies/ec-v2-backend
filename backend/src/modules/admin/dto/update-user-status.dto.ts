import { IsString, IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  @IsIn(['active', 'pending', 'disabled'])
  status: string;
}
