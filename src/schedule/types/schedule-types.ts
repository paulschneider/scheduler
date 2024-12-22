import { Task } from "../../types";

export type Schedule = {
  accountId: number;
  agentId: number;
  startTime: Date;
  endTime: Date;
};

export type StoredSchedule = Schedule & {
  id: string;
  tasks: Task[];
};
