import { Controller, Post, Body, Get, Query, Put, Delete, Param } from '@nestjs/common';
import { TaskService } from './task.service';
import { StoredTask } from './types/task-types';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskFetchDto } from './dto/task-fetch.dto';
import { ApiResponse } from 'src/types';
import { TaskUpdateDto } from './dto/task-update.dto';
import { TaskDeleteDto } from './dto/task-delete.dto';
import { TaskFetchAllForScheduleDto } from './dto/task-fetchAllForSchedule.dto';

@Controller('task')
export class TaskController {

  constructor(private readonly taskService: TaskService) { }

  /**
   * Create a new task
   *
   * @param taskCreateDto
   * @returns
   */
  @Post()
  async create(@Body() taskCreateDto: TaskCreateDto): Promise<ApiResponse<StoredTask | Error>> {
    return this.taskService.createTask(taskCreateDto);
  }

  /**
   * Fetch a task
   *
   * @param taskFetchDto
   * @returns
   */
  @Get(':id')
  async fetch(@Param() params: TaskFetchDto): Promise<ApiResponse<StoredTask | Error>> {
    return this.taskService.fetchTask(params.id);
  }

  /**
   * Fetch all tasks
   * 
   * @returns 
   */
  @Get()
  async fetchAll(@Param() params: TaskFetchAllForScheduleDto): Promise<ApiResponse<StoredTask[]>> {
    return this.taskService.fetchAll(params.scheduleId);
  }

  /**
   * Update a task
   *
   * @param taskUpdateDto
   * @returns
   */
  @Put()
  async update(@Body() taskUpdateDto: TaskUpdateDto): Promise<ApiResponse<StoredTask | Error>> {
    return this.taskService.updateTask(taskUpdateDto);
  }

  /**
   * Delete a task
   *
   * @param taskDeleteDto
   * @returns
   */
  @Delete(':id')
  async delete(@Param() params: TaskDeleteDto): Promise<ApiResponse<StoredTask | Error>> {
    return this.taskService.deleteTask(params.id);
  }
}
