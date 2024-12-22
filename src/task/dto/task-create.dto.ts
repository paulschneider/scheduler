import { IsNotEmpty, IsNumber, IsString, IsEnum, IsUUID } from 'class-validator';
import { TaskType } from '../../types';

export class TaskCreateDto {
  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsNotEmpty()
  @IsUUID()
  scheduleId: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsEnum(TaskType)
  type: TaskType;
}
