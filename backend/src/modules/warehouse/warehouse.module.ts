import { Module } from '@nestjs/common';
import { RawMaterialBagsModule } from '../raw-material-bags/raw-material-bags.module.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { WarehouseController } from './warehouse.controller.js';
import { WarehouseService } from './warehouse.service.js';

@Module({
  imports: [RawMaterialBagsModule],
  controllers: [WarehouseController],
  providers: [WarehouseService, RealtimeGateway],
  exports: [WarehouseService],
})
export class WarehouseModule {}
