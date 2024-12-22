import { IsNotEmpty, IsUUID } from 'class-validator';
import { ScheduleCreateDto } from './schedule-create.dto';

export class ScheduleUpdateDto extends ScheduleCreateDto {
  @IsUUID()
  id: string;
}
