import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  workspaceTaskId: number;

  @IsString()
  @IsOptional()
  commitHash?: string;

  @IsString()
  @IsOptional()
  payloadUrl?: string;
}
