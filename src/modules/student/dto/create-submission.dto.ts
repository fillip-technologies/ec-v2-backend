import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  workspaceStepId: number;

  @IsString()
  @IsNotEmpty()
  payloadUrl: string;
}
