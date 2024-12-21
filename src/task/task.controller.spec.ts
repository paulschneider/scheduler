import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { TaskModule } from './task.module';
import { Client } from '../supabase/supabase.service';
import { createMock } from '@golevelup/ts-jest';
import { SupabaseClient } from '@supabase/supabase-js';
describe('TaskController', () => {
  let controller: TaskController;

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
      controllers: [TaskController],
      providers: [
        Client,
        { provide: Client, useValue: clientMock },
        TaskService
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
