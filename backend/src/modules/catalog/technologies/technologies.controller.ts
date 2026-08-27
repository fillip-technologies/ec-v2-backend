import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Catalog - Technologies')
@Controller('catalog/technologies')
export class TechnologiesController {
  constructor(private technologiesService: TechnologiesService) {}

  @ApiOperation({ summary: 'Get all active technologies' })
  @ApiResponse({ status: 200, description: 'Technologies list returned successfully.' })
  @Get()
  async findAll() {
    return this.technologiesService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Technology' })
  @ApiResponse({ status: 201, description: 'Technology created successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTechnologyDto) {
    return this.technologiesService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Technology' })
  @ApiResponse({ status: 200, description: 'Technology updated successfully.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTechnologyDto,
  ) {
    return this.technologiesService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Technology by ID' })
  @ApiResponse({ status: 200, description: 'Technology deleted successfully.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.technologiesService.remove(id);
  }
}
