import { Module } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';

@Module({
  imports: [FinanceModule],
  controllers: [CrmController],
  providers: [CrmService, RealtimeGateway],
})
export class CrmModule {}
