import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateSchedule } from './helpers/generators';
import { responses } from '../src/common/messages/responses';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ConfigService } from '@nestjs/config';
import { createStoredTask } from './task.e2e-spec';
import { StoredSchedule } from '../src/types';

/**
 * Create a stored schedule (helper function)
 * 
 * @param app 
 * @param apiKey 
 * @returns 
 */
export const createStoredSchedule = async (app: INestApplication, apiKey: string): Promise<StoredSchedule> => {
  const newSchedule = generateSchedule({ isStored: false });

  const res = await request(app.getHttpServer())
    .post('/schedule')
    .set('apiKey', apiKey)
    .send(newSchedule)

  expect(res.status).toEqual(201)

  return res.body.data
}

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
    const schedule = await createStoredSchedule(app, apiKey)

    return request(app.getHttpServer())
      .get('/schedule/' + schedule.id)
      .set('apiKey', apiKey)
      .expect(200)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        data: schedule // the schedule returned by the create call
      })))
  });

  /**
   * We can retrieve a schedule from the API with a GET request
   */
  it('Can make a GET to retrieve a schedule along with all associated tasks', async () => {
    // first create a schedule we can reliably retrieve
    const schedule = await createStoredSchedule(app, apiKey)

    const task1 = await createStoredTask(app, apiKey, schedule)
    const task2 = await createStoredTask(app, apiKey, schedule)
    const task3 = await createStoredTask(app, apiKey, schedule)

    return request(app.getHttpServer())
      .get('/schedule/' + schedule.id)
      .set('apiKey', apiKey)
      .expect(200)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        success: true,
        message: responses.schedule.fetch.success,
        data: {
          ...schedule,
          tasks: [task1, task2, task3]
        }
      })))
  });

  /**
   * We can update an schedule with a PUT request
   */
  it('Can make a PUT request to update a schedule', async () => {
    // first create a schedule we can reliably retrieve
    const schedule = await createStoredSchedule(app, apiKey)

    expect(schedule.account_id).not.toEqual(999)

    const updatedSchedule = {
      id: schedule.id,
      agentId: schedule.agent_id,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      accountId: 999 // this is the value we are changing to something different
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
        account_id: 999, // validate that we got the updated account_id
        agent_id: updatedSchedule.agentId,
        start_time: updatedSchedule.startTime,
        end_time: updatedSchedule.endTime,
        created_at: schedule.created_at,
        tasks: schedule.tasks
      }
    }))
  });

  /**
 * We can delete an schedule with a DELETE request
 */
  it('Can make a DELETE request to delete a schedule', async () => {
    // first create a schedule we can reliably retrieve
    const schedule = await createStoredSchedule(app, apiKey)

    const response = await request(app.getHttpServer())
      .delete('/schedule/' + schedule.id)
      .set('apiKey', apiKey)
      .send()
      .expect(200)

    expect(response.body).toEqual(expect.objectContaining({
      success: true,
      message: responses.schedule.delete.success,
      data: null
    }))
  });

  /**
   * We fail to retrieve a schedule from the API with a GET request if the schedule ID is not valid
   */
  it('An error message is returned if the schedule ID is not valid', async () => {
    return request(app.getHttpServer())
      .get('/schedule/<invalid-id>')
      .set('apiKey', apiKey)
      .expect(400)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        message: ['id must be a UUID']
      })))
  });
});
