import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { JwtUserPayload } from '../../common/interfaces/authenticated-request.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.ADMIN)
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() token: JwtUserPayload,
  ) {
    const role = dto.role ?? Role.WORKER;
    const isShiftWorker =
      role === Role.WORKER &&
      (dto.canLogin === false || dto.canLogin === undefined);
    if (!isShiftWorker) {
      const ok =
        token.role === Role.ADMIN ||
        token.role === Role.ACCOUNTANT ||
        Boolean(token.permissions?.includes('manage_users'));
      if (!ok) {
        throw new ForbiddenException();
      }
    }
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() token: JwtUserPayload,
  ) {
    const ok =
      token.role === Role.ADMIN ||
      token.role === Role.ACCOUNTANT ||
      Boolean(token.permissions?.includes('manage_users'));
    if (!ok) {
      throw new ForbiddenException();
    }
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() token: JwtUserPayload,
  ) {
    const existing = await this.usersService.findById(id);
    if (existing.role === Role.WORKER) {
      const ok =
        token.role === Role.ADMIN ||
        Boolean(token.permissions?.includes('manage_shift_workers')) ||
        Boolean(token.permissions?.includes('manage_users'));
      if (!ok) {
        throw new ForbiddenException();
      }
    } else {
      const ok =
        token.role === Role.ADMIN ||
        Boolean(token.permissions?.includes('manage_users'));
      if (!ok) {
        throw new ForbiddenException();
      }
    }
    return this.usersService.remove(id);
  }
}
