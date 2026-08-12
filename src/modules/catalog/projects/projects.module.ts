import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesService } from './templates/templates.service';

@Module({
  controllers: [ProjectsController, TemplatesController],
  providers: [ProjectsService, TemplatesService],
  exports: [ProjectsService, TemplatesService],
})
export class ProjectsModule {}
