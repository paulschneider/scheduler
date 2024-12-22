import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateSchedule } from './helpers/generators';
import { responses } from '../src/common/messages/responses';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ConfigService } from '@nestjs/config';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let config: ConfigService;
  let apiKey: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          load: [configuration],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    config = await moduleFixture.resolve<ConfigService>(ConfigService);

    apiKey = config.get<string>('apiKey');
  });

  /**
   * Validate usage of API key
   */
  it('Making a POST request without the required API key is forbidden', () => {
    const newSchedule = generateSchedule({ isStored: false });

    return request(app.getHttpServer())
      .post('/schedule')
      .send(newSchedule)
      .catch(res => {
        expect(res.status).toBe(403);
      })
  });

  /**
   * Validate usage of API key
   */
  it('Making a POST request with an incorrect API key is forbidden', () => {
    const newSchedule = generateSchedule({ isStored: false });

    return request(app.getHttpServer())
      .post('/schedule')
      .set('apiKey', 'not-a-valid-key')
      .send(newSchedule)
      .catch(res => {
        expect(res.status).toBe(403);
      })
  });
});
