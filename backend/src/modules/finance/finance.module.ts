import { Module, forwardRef } from '@nestjs/common';
import { WarehouseModule } from '../warehouse/warehouse.module.js';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';

@Module({
  imports: [forwardRef(() => WarehouseModule)],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
