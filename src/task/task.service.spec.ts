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
import { validate } from 'class-validator';
/**
 * Generate a task
 * 
 * @param isStored - Whether the task should be fictionally stored in the database
 * @returns A task object (Task | StoredTask)
 */
const generateTask = ({ isStored = false }: { isStored?: boolean }): Task | StoredTask => {
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
const generateTaskCreateDto = (task: Task | StoredTask): TaskCreateDto => {
  const taskCreateDto = new TaskCreateDto()

  taskCreateDto.accountId = task.account_id
  taskCreateDto.scheduleId = task.schedule_id
  taskCreateDto.startTime = task.start_time.toISOString()
  taskCreateDto.duration = task.duration
  taskCreateDto.type = task.type as TaskType

  return taskCreateDto
};

/**
 * Test the TaskService
 */
describe('TaskService', () => {
  let service: TaskService;

  /**
   * Setup the service before each test
   */
  beforeEach(async () => {
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
   * Test that the validation fails when the dto is invalid (missing required fields [accountId])
   */
  it('should throw an error when an error occurs [accountId]', async () => {
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
  it('should throw an error when an error occurs [scheduleId empty]', async () => {
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
  it('should throw an error when an error occurs [startTime empty]', async () => {
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
  it('should throw an error when an error occurs [duration empty]', async () => {
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
  it('should throw an error when an error occurs [duration not a number]', async () => {
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
   * Test that the validation fails when the dto is invalid (missing required fields [duration no number])
   */
  it.only('should throw an error when an error occurs [incorrect task type]', async () => {
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
});
