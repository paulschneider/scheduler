import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { createMock } from '@golevelup/ts-jest';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { TaskModule } from './task.module';
import { faker } from '@faker-js/faker';
import { Client } from '../supabase/supabase.service';
import { TaskFetchDto } from './dto/task-fetch.dto';
import { validate } from 'class-validator';
import { InternalSystemError, ResourceNotFound } from '../exceptions';
import {
  generateSchedule,
  generateTaskCreatePayload,
  generateStoredTask,
  generateTaskCreateDto,
  generateTaskUpdateDto
} from '../../test/helpers/generators';
import { StoredSchedule } from 'src/types';
import { responses } from '../common/messages/responses';
/**
 * Initialise the test suite and mock dependencies, load the environment variables
 * 
 * @returns The schedule service
 */
const initialiseTestSuite = async () => {
  let service: TaskService;

  const clientMock = createMock<SupabaseClient>();

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.test.env',
        load: [configuration],
      }),
      TaskModule,
    ],
    providers: [
      Client,
      { provide: Client, useValue: clientMock },
      TaskService
    ],
  }).compile();

  service = module.get<TaskService>(TaskService);

  expect(clientMock).toBeDefined();

  return service
}

/**
 * Test the TaskService
 */
describe('TaskService', () => {
  let service: TaskService;

  /**
   * Setup the service before each test
   */
  beforeEach(async () => {
    service = await initialiseTestSuite()
  });

  /**
   * Validate that the service is defined
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Test that the service can create a task
   */
  it('should return a successful API response when creating a task', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);
    const taskDto = generateTaskCreateDto(payload);

    const expectedResponse = {
      success: true,
      message: responses.task.create.success,
      data: storedTask,
    };

    jest
      .spyOn(service, 'createTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.createTask(taskDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the createTask method throws an error when an error occurs
   */
  it('should throw an error when an error occurs [createTask]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    const expectedResponse = {
      success: false,
      message: responses.task.create.error,
      data: null,
    };

    jest.spyOn(service, 'createTask').mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.createTask(taskDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the service can update a task
   */
  it('should return a successful API response when updating a task', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);
    const taskDto = generateTaskUpdateDto(storedTask);

    storedTask.duration = 100

    const expectedResponse = {
      success: true,
      message: responses.task.update.success,
      data: storedTask
    };

    jest
      .spyOn(service, 'updateTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.updateTask(taskDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the updateTask method throws an error when an error occurs
   */
  it('should handle an error when an error occurs [updateTask]', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);
    const taskDto = generateTaskUpdateDto(storedTask);

    jest.spyOn(service, 'updateTask').mockRejectedValue(() => {
      throw new InternalSystemError(responses.task.update.error)
    });

    expect(async () => {
      await service.updateTask(taskDto);
    }).rejects.toThrow(responses.task.update.error);
  });

  /**
   * Test that we can retrieve a task by its ID
   * 
   */
  it('should return a successful API response when retrieving a task by its ID', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);

    const expectedResponse = {
      success: true,
      message: responses.task.fetch.success,
      data: storedTask
    };

    jest
      .spyOn(service, 'fetchTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchTask(storedTask.id);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the fetchTask method throws an error the task is not found
   */
  it('should handle an error when an error occurs [fetchTask]', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);

    jest.spyOn(service, 'fetchTask').mockRejectedValue(() => {
      throw new ResourceNotFound(responses.task.fetch.notFound)
    });

    expect(async () => {
      await service.fetchTask(storedTask.id);
    }).rejects.toThrow(responses.task.fetch.notFound);
  });

  /**
   * Test that we can delete a task
   */
  it('should return a successful API response when deleting a task', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);

    const expectedResponse = {
      success: true,
      message: responses.task.delete.success,
      data: null
    };

    jest
      .spyOn(service, 'deleteTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.deleteTask(storedTask.id);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the deleteTask method throws an error when the task is not found
   */
  it('should handle an error during task deletion [task not found]', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);

    jest.spyOn(service, 'fetchTask').mockRejectedValue(() => {
      throw new ResourceNotFound(responses.task.fetch.notFound)
    });

    expect(async () => {
      await service.deleteTask(storedTask.id);
    }).rejects.toThrow(responses.task.fetch.notFound);
  });

  /**
   * Test that the deleteTask method throws an error when there is a problem deleting the task
   */
  it('should handle an error during task deletion [problem deleting task]', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);

    jest.spyOn(service, 'deleteTask').mockRejectedValue(() => {
      throw new InternalSystemError(responses.task.delete.error)
    });

    expect(async () => {
      await service.deleteTask(storedTask.id);
    }).rejects.toThrow(responses.task.delete.error);
  });

  /**
   * Test that we can fetch all tasks for a given schedule
   */
  it('should return a successful API response when fetching all tasks for a given schedule', async () => {
    const schedule = generateSchedule({ isStored: true }) as StoredSchedule;

    const payload1 = generateTaskCreatePayload(schedule);
    const storedTask1 = generateStoredTask(payload1);

    const payload2 = generateTaskCreatePayload(schedule);
    const storedTask2 = generateStoredTask(payload2);

    const payload3 = generateTaskCreatePayload(schedule);
    const storedTask3 = generateStoredTask(payload3);

    const tasks = [storedTask1, storedTask2, storedTask3]

    const expectedResponse = {
      success: true,
      message: responses.task.fetchAll.success,
      data: tasks
    };

    jest
      .spyOn(service, 'fetchAll')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchAll();

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the fetchAll method throws an error when there is a problem fetching the tasks
   */
  it('should handle an error during task fetching [problem fetching tasks]', async () => {
    const schedule = generateSchedule({ isStored: true }) as StoredSchedule;

    jest.spyOn(service, 'fetchAll').mockRejectedValue(() => {
      throw new InternalSystemError(responses.task.fetchAll.error);
    });

    expect(async () => {
      await service.fetchAll();
    }).rejects.toThrow(responses.task.fetchAll.error);
  });
});

describe('TaskService Validation', () => {
  /**
   * Test that the validation fails when the dto is invalid (missing required fields [accountId])
   */
  it('should throw an error when a validation error occurs [accountId]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    // @ts-ignore
    taskDto.accountId = null

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'accountId should not be empty',
        isNumber: 'accountId must be a number conforming to the specified constraints'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (missing required fields [scheduleId empty])
   */
  it('should throw an error when a validation error occurs [scheduleId empty]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    // @ts-ignore
    taskDto.scheduleId = null

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isUuid: 'scheduleId must be a UUID',
        isNotEmpty: 'scheduleId should not be empty'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (missing required fields [startTime empty])
   */
  it('should throw an error when a validation error occurs [startTime empty]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    taskDto.startTime = ""

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'startTime should not be empty',
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (missing required fields [duration empty])
   */
  it('should throw an error when a validation error occurs [duration empty]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    // @ts-ignore
    taskDto.duration = ""

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNumber: 'duration must be a number conforming to the specified constraints',
        isNotEmpty: 'duration should not be empty'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (missing required fields [duration no number])
   */
  it('should throw an error when a validation error occurs [duration not a number]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    // @ts-ignore
    taskDto.duration = "not a number"

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNumber: 'duration must be a number conforming to the specified constraints'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (incorrect task type])
   */
  it('should throw an error when a validation error occurs [incorrect task type]', async () => {
    const payload = generateTaskCreatePayload();
    const taskDto = generateTaskCreateDto(payload);

    // @ts-ignore
    taskDto.type = "fun time holiday"

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isEnum: 'type must be one of the following values: break, work'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (ID empty/missing/non-UUID) - task fetch
   */
  it('should throw an error when a validation error occurs [ID not valid UUID] for fetch', async () => {

    const fetchDto = new TaskFetchDto();

    // @ts-ignore
    fetchDto.id = "<not-a-uuid>"

    validate(fetchDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isUuid: 'id must be a UUID'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (ID empty/missing/non-UUID) - task update
   * 
   */
  it('should throw an error when a validation error occurs [ID not valid UUID] for task update', async () => {
    const payload = generateTaskCreatePayload();
    const storedTask = generateStoredTask(payload);
    const updateDto = generateTaskUpdateDto(storedTask);

    // @ts-ignore
    updateDto.id = "<not-a-uuid>"

    validate(updateDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isUuid: 'id must be a UUID'
      });
    });
  });
}); 
