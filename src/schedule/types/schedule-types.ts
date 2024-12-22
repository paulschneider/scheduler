import { StoredTask } from "../../types";

export type Schedule = {
  accountId: number;
  agentId: number;
  startTime: Date;
  endTime: Date;
};

export type UpdatableSchedule = Schedule & {
  id: string;
};

export type StoredSchedule = Schedule & {
  id: string;
  account_id: number;
  agent_id: number;
  start_time: Date;
  end_time: Date;
  tasks: StoredTask[];
  created_at: Date;
};
