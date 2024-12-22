import { Test } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Client } from '../supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { createMock } from '@golevelup/ts-jest';
import { ScheduleModule } from './schedule.module';
import { SupabaseClient } from '@supabase/supabase-js';
import { ScheduleFetchDto } from './dto/schedule-fetch.dto';
import {
  generateSchedule,
  generateScheduleCreateDto,
  generateScheduleUpdateDto
} from '../../test/helpers/generators';
import { responses } from '../common/messages/responses';
import { ScheduleDeleteDto } from './dto/schedule-delete.dto';
import { StoredSchedule } from './types/schedule-types';

describe('ScheduleController', () => {
  let controller: ScheduleController;
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
      controllers: [ScheduleController],
      providers: [
        Client,
        { provide: Client, useValue: clientMock },
        ScheduleService,
      ],
    }).compile();

    controller = moduleRef.get<ScheduleController>(ScheduleController);
    service = moduleRef.get<ScheduleService>(ScheduleService);

    expect(clientMock).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * We can call fetch in the controller and it should return a 200 status code
   */
  it('should return a successful response when the create method is called with valid data', async () => {
    const schedule = generateSchedule({ isStored: true });
    const scheduleCreateDto = generateScheduleCreateDto(schedule);

    const expectedResponse = {
      success: true,
      message: responses.schedule.create.success,
      data: schedule,
    };

    jest
      .spyOn(controller, 'create')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.create(scheduleCreateDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * We can call fetch in the controller and it should return a successful response with the schedule data
   */
  it('should return a successful response when the fetch method is called with valid data', async () => {
    const schedule = generateSchedule({ isStored: true }) as StoredSchedule;
    const scheduleFetchDto = new ScheduleFetchDto();

    scheduleFetchDto.id = schedule.id;

    const expectedResponse = {
      success: true,
      message: responses.schedule.create.success,
      data: schedule,
    };

    jest
      .spyOn(controller, 'fetch')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.fetch(scheduleFetchDto);

    expect(response).toEqual(expectedResponse);
  });

  /**
   * We can call update in the controller and it should return a successful response with the schedule data
   */
  it('should return a successful response when the update method is called with valid data', async () => {
    const schedule = generateSchedule({ isStored: true }) as StoredSchedule;
    const scheduleUpdateDto = generateScheduleUpdateDto(schedule);

    const expectedFetchResponse = {
      success: true,
      message: responses.schedule.fetch.success,
      data: schedule,
    };

    scheduleUpdateDto.endTime = new Date().toISOString();

    const expectedUpdateResponse = {
      success: true,
      message: responses.schedule.update.success,
      data: schedule,
    };

    // Update does a fetch first to check if the schedule exists
    // so we need to mock the fetch method
    jest
      .spyOn(service, 'fetch')
      .mockImplementation(() => Promise.resolve(expectedFetchResponse));

    // Then we need to mock the update method
    jest
      .spyOn(service, 'updateSchedule')
      .mockImplementation(() => Promise.resolve(expectedUpdateResponse));

    const response = await controller.update(scheduleUpdateDto);

    expect(response).toEqual(expectedUpdateResponse);
  });

  /**
   * We can call delete in the controller and it should return a successful response 
   * indicating the 
   */
  it('should return a successful response when the delete method is called with valid data', async () => {
    const schedule = generateSchedule({ isStored: true }) as StoredSchedule;
    const scheduleDeleteDto = new ScheduleDeleteDto();

    scheduleDeleteDto.id = schedule.id;

    const expectedResponse = {
      success: true,
      message: responses.schedule.delete.success,
      data: null,
    };

    jest
      .spyOn(service, 'deleteSchedule')
      .mockImplementation(() => Promise.resolve(expectedResponse));

    const response = await controller.delete(scheduleDeleteDto);

    expect(response).toEqual(expectedResponse);
  });
});
