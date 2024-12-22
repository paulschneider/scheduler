import { Injectable } from '@nestjs/common';
import { Client } from '../supabase/supabase.service';
import { Schedule } from '../types';
import { ScheduleCreateDto } from './dto/schedule-create.dto';
import { ScheduleUpdateDto } from './dto/schedule-update.dto';
import { ResourceNotFound, InternalSystemError } from '../exceptions';
import { ScheduleFetchDto } from './dto/schedule-fetch.dto';

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
      .insert(scheduleInsertData)
      .select()
      .returns<Schedule>();

    if (error) {
      throw new InternalSystemError("There was a problem creating the schedule");
    }

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
  async fetch(
    fetchDto: ScheduleFetchDto,
  ): Promise<{ success: boolean; message: string; data: Schedule | null }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .select()
      .eq('id', fetchDto.id)
      .returns<Schedule>();

    if (error) {
      throw new InternalSystemError("There was a problem fetching the schedule");
    }

    if (!data) {
      throw new ResourceNotFound("Schedule not found");
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

    if (error) {
      throw new InternalSystemError("There was a problem fetching all schedules");
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
  async updateSchedule(scheduleUpdateData: ScheduleUpdateDto): Promise<{ success: boolean; message: string; data: Schedule }> {
    const { data, error } = await Client.connection
      .from(this.tableName)
      .update(scheduleUpdateData)
      .eq('id', scheduleUpdateData.id)
      .select()
      .returns<Schedule>();

    if (error) {
      throw new ResourceNotFound("Schedule not found");
    }

    return {
      success: true,
      message: 'Schedule updated successfully',
      data: data[0],
    };
  }
}
