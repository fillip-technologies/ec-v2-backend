import { PartialType } from '@nestjs/swagger';
import { CreateTemplateStepDto } from './create-template-step.dto';

export class UpdateTemplateStepDto extends PartialType(CreateTemplateStepDto) {}
