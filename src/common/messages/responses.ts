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
  }
}
