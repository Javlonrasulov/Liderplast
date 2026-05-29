import { Module } from '@nestjs/common';
import { CompanyAssetsController } from './company-assets.controller.js';
import { CompanyAssetsService } from './company-assets.service.js';

@Module({
  controllers: [CompanyAssetsController],
  providers: [CompanyAssetsService],
  exports: [CompanyAssetsService],
})
export class CompanyAssetsModule {}
