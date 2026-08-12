import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateProgramPricingDto } from './dto/create-program-pricing.dto';
import { UpdateProgramPricingDto } from './dto/update-program-pricing.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Permissions } from '../../../core/decorators/permissions.decorator';

@ApiTags('Catalog - Programs')
@Controller('catalog/programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @ApiOperation({ summary: 'List all programs with optional filters and pricings' })
  @ApiQuery({ name: 'countryId', required: false, type: Number })
  @ApiQuery({ name: 'topicId', required: false, type: Number })
  @ApiQuery({ name: 'technologyId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'draft, published, archived' })
  @ApiResponse({ status: 200, description: 'Programs list returned successfully.' })
  @Get()
  async findAll(
    @Query('countryId') countryId?: number,
    @Query('topicId') topicId?: number,
    @Query('technologyId') technologyId?: number,
    @Query('status') status?: string,
  ) {
    return this.programsService.findAll(
      countryId ? Number(countryId) : undefined,
      topicId ? Number(topicId) : undefined,
      technologyId ? Number(technologyId) : undefined,
      status,
    );
  }

  @ApiOperation({ summary: 'Get program details by ID or slug' })
  @ApiResponse({ status: 200, description: 'Program details returned successfully.' })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  @Get(':idOrSlug')
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    return this.programsService.findByIdOrSlug(idOrSlug);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Program with optional pricings and status' })
  @ApiResponse({ status: 201, description: 'Program created successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'admin')
  @Permissions('program:create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProgramDto) {
    return this.programsService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Program' })
  @ApiResponse({ status: 200, description: 'Program updated successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'admin')
  @Permissions('program:update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Program by ID' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'admin')
  @Permissions('program:publish')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.remove(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add pricing option to an existing program' })
  @ApiResponse({ status: 201, description: 'Program pricing added successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'admin')
  @Permissions('program:update')
  @Post(':id/pricing')
  @HttpCode(HttpStatus.CREATED)
  async addPricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProgramPricingDto,
  ) {
    return this.programsService.addPricing(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Program Pricing entry' })
  @ApiResponse({ status: 200, description: 'Program pricing updated successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'admin')
  @Permissions('program:update')
  @Patch('pricing/:pricingId')
  async updatePricing(
    @Param('pricingId', ParseIntPipe) pricingId: number,
    @Body() dto: UpdateProgramPricingDto,
  ) {
    return this.programsService.updatePricing(pricingId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Program Pricing entry' })
  @ApiResponse({ status: 200, description: 'Program pricing deleted successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'admin')
  @Permissions('program:publish')
  @Delete('pricing/:pricingId')
  async removePricing(@Param('pricingId', ParseIntPipe) pricingId: number) {
    return this.programsService.removePricing(pricingId);
  }
}
