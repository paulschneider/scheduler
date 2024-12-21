export type Schedule = {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
};

export type StoredSchedule = Schedule & {
  id: string;
};