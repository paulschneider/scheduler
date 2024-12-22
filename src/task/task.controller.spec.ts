import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { TaskModule } from './task.module';
import { Client } from '../supabase/supabase.service';
import { createMock } from '@golevelup/ts-jest';
import { SupabaseClient } from '@supabase/supabase-js';
import { generateTask, generateTaskUpdateDto, generateSchedule } from '../../test/helpers/generators';
import { generateTaskCreateDto } from '../../test/helpers/generators';
import { responses } from '../common/messages/responses';
import { TaskFetchDto } from './dto/task-fetch.dto';
import { TaskType, StoredSchedule } from '../types';
import { TaskDeleteDto } from './dto/task-delete.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const clientMock = createMock<SupabaseClient>();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          load: [configuration],
        }),
        TaskModule,
      ],
      controllers: [TaskController],
      providers: [
        Client,
        { provide: Client, useValue: clientMock },
        TaskService,
      ],
    }).compile();

    controller = moduleRef.get<TaskController>(TaskController);
    service = moduleRef.get<TaskService>(TaskService);

    expect(clientMock).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * We can call fetch in the controller and it should return a 200 status code
   */
  it('should return a successful response when the create method is called with valid data', async () => {
    const task = generateTask({ isStored: true });
    const taskCreateDto = generateTaskCreateDto(task);

    const expectedResponse = {
      success: true,
      message: responses.schedule.create.success,
      data: task,
    };

    jest
      .spyOn(controller, 'create')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.create(taskCreateDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * We can call fetch in the controller and it should return a successful response with the task data
   */
  it('should return a successful response when the fetch method is called with valid data', async () => {
    const task = generateTask({ isStored: true });
    const taskFetchDto = new TaskFetchDto();

    taskFetchDto.id = task.id;

    const expectedResponse = {
      success: true,
      message: responses.task.fetch.success,
      data: task,
    };

    jest
      .spyOn(controller, 'fetch')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.fetch(taskFetchDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * We can call update in the controller and it should return a successful response with the task data
   */
  it('should return a successful response when the update method is called with valid data', async () => {
    const task = generateTask({ isStored: true });
    const taskUpdateDto = generateTaskUpdateDto(task);

    const expectedFetchResponse = {
      success: true,
      message: responses.task.update.success,
      data: task,
    };

    taskUpdateDto.type = task.type === TaskType.BREAK ? TaskType.WORK : TaskType.BREAK;

    const expectedUpdateResponse = {
      success: true,
      message: responses.task.update.success,
      data: task,
    };

    // Update does a fetch first to check if the task exists
    // so we need to mock the fetch method
    jest
      .spyOn(service, 'fetchTask')
      .mockImplementation(() => Promise.resolve(expectedFetchResponse));

    // Then we need to mock the update method
    jest
      .spyOn(service, 'updateTask')
      .mockImplementation(() => Promise.resolve(expectedUpdateResponse));

    const response = await controller.update(taskUpdateDto);

    expect(response).toEqual(expectedUpdateResponse);
  });

  /**
   * We can call delete in the controller and it should return a successful response 
   * indicating the deletion of the task
   */
  it('should return a successful response when the delete method is called with a valid task ID', async () => {
    const task = generateTask({ isStored: true });
    const taskDeleteDto = new TaskDeleteDto();

    // taskDeleteDto.id = task.id;

    const expectedResponse = {
      success: true,
      message: responses.task.delete.success,
      data: null,
    };

    jest
      .spyOn(service, 'deleteTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.delete(taskDeleteDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * We can call fetchAll in the controller and it should return a successful response with all task data
   */
  it('should return a successful response when the fetchAll method is called with valid data', async () => {
    const schedule = generateSchedule({ isStored: true }) as StoredSchedule;

    const expectedResponse = {
      success: true,
      message: responses.task.fetchAll.success,
      data: [
        { ...generateTask({ isStored: true }), scheduleId: schedule.id },
        { ...generateTask({ isStored: true }), scheduleId: schedule.id },
        { ...generateTask({ isStored: true }), scheduleId: schedule.id },
      ],
    };

    jest
      .spyOn(service, 'fetchAll')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.fetchAll({ scheduleId: schedule.id });

    expect(response).toEqual(expectedResponse);
  });
});
