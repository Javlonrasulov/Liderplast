import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { CrmService } from './crm.service.js';

@Controller()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('clients')
  @Roles(Role.DIRECTOR, Role.MANAGER)
  createClient(@Body() dto: CreateClientDto) {
    return this.crmService.createClient(dto);
  }

  @Get('clients')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getClients() {
    return this.crmService.getClients();
  }

  @Post('orders')
  @Roles(Role.DIRECTOR, Role.MANAGER)
  createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.crmService.createOrder(dto, userId);
  }

  @Get('orders')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getOrders() {
    return this.crmService.getOrders();
  }

  @Post('payments')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.crmService.createPayment(dto);
  }

  @Get('payments')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getPayments() {
    return this.crmService.getPayments();
  }

  @Delete('payments/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  deletePayment(@Param('id') id: string) {
    return this.crmService.deletePayment(id);
  }
}
