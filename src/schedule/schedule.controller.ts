import { Controller, Body, Query, Get, Post, Put, Delete, Param, ValidationPipe } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiResponse, Schedule } from '../types';
import { ScheduleFetchDto } from './dto/schedule-fetch.dto';
import { ScheduleCreateDto } from './dto/schedule-create.dto';
import { ScheduleUpdateDto } from './dto/schedule-update.dto';
import { ScheduleDeleteDto } from './dto/schedule-delete.dto';

@Controller('schedule')
export class ScheduleController {

  constructor(private readonly scheduleService: ScheduleService) { }

  /**
   * Fetch a schedule by id
   * 
   * @param scheduleFetchDto 
   * @returns 
   */
  @Get(':id')
  async fetch(@Param() params: ScheduleFetchDto): Promise<ApiResponse<Schedule | null>> {
    return this.scheduleService.fetch(params);
  }

  /**
   * Create a schedule
   * 
   * @param scheduleCreateDto 
   * @returns 
   */
  @Post()
  async create(@Body() scheduleCreateDto: ScheduleCreateDto): Promise<ApiResponse<Schedule | null>> {
    return this.scheduleService.createSchedule(scheduleCreateDto);
  }

  /**
   * Update a schedule
   * 
   * @param scheduleUpdateDto 
   * @returns 
   */
  @Put()
  async update(@Body() scheduleUpdateDto: ScheduleUpdateDto): Promise<ApiResponse<Schedule | null>> {
    return this.scheduleService.updateSchedule(scheduleUpdateDto);
  }

  /**
   * Delete a schedule
   * 
   * @param scheduleDeleteDto 
   * @returns 
   */
  @Delete(':id')
  async delete(@Param() params: ScheduleDeleteDto): Promise<ApiResponse<null | Error>> {
    return this.scheduleService.deleteSchedule(params);
  }
}
