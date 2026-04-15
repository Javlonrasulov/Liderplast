import { Request } from 'express';
import { Role } from '../../generated/prisma/enums.js';

export interface JwtUserPayload {
  sub: string;
  role: Role;
  phone: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
