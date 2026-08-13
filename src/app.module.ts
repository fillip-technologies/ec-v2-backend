import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './core/config/configuration.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CountriesModule } from './modules/countries/countries.module';
import { StudentModule } from './modules/student/student.module';

@Module({
  imports: [
    ConfigurationModule,
    PrismaModule,
    AuthModule,
    CatalogModule,
    CountriesModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
