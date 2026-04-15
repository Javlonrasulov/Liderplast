import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export const SWITCH_BAG_ACTIONS = ['RETURN_TO_STORAGE', 'WRITE_OFF'] as const;
export type SwitchBagAction = (typeof SWITCH_BAG_ACTIONS)[number];

export class SwitchBagDto {
  @IsString()
  nextBagId!: string;

  @IsIn(SWITCH_BAG_ACTIONS)
  previousBagAction!: SwitchBagAction;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsDateString()
  switchedAt?: string;
}
