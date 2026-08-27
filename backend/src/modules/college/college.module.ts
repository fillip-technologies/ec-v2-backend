import { Module } from '@nestjs/common';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CollegeController],
  providers: [CollegeService],
  exports: [CollegeService],
})
export class CollegeModule {}
