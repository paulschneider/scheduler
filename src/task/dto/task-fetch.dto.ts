import { IsUUID } from 'class-validator';

export class TaskFetchDto {
  @IsUUID()
  id: string;
}
