import { Injectable } from '@nestjs/common';
import { Client } from '../supabase/supabase.service';
import { StoredTask } from '../types';
import { TaskCreateDto } from './dto/task-create.dto';

@Injectable()
export class TaskService {
  tableName = 'task';

  constructor(private readonly client: Client) { }

  /**
   * Create a new task
   *
   * @param taskInsertData
   * @returns
   */
  async createTask(taskInsertData: TaskCreateDto): Promise<{ success: boolean; message: string; data: StoredTask | null }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .insert(taskInsertData)
      .select()
      .returns<StoredTask>();

    if (error) {
      throw new Error("Something went wrong");
    }

    return {
      success: true,
      message: 'Task created successfully',
      data: data[0]
    };
  }
}
