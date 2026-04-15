import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  JwtUserPayload,
} from '../interfaces/authenticated-request.interface.js';

export const CurrentUser = createParamDecorator<
  keyof JwtUserPayload | undefined
>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.user) {
    return undefined;
  }
  return data ? request.user[data] : request.user;
});
