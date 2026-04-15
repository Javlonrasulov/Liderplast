import { Module } from '@nestjs/common';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';

@Module({
  controllers: [CrmController],
  providers: [CrmService, RealtimeGateway],
})
export class CrmModule {}
