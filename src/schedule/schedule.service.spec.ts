import { Test } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { Client } from '../supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { createMock } from '@golevelup/ts-jest';
import { ScheduleModule } from './schedule.module';
import { SupabaseClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import { Schedule, StoredSchedule } from '../types';
import { ScheduleCreateDto } from './dto/schedule-create.dto';
import { ScheduleUpdateDto } from './dto/schedule-update.dto';
import { ScheduleFetchDto } from './dto/schedule-fetch.dto';
import { InternalSystemError } from '../exceptions';
import { validate } from 'class-validator';
import { generateTask } from '../task/task.service.spec';
/**
 * Generate a schedule
 * 
 * @param isStored - Whether the schedule should be fictionally stored in the database
 * @returns A schedule object (Schedule | StoredSchedule)
 */
export const generateSchedule = ({ isStored = false }: { isStored?: boolean }): Schedule | StoredSchedule => {
  const schedule = {
    name: 'Schedule ' + faker.helpers.arrayElement(['1', '2', '3', '4', '5']),
    description: faker.lorem.lines(2),
    start_date: new Date(),
    end_date: new Date(),
  };

  return isStored ?
    { id: faker.string.uuid(), ...schedule } as StoredSchedule
    : schedule as Schedule;
};

/**
 * Generate a schedule create dto
 * 
 * @param schedule - The schedule to generate the dto for
 * @returns A schedule create dto
 */
const generateScheduleCreateDto = (schedule: Schedule): ScheduleCreateDto => {
  const scheduleCreateDto = new ScheduleCreateDto()

  scheduleCreateDto.name = schedule.name
  scheduleCreateDto.description = schedule.description
  scheduleCreateDto.startDate = schedule.start_date.toISOString()
  scheduleCreateDto.endDate = schedule.end_date.toISOString()

  return scheduleCreateDto
};

/**
 * Generate a schedule update dto
 * 
 * @param schedule - The schedule to generate the dto for
 * @returns A schedule update dto
 */
const generateScheduleUpdateDto = (schedule: StoredSchedule): ScheduleUpdateDto => {
  const dto = new ScheduleUpdateDto()

  dto.id = schedule.id
  dto.name = schedule.name
  dto.description = schedule.description
  dto.startDate = schedule.start_date.toISOString()
  dto.endDate = schedule.end_date.toISOString()

  return dto
};

/**
 * Initialise the test suite and mock dependencies, load the environment variables
 * 
 * @returns The schedule service
 */
const initialiseTestSuite = async () => {
  let service: ScheduleService;

  const clientMock = createMock<SupabaseClient>();

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.test.env',
        load: [configuration],
      }),
      ScheduleModule,
    ],
    providers: [
      Client,
      { provide: Client, useValue: clientMock },
      ScheduleService,
    ],
  }).compile();

  service = await moduleRef.resolve<ScheduleService>(ScheduleService);

  expect(clientMock).toBeDefined();

  return service
}

describe('ScheduleService', () => {
  let service: ScheduleService;

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
   * Validate that the schedule can be created
   */
  it('should return a successful API response when creating a schedule', async () => {
    const schedule = generateSchedule({ isStored: false });
    const scheduleCreateDto = generateScheduleCreateDto(schedule);

    const expectedResponse = {
      success: true,
      message: 'Schedule created successfully',
      data: {
        ...schedule,
        id: faker.string.uuid(),
      },
    };

    jest
      .spyOn(service, 'createSchedule')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.createSchedule(scheduleCreateDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that an error is thrown when the schedule cannot be created
   */
  it('should throw an error when the schedule cannot be created', async () => {
    const scheduleCreateDto = generateScheduleCreateDto(generateSchedule({ isStored: false }));

    jest.spyOn(service, 'createSchedule').mockRejectedValue(
      new InternalSystemError("There was a problem creating the schedule")
    );

    expect(async () => {
      await service.createSchedule(scheduleCreateDto)
    }).rejects.toThrow("There was a problem creating the schedule");
  });

  /**
   * Validate that an error is thrown when the schedule cannot be fetched
   */
  it('should throw an error when the schedule cannot be fetched', async () => {
    const scheduleFetchDto = new ScheduleFetchDto();
    scheduleFetchDto.id = faker.string.uuid();

    jest.spyOn(service, 'fetch').mockRejectedValue(
      new InternalSystemError("There was a problem fetching the schedule")
    );

    expect(async () => {
      await service.fetch(scheduleFetchDto)
    }).rejects.toThrow("There was a problem fetching the schedule");
  });

  /**
   * Validate that an error is thrown when the schedule cannot be found
   */
  it('should throw an error when the schedule cannot be fetched', async () => {
    const scheduleFetchDto = new ScheduleFetchDto();
    scheduleFetchDto.id = faker.string.uuid();

    jest.spyOn(service, 'fetch').mockRejectedValue(
      new InternalSystemError("Schedule not found")
    );

    expect(async () => {
      await service.fetch(scheduleFetchDto)
    }).rejects.toThrow("Schedule not found");
  });

  /**
   * Validate that an error message is returned when a record
   * cannot be found with the provided ID
   *
   */
  it('should return an error when an invalid ID is provided', async () => {
    const scheduleFetchDto = new ScheduleFetchDto();
    scheduleFetchDto.id = faker.string.uuid();

    const expectedResponse = {
      success: false,
      message: 'Not found',
      data: null,
    };

    jest
      .spyOn(service, 'fetch')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetch(scheduleFetchDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that a list of schedules can be fetched
   *
   */
  it('should return a list of schedules', async () => {
    const expectedResponse = {
      success: true,
      message: 'Schedules found',
      data: [
        { ...generateSchedule({ isStored: true }), id: faker.string.uuid() },
        { ...generateSchedule({ isStored: true }), id: faker.string.uuid() },
        { ...generateSchedule({ isStored: true }), id: faker.string.uuid() },
      ],
    };

    jest
      .spyOn(service, 'fetchAll')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchAll();

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that an error message is returned when no schedules are found
   *
   */
  it('should return an error when no schedules are found', async () => {
    const expectedResponse = {
      success: false,
      message: 'No schedules found',
      data: [],
    };

    jest
      .spyOn(service, 'fetchAll')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchAll();

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that a schedule can be updated
   * 
   */
  it('should allow a schedule to be updated', async () => {
    const schedule = generateSchedule({ isStored: true });
    const scheduleUpdateDto = generateScheduleUpdateDto(schedule);

    const updatedSchedule = {
      ...schedule,
      name: 'Updated Schedule name',
    };

    const expectedResponse = {
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule,
    };

    jest
      .spyOn(service, 'updateSchedule')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.updateSchedule(scheduleUpdateDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that all tasks associated with a schedule can be fetched
   * 
   */
  it('should return all tasks associated with a schedule', async () => {
    const schedule = generateSchedule({ isStored: true });
    const scheduleFetchDto = new ScheduleFetchDto();

    scheduleFetchDto.id = schedule.id;

    schedule.tasks = [
      generateTask({ isStored: true }),
      generateTask({ isStored: true }),
      generateTask({ isStored: true }),
    ];

    const expectedResponse = {
      success: true,
      message: 'Schedule updated successfully',
      data: schedule,
    };

    jest
      .spyOn(service, 'fetch')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetch(scheduleFetchDto);

    expect(response).toEqual(expectedResponse);
  });
});

describe('ScheduleService Validation', () => {
  /**
   * Test that the validation fails when the dto is invalid (name empty/missing) - create
   */
  it('should throw an error when a validation error occurs [name missing]', async () => {
    const schedule = generateSchedule({ isStored: false });
    const scheduleDto = generateScheduleCreateDto(schedule);

    // @ts-ignore
    scheduleDto.name = ""

    validate(scheduleDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'name should not be empty'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (description empty/missing) - create
   */
  it('should throw an error when a validation error occurs [description missing]', async () => {
    const schedule = generateSchedule({ isStored: false });
    const scheduleDto = generateScheduleCreateDto(schedule);

    // @ts-ignore
    scheduleDto.description = ""

    validate(scheduleDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'description should not be empty'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (startDate empty/missing)
   */
  it('should throw an error when a validation error occurs [startDate missing]', async () => {
    const schedule = generateSchedule({ isStored: false });
    const scheduleDto = generateScheduleCreateDto(schedule);

    // @ts-ignore
    scheduleDto.startDate = ""

    validate(scheduleDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'startDate should not be empty'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (endDate empty/missing)
   */
  it('should throw an error when a validation error occurs [endDate missing]', async () => {
    const schedule = generateSchedule({ isStored: false });
    const scheduleDto = generateScheduleCreateDto(schedule);

    // @ts-ignore
    scheduleDto.endDate = ""

    validate(scheduleDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isNotEmpty: 'endDate should not be empty'
      });
    });
  });

  /**
   * Test that the validation fails when the dto is invalid (ID empty/missing)
   */
  it('should throw an error when a validation error occurs [ID missing] for update', async () => {
    const schedule = generateSchedule({ isStored: true });
    const fetchDto = new ScheduleFetchDto();

    // @ts-ignore
    fetchDto.id = "<not-a-uuid>"

    validate(fetchDto).then(errors => {
      expect(errors.length).toEqual(1);

      expect(errors[0].constraints).toEqual({
        isUuid: 'id must be a UUID'
      });
    });
  });
});
