import { Module } from '@nestjs/common';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { WarehouseController } from './warehouse.controller.js';
import { WarehouseService } from './warehouse.service.js';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, RealtimeGateway],
  exports: [WarehouseService],
})
export class WarehouseModule {}
