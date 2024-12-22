import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateSchedule, generateTask } from './helpers/generators';
import { responses } from '../src/common/messages/responses';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ConfigService } from '@nestjs/config';
import { StoredSchedule } from '../src/types';
import { StoredTask, TaskType } from '../src/types';
import { createStoredSchedule } from './schedule.e2e-spec';
/**
 * 
 * @param app 
 * @param apiKey 
 * @param schedule 
 * @returns 
 */
export const createStoredTask = async (app: INestApplication, apiKey: string, schedule: StoredSchedule): Promise<StoredTask> => {
  // create a task to store and later retrieve
  const newTask = generateTask({ isStored: true });
  newTask.scheduleId = schedule.id;

  const res = await request(app.getHttpServer())
    .post('/task')
    .set('apiKey', apiKey)
    .send(newTask)

  // make sure the task was created successfully
  expect(res.status).toEqual(201)

  return res.body.data
}

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

  it('Can make a POST request to create a new task', async () => {
    const schedule = await createStoredSchedule(app, apiKey)

    const newTask = generateTask({ isStored: false });
    newTask.scheduleId = schedule.id;

    const taskRes = await request(app.getHttpServer())
      .post('/task')
      .set('apiKey', apiKey)
      .send(newTask)

    expect(taskRes.status).toEqual(201)
    expect(taskRes.body.data.schedule_id).toEqual(schedule.id)
  });

  /**
   * We can retrieve a task from the API with a GET request
   */
  it('Can make a GET to retrieve a task', async () => {
    // first create a schedule we can reliably retrieve
    const schedule = await createStoredSchedule(app, apiKey)

    // create a stored task to work with
    const task = await createStoredTask(app, apiKey, schedule)

    return request(app.getHttpServer())
      .get('/task/' + task.id)
      .set('apiKey', apiKey)
      .expect(200)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        data: task // the task returned by the create call
      })))
  });

  /**
   * We fail to retrieve a task from the API with a GET request if the task ID is not valid
   */
  it('An error message is returned if the task ID is not valid', async () => {
    return request(app.getHttpServer())
      .get('/task/<invalid-id>')
      .set('apiKey', apiKey)
      .expect(400)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        message: ['id must be a UUID']
      })))
  });

  /**
   * We can retrieve all task from the API with a GET request
   */
  it('Can make a GET to retrieve all tasks', async () => {
    // first create a schedule we can reliably retrieve
    const schedule = await createStoredSchedule(app, apiKey);

    // create stored tasks to work with
    await createStoredTask(app, apiKey, schedule)
    await createStoredTask(app, apiKey, schedule)

    return request(app.getHttpServer())
      .get('/task/all')
      .set('apiKey', apiKey)
      .send()
      .expect(200)
      .expect((res) => expect(res.body.data.length).toBeGreaterThanOrEqual(2)) // we should have at least 2 tasks
  });

  /**
   * We can update an task with a PUT request
   */
  it('Can make a PUT request to update a task', async () => {
    // first create a schedule we can reliably work with
    const schedule = await createStoredSchedule(app, apiKey);

    // create a stored task to work with
    const task = await createStoredTask(app, apiKey, schedule)

    const updatedTask = {
      id: task.id,
      accountId: task.account_id,
      scheduleId: task.schedule_id,
      startTime: task.start_time,
      duration: task.duration,
      type: task.type === TaskType.BREAK ? TaskType.WORK : TaskType.BREAK // this is the value we are changing to something different
    }

    const updateResponse = await request(app.getHttpServer())
      .put('/task')
      .set('apiKey', apiKey)
      .send(updatedTask)
      .expect(200)

    expect(updateResponse.body).toEqual(expect.objectContaining({
      success: true,
      message: responses.task.update.success,
      data: {
        id: updatedTask.id,
        account_id: updatedTask.accountId,
        schedule_id: updatedTask.scheduleId,
        start_time: task.start_time,
        duration: updatedTask.duration,
        type: updatedTask.type,
        created_at: task.created_at
      }
    }))
  });

  /**
   * We can delete a task from the API with a DELETE request
   */
  it('Can make a DELETE to retrieve a task', async () => {
    // first create a schedule we can reliably retrieve
    const schedule = await createStoredSchedule(app, apiKey)

    // create a task to store and later retrieve
    const newTask = generateTask({ isStored: false });
    newTask.scheduleId = schedule.id;

    const res = await request(app.getHttpServer())
      .post('/task')
      .set('apiKey', apiKey)
      .send(newTask)

    // make sure the task was created successfully
    expect(res.status).toEqual(201)

    const response = res.body

    return request(app.getHttpServer())
      .delete('/task/' + response.data.id)
      .set('apiKey', apiKey)
      .expect(200)
      .expect((res) => expect(res.body).toEqual(expect.objectContaining({
        data: null
      })))
  });
});
