import { Schedule, StoredSchedule, Task, StoredTask, TaskType, UpdatableTask } from '../../src/types';
import { ScheduleCreateDto } from '../../src/schedule/dto/schedule-create.dto';
import { ScheduleUpdateDto } from '../../src/schedule/dto/schedule-update.dto';
import { TaskCreateDto } from '../../src/task/dto/task-create.dto';
import { faker } from '@faker-js/faker';
import { TaskUpdateDto } from '../../src/task/dto/task-update.dto';
/**
 * Generate a schedule
 * 
 * @param isStored - Whether the schedule should be fictionally stored in the database
 * @returns A schedule object (Schedule | StoredSchedule)
 */
export const generateSchedule = ({ isStored = false }: { isStored?: boolean }): Schedule | StoredSchedule => {
  const schedule = {
    accountId: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
    agentId: faker.helpers.arrayElement([6, 7, 8, 9, 10]),
    startTime: new Date(),
    endTime: new Date(),
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
export const generateScheduleCreateDto = (schedule: Schedule): ScheduleCreateDto => {
  const scheduleCreateDto = new ScheduleCreateDto()

  scheduleCreateDto.accountId = schedule.accountId
  scheduleCreateDto.agentId = schedule.agentId
  scheduleCreateDto.startTime = schedule.startTime.toISOString()
  scheduleCreateDto.endTime = schedule.endTime.toISOString()

  return scheduleCreateDto
};

/**
 * Generate a schedule update dto
 * 
 * @param schedule - The schedule to generate the dto for
 * @returns A schedule update dto
 */
export const generateScheduleUpdateDto = (schedule: StoredSchedule): ScheduleUpdateDto => {
  const dto = new ScheduleUpdateDto()

  dto.id = schedule.id
  dto.accountId = schedule.accountId
  dto.agentId = schedule.agentId
  dto.startTime = schedule.startTime.toISOString()
  dto.endTime = schedule.endTime.toISOString()

  return dto
};

/**
 * Generate a task
 * 
 * @param isStored - Whether the task should be fictionally stored in the database
 * @returns A task object (Task | StoredTask)
 */
export const generateTask = ({ isStored = false }: { isStored?: boolean }): Task => {
  const schedule = generateSchedule({ isStored: true }) as StoredSchedule;

  return {
    accountId: faker.number.int({ min: 1, max: 180 }),
    scheduleId: schedule.id,
    startTime: new Date(),
    duration: faker.number.int({ min: 1, max: 180 }),
    type: faker.helpers.arrayElement(["work", "break"]) as TaskType,
  };
};

/**
 * Generate a mock stored task
 * 
 * @param isStored - Whether the task should be fictionally stored in the database
 * @returns A task object (Task | StoredTask)
 */
export const generateStoredTask = ({ isStored = true }: { isStored?: boolean }): StoredTask => {
  const schedule = generateSchedule({ isStored: true }) as StoredSchedule;

  return {
    id: faker.string.uuid(),
    account_id: faker.number.int({ min: 1, max: 180 }),
    schedule_id: schedule.id,
    start_time: new Date(),
    duration: faker.number.int({ min: 1, max: 180 }),
    type: faker.helpers.arrayElement(["work", "break"]) as TaskType,
    created_at: new Date(),
  };
};

/**
 * Generate a task create dto
 * 
 * @param task - The task to generate the dto for
 * @returns A task create dto
 */
export const generateTaskCreateDto = (task: Task): TaskCreateDto => {
  const taskCreateDto = new TaskCreateDto()

  taskCreateDto.accountId = task.accountId
  taskCreateDto.scheduleId = task.scheduleId
  taskCreateDto.startTime = task.startTime.toISOString()
  taskCreateDto.duration = task.duration
  taskCreateDto.type = task.type as TaskType

  return taskCreateDto
};

/**
 * Generate a task update dto
 * 
 * @param task - The task to generate the dto for
 * @returns A task update dto
 */
export const generateTaskUpdateDto = (task: UpdatableTask): TaskUpdateDto => {
  const taskUpdateDto = new TaskUpdateDto()

  taskUpdateDto.id = task.id
  taskUpdateDto.accountId = task.accountId
  taskUpdateDto.scheduleId = task.scheduleId
  taskUpdateDto.startTime = task.startTime.toISOString()
  taskUpdateDto.duration = task.duration
  taskUpdateDto.type = task.type as TaskType

  return taskUpdateDto
};
