import { Module } from '@nestjs/common';
import { RawMaterialBagsModule } from '../raw-material-bags/raw-material-bags.module.js';
import { FinanceModule } from '../finance/finance.module.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { WarehouseController } from './warehouse.controller.js';
import { WarehouseService } from './warehouse.service.js';

@Module({
  imports: [RawMaterialBagsModule, FinanceModule],
  controllers: [WarehouseController],
  providers: [WarehouseService, RealtimeGateway],
  exports: [WarehouseService],
})
export class WarehouseModule {}
