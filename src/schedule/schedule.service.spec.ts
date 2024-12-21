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

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
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
    const scheduleInsertData = generateSchedule({ isStored: false });

    const expectedResponse = {
      success: true,
      message: 'Schedule created successfully',
      data: {
        ...scheduleInsertData,
        id: faker.string.uuid(),
      },
    };

    jest
      .spyOn(service, 'createSchedule')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.createSchedule(scheduleInsertData);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that the schedule can be fetched by its ID
   */
  it('should return a stored schedule when an ID is provided', async () => {
    const id = faker.string.uuid();

    const expectedResponse = {
      success: true,
      message: 'Schedule found',
      data: {
        ...generateSchedule({ isStored: true }),
        id
      },
    };

    jest
      .spyOn(service, 'fetchSchedule')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchSchedule(id);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * Validate that an error message is returned when a record
   * cannot be found with the provided ID
   *
   */
  it('should return an error when an invalid ID is provided', async () => {
    const expectedResponse = {
      success: false,
      message: 'Not found',
      data: null,
    };

    jest
      .spyOn(service, 'fetchSchedule')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await service.fetchSchedule(faker.string.uuid());

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
   */
  it('should allow a schedule to be updated', async () => {
    const id = faker.string.uuid();

    const existingSchedule = generateSchedule({ isStored: true });

    const updatedSchedule = {
      ...existingSchedule,
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

    const response = await service.updateSchedule(id, updatedSchedule);

    expect(response).toEqual(expectedResponse);
  });
});
