import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './core/config/configuration.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CountriesModule } from './modules/countries/countries.module';
import { StudentModule } from './modules/student/student.module';
import { AdminModule } from './modules/admin/admin.module';
import { CollegeModule } from './modules/college/college.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigurationModule,
    PrismaModule,
    AuthModule,
    CatalogModule,
    CountriesModule,
    StudentModule,
    AdminModule,
    CollegeModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

