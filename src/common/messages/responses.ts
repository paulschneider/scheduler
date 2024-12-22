const SCHEDULE_CREATE_SUCCESS = 'Schedule created successfully';
const SCHEDULE_CREATE_ERROR = 'There was a problem creating the schedule';

const SCHEDULE_FETCH_SUCCESS = 'Schedule found';
const SCHEDULE_FETCH_ERROR = 'There was a problem fetching the schedule';
const SCHEDULE_FETCH_NOT_FOUND = 'Schedule not found';

const SCHEDULE_FETCH_ALL_SUCCESS = 'Schedules found';
const SCHEDULE_FETCH_ALL_ERROR = 'There was a problem fetching the schedules';

const SCHEDULE_UPDATE_SUCCESS = 'Schedule updated successfully';
const SCHEDULE_UPDATE_ERROR = 'There was a problem updating the schedule';
const SCHEDULE_UPDATE_NOT_FOUND = 'Schedule not found';

const SCHEDULE_DELETE_SUCCESS = 'Schedule deleted successfully';
const SCHEDULE_DELETE_ERROR = 'There was a problem deleting the schedule';
const SCHEDULE_DELETE_DATA_FOUND = 'Deleting the schedule failed';

const TASK_CREATE_SUCCESS = 'Task created successfully';
const TASK_CREATE_ERROR = 'There was a problem creating the task';

const TASK_FETCH_SUCCESS = 'Task found';
const TASK_FETCH_ERROR = 'There was a problem fetching the task';
const TASK_FETCH_NOT_FOUND = 'Task not found';

const TASK_UPDATE_SUCCESS = 'Task updated successfully';
const TASK_UPDATE_ERROR = 'There was a problem updating the task';

const TASK_DELETE_SUCCESS = 'Task deleted successfully';
const TASK_DELETE_ERROR = 'There was a problem deleting the task';
const TASK_DELETE_NOT_FOUND = 'Task not found';

const TASK_FETCH_ALL_SUCCESS = 'Tasks found';
const TASK_FETCH_ALL_ERROR = 'There was a problem fetching the tasks';
const TASK_FETCH_ALL_NOT_FOUND = 'Tasks not found';
export const responses = {
  schedule: {
    create: {
      success: SCHEDULE_CREATE_SUCCESS,
      error: SCHEDULE_CREATE_ERROR,
    },
    fetch: {
      success: SCHEDULE_FETCH_SUCCESS,
      error: SCHEDULE_FETCH_ERROR,
      notFound: SCHEDULE_FETCH_NOT_FOUND,
    },
    fetchAll: {
      success: SCHEDULE_FETCH_ALL_SUCCESS,
      error: SCHEDULE_FETCH_ALL_ERROR,
    },
    update: {
      success: SCHEDULE_UPDATE_SUCCESS,
      error: SCHEDULE_UPDATE_ERROR,
      notFound: SCHEDULE_UPDATE_NOT_FOUND,
    },
    delete: {
      success: SCHEDULE_DELETE_SUCCESS,
      error: SCHEDULE_DELETE_ERROR,
      dataFound: SCHEDULE_DELETE_DATA_FOUND,
    },
  },
  task: {
    create: {
      success: TASK_CREATE_SUCCESS,
      error: TASK_CREATE_ERROR,
    },
    fetch: {
      success: TASK_FETCH_SUCCESS,
      error: TASK_FETCH_ERROR,
      notFound: TASK_FETCH_NOT_FOUND,
    },
    update: {
      success: TASK_UPDATE_SUCCESS,
      error: TASK_UPDATE_ERROR,
    },
    delete: {
      success: TASK_DELETE_SUCCESS,
      error: TASK_DELETE_ERROR,
      notFound: TASK_DELETE_NOT_FOUND,
    },
    fetchAll: {
      success: TASK_FETCH_ALL_SUCCESS,
      error: TASK_FETCH_ALL_ERROR,
      notFound: TASK_FETCH_ALL_NOT_FOUND,
    },
  },
};
