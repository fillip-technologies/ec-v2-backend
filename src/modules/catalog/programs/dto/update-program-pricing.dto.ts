import { PartialType } from '@nestjs/swagger';
import { CreateProgramPricingDto } from './create-program-pricing.dto';

export class UpdateProgramPricingDto extends PartialType(CreateProgramPricingDto) {}
