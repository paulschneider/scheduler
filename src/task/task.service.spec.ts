import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { createMock } from '@golevelup/ts-jest';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { TaskModule } from './task.module';
import { faker } from '@faker-js/faker';
import { generateSchedule } from '../schedule/schedule.service.spec';
import { Task, StoredTask, TaskType } from '../types';
import { Client } from '../supabase/supabase.service';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { TaskFetchDto } from './dto/task-fetch.dto';
import { validate } from 'class-validator';
import { InternalSystemError, ResourceNotFound } from '../exceptions';

/**
 * Generate a task
 * 
 * @param isStored - Whether the task should be fictionally stored in the database
 * @returns A task object (Task | StoredTask)
 */
export const generateTask = ({ isStored = false }: { isStored?: boolean }): Task | StoredTask => {
  const schedule = generateSchedule({ isStored: true });

  const task = {
    account_id: faker.string.uuid(),
    schedule_id: schedule.id,
    start_time: new Date(),
    duration: faker.number.int({ min: 1, max: 180 }),
    type: faker.helpers.arrayElement(["work", "break"]),
  };

  return isStored ?
    { id: faker.string.uuid(), ...task } as StoredTask
    : task as Task;
};

/**
 * Generate a task create dto
 * 
 * @param task - The task to generate the dto for
 * @returns A task create dto
 */
const generateTaskCreateDto = (task: Task): TaskCreateDto => {
  const taskCreateDto = new TaskCreateDto()

  taskCreateDto.accountId = task.account_id
  taskCreateDto.scheduleId = task.schedule_id
  taskCreateDto.startTime = task.start_time.toISOString()
  taskCreateDto.duration = task.duration
  taskCreateDto.type = task.type as TaskType

  return taskCreateDto
};

/**
 * Generate a task update dto
 * 
 * @param task - The task to generate the dto for
 * @returns A task update dto
 */
const generateTaskUpdateDto = (task: StoredTask): TaskUpdateDto => {
  const taskUpdateDto = new TaskUpdateDto()

  taskUpdateDto.id = task.id
  taskUpdateDto.accountId = task.account_id
  taskUpdateDto.scheduleId = task.schedule_id
  taskUpdateDto.startTime = task.start_time.toISOString()
  taskUpdateDto.duration = task.duration
  taskUpdateDto.type = task.type as TaskType

  return taskUpdateDto
};

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
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

    const expectedResponse = {
      success: true,
      message: 'Task created successfully',
      data: {
        ...task,
        id: faker.string.uuid(),
      },
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
  it('should throw an error when an error occurs', async () => {
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

    const expectedResponse = {
      success: false,
      message: 'Something went wrong',
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
    const task = generateTask({ isStored: true });
    const taskDto = generateTaskUpdateDto(task);

    task.duration = 100

    const expectedResponse = {
      success: true,
      message: 'Task updated successfully',
      data: task
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
  it('should handle an error when an error occurs', async () => {
    const task = generateTask({ isStored: true });
    const taskDto = generateTaskUpdateDto(task);

    jest.spyOn(service, 'updateTask').mockRejectedValue(() => {
      throw new InternalSystemError("There was a problem updating the task")
    });

    expect(async () => {
      await service.updateTask(taskDto);
    }).rejects.toThrow("There was a problem updating the task");
  });

  /**
   * Test that we can retrieve a task by its ID
   * 
   */
  it('should return a successful API response when retrieving a task by its ID', async () => {
    const task = generateTask({ isStored: true });

    const expectedResponse = {
      success: true,
      message: 'Task found',
      data: task
    };

    jest
      .spyOn(service, 'fetchTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchTask(task.id);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the fetchTask method throws an error the task is not found
   */
  it('should handle an error when an error occurs', async () => {
    const task = generateTask({ isStored: true });

    jest.spyOn(service, 'fetchTask').mockRejectedValue(() => {
      throw new ResourceNotFound("Task not found")
    });

    expect(async () => {
      await service.fetchTask(task.id);
    }).rejects.toThrow("Task not found");
  });

  /**
   * Test that we can delete a task
   */
  it('should return a successful API response when deleting a task', async () => {
    const task = generateTask({ isStored: true });

    const expectedResponse = {
      success: true,
      message: 'Task deleted successfully',
      data: null
    };

    jest
      .spyOn(service, 'deleteTask')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.deleteTask(task.id);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the deleteTask method throws an error when the task is not found
   */
  it('should handle an error during task deletion [task not found]', async () => {
    const task = generateTask({ isStored: true });

    jest.spyOn(service, 'fetchTask').mockRejectedValue(() => {
      throw new ResourceNotFound("Task not found")
    });

    expect(async () => {
      await service.deleteTask(task.id);
    }).rejects.toThrow("Task not found");
  });

  /**
   * Test that the deleteTask method throws an error when there is a problem deleting the task
   */
  it('should handle an error during task deletion [problem deleting task]', async () => {
    const task = generateTask({ isStored: true });

    jest.spyOn(service, 'deleteTask').mockRejectedValue(() => {
      throw new InternalSystemError("There was a problem deleting the task")
    });

    expect(async () => {
      await service.deleteTask(task.id);
    }).rejects.toThrow("There was a problem deleting the task");
  });

  /**
   * Test that we can fetch all tasks for a given schedule
   */
  it('should return a successful API response when fetching all tasks for a given schedule', async () => {
    const schedule = generateSchedule({ isStored: true });

    const tasks = [
      { ...generateTask({ isStored: true }), schedule_id: schedule.id },
      { ...generateTask({ isStored: true }), schedule_id: schedule.id },
      { ...generateTask({ isStored: true }), schedule_id: schedule.id }
    ]

    const expectedResponse = {
      success: true,
      message: 'Tasks found',
      data: tasks
    };

    jest
      .spyOn(service, 'fetchAll')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchAll(schedule.id);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Test that the fetchAll method throws an error when there is a problem fetching the tasks
   */
  it('should handle an error during task fetching [problem fetching tasks]', async () => {
    const schedule = generateSchedule({ isStored: true });

    jest.spyOn(service, 'fetchAll').mockRejectedValue(() => {
      throw new InternalSystemError("There was a problem fetching the tasks");
    });

    expect(async () => {
      await service.fetchAll(schedule.id);
    }).rejects.toThrow("There was a problem fetching the tasks");
  });

  /**
   * Test that the fetchAll method throws an error when there are no tasks found
   */
  it('should handle an error during task fetching [no tasks found]', async () => {
    const schedule = generateSchedule({ isStored: true });
  });
});

describe('TaskService Validation', () => {
  /**
   * Test that the validation fails when the dto is invalid (missing required fields [accountId])
   */
  it('should throw an error when a validation error occurs [accountId]', async () => {
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

    taskDto.accountId = ""

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'accountId should not be empty',
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (missing required fields [scheduleId empty])
   */
  it('should throw an error when a validation error occurs [scheduleId empty]', async () => {
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

    taskDto.scheduleId = ""

    validate(taskDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'scheduleId should not be empty',
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (missing required fields [startTime empty])
   */
  it('should throw an error when a validation error occurs [startTime empty]', async () => {
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

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
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

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
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

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
    const task = generateTask({ isStored: false });
    const taskDto = generateTaskCreateDto(task);

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
    const schedule = generateSchedule({ isStored: true });
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
    const task = generateTask({ isStored: true });
    const updateDto = generateTaskUpdateDto(task);

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
