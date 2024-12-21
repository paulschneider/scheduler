import { Test } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Client } from '../supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { createMock } from '@golevelup/ts-jest';
import { ScheduleModule } from './schedule.module';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ScheduleController', () => {
  let controller: ScheduleController;

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

    expect(clientMock).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
