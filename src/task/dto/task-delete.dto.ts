import { IsUUID, IsNotEmpty } from 'class-validator';

export class TaskDeleteDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
