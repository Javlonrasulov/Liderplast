import { Module, forwardRef } from '@nestjs/common';
import { WarehouseModule } from '../warehouse/warehouse.module.js';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { KassaService } from './kassa.service.js';

@Module({
  imports: [forwardRef(() => WarehouseModule)],
  controllers: [FinanceController],
  providers: [FinanceService, KassaService],
  exports: [FinanceService, KassaService],
})
export class FinanceModule {}
