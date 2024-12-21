import { IsNotEmpty } from 'class-validator';

export class ScheduleDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  action: string;

  @IsNotEmpty()
  entityId: string;

  @IsNotEmpty()
  recoveryPath: string;
}
