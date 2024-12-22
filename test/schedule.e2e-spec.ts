import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateSchedule } from './helpers/generators';
import { responses } from '../src/common/messages/responses';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ConfigService } from '@nestjs/config';

describe('Schedule (e2e)', () => {
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
   * Create a schedule with a POST request
   */
  it('Can make a POST request to create a schedule', () => {
    const newSchedule = generateSchedule({ isStored: false });

    return request(app.getHttpServer())
      .post('/schedule')
      .set('apiKey', apiKey)
      .send(newSchedule)
      .expect(201)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({ success: true })));
  });

  /**
   * We can retrieve a schedule from the API with a GET request
   */
  it('Can make a GET to retrieve a schedule', async () => {
    // first create a schedule we can reliably retrieve
    const newSchedule = generateSchedule({ isStored: false });

    const res = await request(app.getHttpServer())
      .post('/schedule')
      .set('apiKey', apiKey)
      .send(newSchedule)

    expect(res.status).toEqual(201)

    const response = res.body

    return request(app.getHttpServer())
      .get('/schedule/' + response.data.id)
      .set('apiKey', apiKey)
      .expect(200)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        data: response.data // the schedule returned by the create call
      })))
  });

  /**
   * We can update an schedule with a PUT request
   */
  it('Can make a PUT request to update a schedule', async () => {
    // first create a schedule we can reliably update
    const newSchedule = generateSchedule({ isStored: false });
    newSchedule.accountId = 1

    const res = await request(app.getHttpServer())
      .post('/schedule')
      .set('apiKey', apiKey)
      .send(newSchedule)

    expect(res.status).toEqual(201)
    expect(res.body.data.account_id).toEqual(1)

    const data = res.body.data

    const updatedSchedule = {
      ...newSchedule,
      id: data.id,
      agentId: data.agent_id,
      startTime: data.start_time,
      endTime: data.end_time,
      accountId: 2 // this is the value we are changing to something different
    }

    const updateResponse = await request(app.getHttpServer())
      .put('/schedule')
      .set('apiKey', apiKey)
      .send(updatedSchedule)
      .expect(200)

    expect(updateResponse.body).toEqual(expect.objectContaining({
      success: true,
      message: responses.schedule.update.success,
      data: {
        id: updatedSchedule.id,
        account_id: 2, // validate that we got the updated account_id
        agent_id: updatedSchedule.agentId,
        start_time: updatedSchedule.startTime,
        end_time: updatedSchedule.endTime,
        created_at: data.created_at,
        tasks: data.tasks
      }
    }))
  });

  /**
 * We can delete an schedule with a DELETE request
 */
  it('Can make a DELETE request to delete a schedule', async () => {
    // first create a schedule we can reliably update
    const newSchedule = generateSchedule({ isStored: false });

    const res = await request(app.getHttpServer())
      .post('/schedule')
      .set('apiKey', apiKey)
      .send(newSchedule)

    expect(res.status).toEqual(201)

    const response = await request(app.getHttpServer())
      .delete('/schedule/' + res.body.data.id)
      .set('apiKey', apiKey)
      .send()
      .expect(200)

    expect(response.body).toEqual(expect.objectContaining({
      success: true,
      message: responses.schedule.delete.success,
      data: null
    }))
  });
});
