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
import { ClustersService } from './clusters.service';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Catalog - Clusters')
@Controller('catalog/clusters')
export class ClustersController {
  constructor(private clustersService: ClustersService) {}

  @ApiOperation({
    summary: 'Get all clusters & topics',
    description: 'Retrieves all course clusters along with active topics.',
  })
  @ApiResponse({ status: 200, description: 'Clusters list returned successfully.' })
  @Get()
  async findAll() {
    return this.clustersService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Cluster' })
  @ApiResponse({ status: 201, description: 'Cluster created successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateClusterDto) {
    return this.clustersService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Cluster' })
  @ApiResponse({ status: 200, description: 'Cluster updated successfully.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClusterDto,
  ) {
    return this.clustersService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Cluster by ID' })
  @ApiResponse({ status: 200, description: 'Cluster deleted successfully.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clustersService.remove(id);
  }
}
