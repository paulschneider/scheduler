export type Task = {
  id: string;
  accountId: string;
  scheduleId: string;
  startTime: Date;
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
