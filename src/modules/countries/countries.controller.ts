import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CountriesService } from './countries.service';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @ApiOperation({ summary: 'List all active system countries with currency codes' })
  @ApiResponse({ status: 200, description: 'Countries list returned successfully.' })
  @Get()
  async findAll() {
    return this.countriesService.findAll();
  }
}
