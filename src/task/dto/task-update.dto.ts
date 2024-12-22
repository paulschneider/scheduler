import { IsUUID } from 'class-validator';
import { TaskCreateDto } from './task-create.dto';

export class TaskUpdateDto extends TaskCreateDto {
  @IsUUID()
  id: string;
}
