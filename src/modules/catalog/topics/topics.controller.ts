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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Catalog - Topics')
@Controller('catalog/topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({ status: 200, description: 'Topics list returned successfully.' })
  @Get()
  async findAll() {
    return this.topicsService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Topic' })
  @ApiResponse({ status: 201, description: 'Topic created successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Topic' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.topicsService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Topic by ID' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.remove(id);
  }
}
