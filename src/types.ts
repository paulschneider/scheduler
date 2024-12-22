export * from './schedule/types/schedule-types';
export * from './task/types/task-types';

export interface ApiResponse<T> {
  message: string;
  data: T;
}
