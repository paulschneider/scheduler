import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateTask } from './helpers/generators';
import { responses } from '../src/common/messages/responses';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ConfigService } from '@nestjs/config';

describe('Task (e2e)', () => {
  let app: INestApplication;
  let config: ConfigService;
  let apiKey: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          envFilePath: '.env',
          load: [configuration],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    config = await moduleFixture.resolve<ConfigService>(ConfigService);

    apiKey = config.get<string>('apiKey');
  });

  it('Can make a GET request to fetch all tasks', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${apiKey}`)
      .expect(200);
  });
});
