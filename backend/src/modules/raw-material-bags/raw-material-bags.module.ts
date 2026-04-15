import { Module } from '@nestjs/common';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { RawMaterialBagsController } from './raw-material-bags.controller.js';
import { RawMaterialBagsService } from './raw-material-bags.service.js';

@Module({
  controllers: [RawMaterialBagsController],
  providers: [RawMaterialBagsService, RealtimeGateway],
  exports: [RawMaterialBagsService],
})
export class RawMaterialBagsModule {}
