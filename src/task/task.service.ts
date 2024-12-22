import { Injectable } from '@nestjs/common';
import { Client } from '../supabase/supabase.service';
import { StoredTask } from '../types';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { ResourceNotFound, InternalSystemError } from '../exceptions';
import { responses } from '../common/messages/responses';

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
      .insert({
        account_id: taskInsertData.accountId,
        schedule_id: taskInsertData.scheduleId,
        start_time: taskInsertData.startTime,
        duration: taskInsertData.duration,
        type: taskInsertData.type
      })
      .select()
      .returns<StoredTask>();

    if (error || !data) {
      return {
        success: false,
        message: responses.task.create.error,
        data: null,
      };
    }

    return {
      success: true,
      message: responses.task.create.success,
      data: data[0]
    };
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
      throw new ResourceNotFound(responses.task.fetch.notFound);
    }

    return {
      success: true,
      message: responses.task.fetch.success,
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
    const task = await this.fetchTask(taskUpdateData.id);

    if (!task.success) {
      throw new ResourceNotFound(responses.task.delete.notFound);
    }

    try {
      const { data, error } = await Client.connection
        .from(this.tableName)
        .update({
          account_id: taskUpdateData.accountId,
          schedule_id: taskUpdateData.scheduleId,
          start_time: taskUpdateData.startTime,
          duration: taskUpdateData.duration,
          type: taskUpdateData.type
        })
        .eq('id', taskUpdateData.id)
        .select()
        .returns<StoredTask>();

      if (error) {
        throw new InternalSystemError(responses.task.update.error);
      }

      return {
        success: true,
        message: responses.task.update.success,
        data: data[0]
      };
    } catch (error) {
      throw new InternalSystemError(responses.task.update.error);
    }
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
      throw new ResourceNotFound(responses.task.delete.notFound);
    }

    const { error } = await Client.connection
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .returns<StoredTask>();

    if (error) {
      throw new InternalSystemError(responses.task.delete.error);
    }

    return {
      success: true,
      message: responses.task.delete.success,
      data: null
    };
  }

  /**
   * Fetch all tasks for a given schedule
   *
   * @param scheduleId
   * @returns
   */
  async fetchAll(): Promise<{ success: boolean; message: string; data: StoredTask[] }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .select()
      .returns<StoredTask[]>();

    if (error) {
      throw new InternalSystemError(responses.task.fetchAll.error);
    }

    if (!data) {
      throw new ResourceNotFound(responses.task.fetchAll.notFound);
    }

    return {
      success: true,
      message: responses.task.fetchAll.success,
      data: data
    };
  }
}
