export type Task = {
  accountId: number;
  scheduleId: string;
  startTime: Date;
  duration: number;
  type: TaskType;
};

export type UpdatableTask = Task & {
  id: string;
};

export type StoredTask = {
  id: string;
  account_id: number;
  schedule_id: string;
  start_time: Date;
  duration: number;
  type: TaskType;
  created_at: Date;
};

export enum TaskType {
  BREAK = "break",
  WORK = "work"
}
