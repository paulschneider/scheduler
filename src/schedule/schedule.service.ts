import { Injectable } from '@nestjs/common';
import { Client } from '../supabase/supabase.service';
import { Schedule, StoredSchedule } from '../types';
import { ScheduleCreateDto } from './dto/schedule-create.dto';
import { ScheduleUpdateDto } from './dto/schedule-update.dto';
import { ResourceNotFound, InternalSystemError } from '../exceptions';
import { ScheduleFetchDto } from './dto/schedule-fetch.dto';
import { ScheduleDeleteDto } from './dto/schedule-delete.dto';
import { responses } from '../common/messages/responses';
import { PostgrestSingleResponse } from '@supabase/supabase-js'

@Injectable()
export class ScheduleService {
  tableName = 'schedule';

  constructor(private readonly client: Client) { }

  /**
   * Create a new schedule
   *
   * @param scheduleInsertData
   * @returns
   */
  async createSchedule(
    scheduleInsertData: ScheduleCreateDto,
  ): Promise<{ success: boolean; message: string; data: Schedule }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .insert({
        "account_id": scheduleInsertData.accountId,
        "agent_id": scheduleInsertData.agentId,
        "start_time": scheduleInsertData.startTime,
        "end_time": scheduleInsertData.endTime,
      })
      .select()
      .returns<Schedule>();

    if (error) {
      console.log(error);
      throw new InternalSystemError(responses.schedule.create.error);
    }

    return {
      success: true,
      message: responses.schedule.create.success,
      data: data[0],
    };
  }

  /**
   * Fetch a schedule by its ID
   *
   * @param id
   * @returns
   */
  async fetch(
    fetchDto: ScheduleFetchDto,
  ): Promise<{ success: boolean; message: string; data: Schedule | null }> {
    const { data, error } = await this.fetchById(fetchDto.id)

    if (error) {
      throw new InternalSystemError(responses.schedule.fetch.error);
    }

    if (Object.keys(data).length === 0) {
      throw new ResourceNotFound(responses.schedule.fetch.notFound);
    }

    return {
      success: true,
      message: responses.schedule.fetch.success,
      data: data[0],
    };
  }

  /**
   * Retrieve a schedule by its unique identifier
   * 
   * @param id 
   */
  async fetchById(id: string): Promise<PostgrestSingleResponse<StoredSchedule | null>> {
    return Client.connection
      .from(this.tableName)
      .select("*, task(*)")
      .eq('id', id)
      .returns<StoredSchedule | null>();
  }

  /**
   * Fetch all schedules
   *
   * @returns
   */
  async fetchAll(): Promise<{
    success: boolean;
    message: string;
    data: Schedule[];
  }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .select()
      .returns<Schedule[]>();

    if (error) {
      throw new InternalSystemError(responses.schedule.fetchAll.error);
    }

    return {
      success: true,
      message: responses.schedule.fetchAll.success,
      data: data
    };
  }

  /**
   * Update a schedule
   *
   * @param id
   * @param scheduleUpdateData
   * @returns
   */
  async updateSchedule(scheduleUpdateData: ScheduleUpdateDto): Promise<{ success: boolean; message: string; data: Schedule }> {
    const { data: fetchData, error: fetchError } = await this.fetchById(scheduleUpdateData.id);

    if (!fetchData) {
      throw new ResourceNotFound(responses.schedule.update.notFound);
    }

    const { data, error } = await Client.connection
      .from(this.tableName)
      .update({
        "account_id": scheduleUpdateData.accountId,
        "agent_id": scheduleUpdateData.agentId,
        "start_time": scheduleUpdateData.startTime,
        "end_time": scheduleUpdateData.endTime
      })
      .eq('id', scheduleUpdateData.id)
      .select()
      .returns<Schedule>();

    if (error) {
      throw new InternalSystemError(responses.schedule.update.error);
    }

    if (!data) {
      throw new ResourceNotFound(responses.schedule.update.notFound);
    }

    return {
      success: true,
      message: responses.schedule.update.success,
      data: data[0],
    };
  }

  /**
   * Delete a schedule
   *
   * @Note: This is a hard delete, it will remove the schedule from the database, and all tasks associated with it
   * 
   * @param id
   * @returns
   */
  async deleteSchedule(deleteDto: ScheduleDeleteDto): Promise<{ success: boolean; message: string; data: null | Error }> {

    // seems like selecting data as part of the delete returns the deleted row
    // so we can't rely on that as confirmation of the removal
    const { data, error } = await Client.connection
      .from(this.tableName)
      .delete()
      .eq('id', deleteDto.id)
      .returns<null>();

    if (error) {
      throw new InternalSystemError(responses.schedule.delete.error);
    }

    // ^^^ ... So we'll do a separate check and if we don't 
    // find the schedule we know the delete worked
    const { data: fetchData, error: _fetchError } = await this.fetchById(deleteDto.id);

    // If we have data then the delete failed
    if (Object.keys(fetchData).length === 0) {
      return {
        success: true,
        message: responses.schedule.delete.success,
        data: null,
      };
    }

    throw new InternalSystemError(responses.schedule.delete.dataFound);
  }
}
