import { Module } from '@nestjs/common';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { RawMaterialBagsModule } from '../raw-material-bags/raw-material-bags.module.js';
import { WarehouseModule } from '../warehouse/warehouse.module.js';
import { ProductionController } from './production.controller.js';
import { ProductionService } from './production.service.js';

@Module({
  imports: [WarehouseModule, RawMaterialBagsModule],
  controllers: [ProductionController],
  providers: [ProductionService, RealtimeGateway],
})
export class ProductionModule {}
