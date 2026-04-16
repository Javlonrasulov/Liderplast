import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { ConnectBagDto } from './dto/connect-bag.dto.js';
import { ListBagsDto } from './dto/list-bags.dto.js';
import { SwitchBagDto } from './dto/switch-bag.dto.js';
import { UpdateBagDto } from './dto/update-bag.dto.js';
import { WriteoffBagDto } from './dto/writeoff-bag.dto.js';
import { RawMaterialBagsService } from './raw-material-bags.service.js';

@Controller('raw-material-bags')
export class RawMaterialBagsController {
  constructor(
    private readonly rawMaterialBagsService: RawMaterialBagsService,
  ) {}

  @Get()
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  findAll(@Query() query: ListBagsDto) {
    return this.rawMaterialBagsService.getBags(query);
  }

  @Get('active')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getActive() {
    return this.rawMaterialBagsService.getActiveBag();
  }

  @Get('logs')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getLogs() {
    return this.rawMaterialBagsService.getLogs();
  }

  @Post('connect')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  connect(
    @Body() dto: ConnectBagDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.rawMaterialBagsService.connectBag(dto, userId);
  }

  @Post('switch')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  switch(
    @Body() dto: SwitchBagDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.rawMaterialBagsService.switchBag(dto, userId);
  }

  @Post('writeoff')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  writeoff(
    @Body() dto: WriteoffBagDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.rawMaterialBagsService.writeoffBag(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  updateName(
    @Param('id') id: string,
    @Body() dto: UpdateBagDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.rawMaterialBagsService.updateBagName(id, dto, userId);
  }
}
