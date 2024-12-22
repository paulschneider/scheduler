import { IsNotEmpty } from 'class-validator';

export class ScheduleCreateDto {
  @IsNotEmpty()
  accountId: number;

  @IsNotEmpty()
  agentId: number;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  endTime: string;
}
