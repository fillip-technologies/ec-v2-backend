import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWorkspaceRepoDto {
  @IsString()
  @IsNotEmpty()
  repoUrl: string;
}
