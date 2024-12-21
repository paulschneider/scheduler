import { Injectable } from '@nestjs/common';
import { Client } from '../supabase/supabase.service';
import { Schedule } from '../types';

@Injectable()
export class ScheduleService {
  tableName = 'schedule';

  constructor(private readonly client: Client) {}

  /**
   * Create a new schedule
   *
   * @param scheduleInsertData
   * @returns
   */
  async createSchedule(
    scheduleInsertData,
  ): Promise<{ success: boolean; message: string; data: Schedule }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .insert(scheduleInsertData)
      .select()
      .returns<Schedule>();

    console.log(data, error);

    return {
      success: true,
      message: 'Schedule created successfully',
      data: data[0],
    };
  }

  /**
   * Fetch a schedule by its ID
   *
   * @param id
   * @returns
   */
  async fetchSchedule(
    id: string,
  ): Promise<{ success: boolean; message: string; data: Schedule | null }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .select()
      .eq('id', id)
      .returns<Schedule>();

    if (error || !data) {
      return {
        success: false,
        message: 'Not found',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Schedule found',
      data: data[0],
    };
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

    if (error || !data) {
      return {
        success: false,
        message: 'No schedules found',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Schedules found',
      data: data,
    };
  }

  /**
   * Update a schedule
   *
   * @param id
   * @param scheduleUpdateData
   * @returns
   */
  async updateSchedule(
    id: string,
    scheduleUpdateData: Schedule,
  ): Promise<{ success: boolean; message: string; data: Schedule }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .update(scheduleUpdateData)
      .eq('id', id)
      .select()
      .returns<Schedule>();

    if (error || !data) {
      return {
        success: false,
        message: 'Not found',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Schedule updated successfully',
      data: data[0],
    };
  }
}
