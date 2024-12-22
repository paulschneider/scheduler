import { IsUUID } from 'class-validator';

export class ScheduleDeleteDto {
  @IsUUID()
  id: string;
}

