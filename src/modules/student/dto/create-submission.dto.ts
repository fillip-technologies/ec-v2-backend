import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  workspaceTaskId: number;

  @IsString()
  @IsNotEmpty()
  payloadUrl: string;
}
