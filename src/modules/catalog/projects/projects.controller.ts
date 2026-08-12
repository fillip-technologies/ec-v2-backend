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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Catalog - Projects')
@Controller('catalog/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'List all catalog projects with optional programId filter' })
  @ApiQuery({ name: 'programId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Projects list returned successfully.' })
  @Get()
  async findAll(@Query('programId') programId?: number) {
    return this.projectsService.findAll(programId ? Number(programId) : undefined);
  }

  @ApiOperation({ summary: 'Get single catalog project details by ID' })
  @ApiResponse({ status: 200, description: 'Project details returned successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new catalog Project' })
  @ApiResponse({ status: 201, description: 'Project created successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing catalog Project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a catalog Project by ID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}
