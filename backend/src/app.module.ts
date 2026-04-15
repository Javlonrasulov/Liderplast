import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import envConfiguration from './config/env.configuration.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { AppPermissionGuard } from './common/guards/app-permission.guard.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { WarehouseModule } from './modules/warehouse/warehouse.module.js';
import { ProductionModule } from './modules/production/production.module.js';
import { RawMaterialBagsModule } from './modules/raw-material-bags/raw-material-bags.module.js';
import { CrmModule } from './modules/crm/crm.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { FileUploadModule } from './modules/file-upload/file-upload.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfiguration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WarehouseModule,
    ProductionModule,
    RawMaterialBagsModule,
    CrmModule,
    FinanceModule,
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AppPermissionGuard,
    },
  ],
})
export class AppModule {}
