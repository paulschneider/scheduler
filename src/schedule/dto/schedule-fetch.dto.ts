import { IsUUID } from 'class-validator';

export class ScheduleFetchDto {
  @IsUUID()
  id: string;
}
