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
import { TemplatesService } from './templates.service';
import { CreateWorkspaceTemplateDto } from './dto/create-workspace-template.dto';
import { CreateTemplateTaskDto } from './dto/create-template-task.dto';
import { UpdateTemplateTaskDto } from './dto/update-template-task.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Catalog - Workspace Templates')
@Controller('catalog')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @ApiOperation({ summary: 'Get workspace template for a catalog project' })
  @ApiResponse({ status: 200, description: 'Workspace template returned successfully.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  @Get('projects/:projectId/template')
  async findTemplateByProjectId(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.templatesService.findTemplateByProjectId(projectId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update workspace template for a catalog project' })
  @ApiResponse({ status: 201, description: 'Workspace template saved successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post('projects/:projectId/template')
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateTemplate(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateWorkspaceTemplateDto,
  ) {
    dto.projectId = projectId;
    return this.templatesService.createOrUpdateTemplate(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new TemplateTask' })
  @ApiResponse({ status: 201, description: 'TemplateTask created successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post('templates/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() dto: CreateTemplateTaskDto) {
    return this.templatesService.createTask(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing TemplateTask' })
  @ApiResponse({ status: 200, description: 'TemplateTask updated successfully.' })
  @UseGuards(JwtAuthGuard)
  @Patch('templates/tasks/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateTaskDto,
  ) {
    return this.templatesService.updateTask(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a TemplateTask by ID' })
  @ApiResponse({ status: 200, description: 'TemplateTask deleted successfully.' })
  @UseGuards(JwtAuthGuard)
  @Delete('templates/tasks/:id')
  async removeTask(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.removeTask(id);
  }
}
