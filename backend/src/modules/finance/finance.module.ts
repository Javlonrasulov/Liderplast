import { Module, forwardRef } from '@nestjs/common';
import { WarehouseModule } from '../warehouse/warehouse.module.js';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { KassaService } from './kassa.service.js';
import { StatementService } from './statement.service.js';

@Module({
  imports: [forwardRef(() => WarehouseModule)],
  controllers: [FinanceController],
  providers: [FinanceService, KassaService, StatementService],
  exports: [FinanceService, KassaService, StatementService],
})
export class FinanceModule {}
