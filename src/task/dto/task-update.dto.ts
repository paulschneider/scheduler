import { IsNotEmpty, IsNumber, IsString, Matches, IsEnum } from 'class-validator';
import { TaskType } from '../../types';

export class TaskUpdateDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsString()
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
