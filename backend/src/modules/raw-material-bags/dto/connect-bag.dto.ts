import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export const CONNECT_BAG_ACTIONS = ['RETURN_TO_STORAGE', 'WRITE_OFF'] as const;
export type ConnectBagAction = (typeof CONNECT_BAG_ACTIONS)[number];

export class ConnectBagDto {
  @IsString()
  bagId!: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsDateString()
  connectedAt?: string;

  @IsOptional()
  @IsIn(CONNECT_BAG_ACTIONS)
  previousBagAction?: ConnectBagAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
