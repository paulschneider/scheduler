import { IsUUID, IsNotEmpty } from 'class-validator';

export class TaskFetchAllForScheduleDto {
  @IsUUID()
  @IsNotEmpty()
  scheduleId: string;
}
