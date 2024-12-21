export type Task = {
  id: string;
  account_id: string;
  schedule_id: string;
  start_time: Date;
  duration: number;
  type: 'break' | 'work';
};

export type StoredTask = Task & {
  id: string;
};

export enum TaskType {
  BREAK = "break",
  WORK = "work"
}
