import { Injectable } from '@nestjs/common';
import { Client } from '../supabase/supabase.service';
import { StoredTask } from '../types';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { ResourceNotFound, InternalSystemError } from '../exceptions';

@Injectable()
export class TaskService {
  tableName = 'tasks';

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

    if (error || !data) {
      return {
        success: false,
        message: 'There was a problem creating the task',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Task created successfully',
      data: data[0]
    };
  }

  /**
   * Update a task
   *
   * @param taskUpdateData
   * @returns
   */
  async updateTask(taskUpdateData: TaskUpdateDto): Promise<{ success: boolean; message: string; data: StoredTask | Error }> {
    try {
      const { data, error } = await Client.connection
        .from(this.tableName)
        .update(taskUpdateData)
        .eq('id', taskUpdateData.id)
        .select()
        .returns<StoredTask>();

      if (error || !data) {
        throw new InternalSystemError("There was a problem updating the task");
      }

      return {
        success: true,
        message: 'Task updated successfully',
        data: data[0]
      };
    } catch (error) {
      throw new InternalSystemError("There was a problem updating the task");
    }
  }

  /**
   * Fetch a task by its ID
   *
   * @param id
   * @returns
   */
  async fetchTask(id: string): Promise<{ success: boolean; message: string; data: StoredTask | null }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .select()
      .eq('id', id)
      .returns<StoredTask>();

    if (error || !data) {
      throw new ResourceNotFound("Task not found");
    }

    return {
      success: true,
      message: 'Task found',
      data: data[0]
    };
  }

  /**
   * Delete a task
   *
   * @param id
   * @returns
   */
  async deleteTask(id: string): Promise<{ success: boolean; message: string; data: null | Error }> {
    const task = await this.fetchTask(id);

    if (!task.success) {
      throw new ResourceNotFound("Task not found");
    }

    const { error } = await Client.connection
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .returns<StoredTask>();

    if (error) {
      throw new InternalSystemError("There was a problem deleting the task");
    }

    return {
      success: true,
      message: 'Task deleted successfully',
      data: null
    };
  }

  /**
   * Fetch all tasks for a given schedule
   *
   * @param scheduleId
   * @returns
   */
  async fetchAll(scheduleId: string): Promise<{ success: boolean; message: string; data: StoredTask[] }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .select()
      .eq('schedule_id', scheduleId)
      .returns<StoredTask[]>();

    if (error) {
      throw new InternalSystemError("There was a problem fetching the tasks");
    }

    if (!data) {
      throw new ResourceNotFound("Tasks not found");
    }

    return {
      success: true,
      message: 'Tasks found',
      data: data
    };
  }
}
