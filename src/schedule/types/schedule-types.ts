import { Task } from "../../types";

export type Schedule = {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  tasks: Task[];
};

export type StoredSchedule = Schedule & {
  id: string;
};
