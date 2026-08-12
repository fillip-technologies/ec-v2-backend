import { Module } from '@nestjs/common';
import { ClustersController } from './clusters/clusters.controller';
import { ClustersService } from './clusters/clusters.service';
import { TopicsController } from './topics/topics.controller';
import { TopicsService } from './topics/topics.service';
import { TechnologiesController } from './technologies/technologies.controller';
import { TechnologiesService } from './technologies/technologies.service';
import { ProgramsController } from './programs/programs.controller';
import { ProgramsService } from './programs/programs.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { TemplatesController } from './projects/templates/templates.controller';
import { TemplatesService } from './projects/templates/templates.service';

@Module({
  controllers: [
    ClustersController,
    TopicsController,
    TechnologiesController,
    ProgramsController,
    ProjectsController,
    TemplatesController,
  ],
  providers: [
    ClustersService,
    TopicsService,
    TechnologiesService,
    ProgramsService,
    ProjectsService,
    TemplatesService,
  ],
  exports: [
    ClustersService,
    TopicsService,
    TechnologiesService,
    ProgramsService,
    ProjectsService,
    TemplatesService,
  ],
})
export class CatalogModule {}
