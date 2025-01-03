# Scheduling API

This is a simple scheduling API built with NestJS and Supabase. It is designed to be used as a backend for a scheduling application.

### Table of contents

1. [Structure](#structure)
2. [Configuration](#configuration)
3. [Supabase](#supabase)
4. [Security](#security)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Insomnia](#insomnia)
8. [Further work to be done](#further-work-to-be-done)

### Important notes extracted from the below
* rename 'test.env' to '.test.env' and move it to the root of the project
* there is a 'useful' directory in the root of the project containing useful information and imagery
* if you want to run this app locally you need to copy 'useful/env.example' to '.env' (root) and populate it with the correct values

## Structure

The project is structured as a NestJS application. The src directory contains the source code for the application. Here you will find two main services:

- `Task` - This service is responsible for creating, fetching, updating and deleting tasks.
- `Schedule` - This service is responsible for creating, fetching, updating and deleting schedules.

There are also two controllers:

- `TaskController` - This controller is responsible for handling requests to the task endpoints.
- `ScheduleController` - This controller is responsible for handling requests to the schedule endpoints.

There are also two services:

- `TaskService` - This service is responsible for handling the business logic for the task endpoints.
- `ScheduleService` - This service is responsible for handling the business logic for the schedule endpoints.

The app currently supports 10 endpoints:

- `POST /task` - Create a new task
- `GET /task/:id` - Fetch a task by its ID
- `GET /task/all` - Fetch all tasks (standalone (no schedule associations))
- `PUT /task` - Update a task
- `DELETE /task/:id` - Delete a task by its ID

- `POST /schedule` - Create a new schedule
- `GET /schedule/:id` - Fetch a schedule by its ID
- `GET /schedule/all` - Fetch all schedules
- `PUT /schedule` - Update a schedule
- `DELETE /schedule/:id` - Delete a schedule by its ID

Fetching a single schedule will return all the tasks associated with that schedule.
Fetching all schedules will return all the tasks associated with those schedules.

## Configuration

```You only need to do this if you want to run the app locally```

There is an example ENV file in the useful directory called '.env.example'. You must create a new file called '.env' in the root of the project and populate it with the correct values. Running the local test suite does not require these values and will instead use .test.env from the root of the project.

```You must do this (below) to run the local test suite```

.test.env is included in the repositiory as test.env and will need to be renamed to .test.env before running the local test suite.

How to the configuration values used are as follows:

```
ENVIRONMENT=development|production
SUPABASE_INSTANCE_URL=
SUPABASE_INSTANCE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

API_URL=
API_KEY=
```

## Supabase

I took the decision to leverage Supabase for the database service to avoid the need to setup a local database / run docker.

You can find a screenshot of the ERD from Supabase in 'useful/supabase-erd.png'.

## Security

The project is currently using an API key to authenticate requests to the API. And a service role (I.e key) to perform database operations. There is a middleware in place to check the API key is present in the request headers (```header.apiKey```). If it is not, **all** requests are rejected with a 403 (Unauthorized) response.

## Deployment

The project is deployed to Vercel and can be accessed via the ```API_URL``` environment variable.

Example:

```
POST API_URL/schedule
{
  "accountId": 50,
  "agentId": 3,
  "startTime": "2024-12-24T10:00:00Z",
  "endTime": "2024-12-24T12:00:00Z"
}
```

## Testing

There are three types of tests in this project:

1. Unit tests (unit tests for the services)
2. Integration tests (unit tests for the controllers)
3. E2E tests (end-to-end tests for the entire application)

Unit tests and integration tests are located in the resources directory alongside the source code.

E2E tests are located in the test directory and are used to test the entire application.

There are a number of commands to run the tests depending on the type of test you want to run, they are listed in the package.json file. However, the most common command is `npm run test:all` which will run all the test types.

Or 

* pnpm run test:e2e
* pnpm run test:watch:task:controller
* pnpm run test:watch:task:service
* pnpm run test:watch:schedule:controller
* pnpm run test:watch:schedule:service

---

>  📝  Running the E2E tests requires the .env file to be present in the root of the project as it uses the Supabase client to perform database operations. The values required for the required keys have been provided separately.

---

## Insomnia

There is a collection of requests in the Insomnia file in 'useful/Insomnia_2024-12-23.json'. In that collection there are two 'folders' containing the requests for the task and schedule endpoints. You can use this collection to visualise the content of the database to validate that requests you make have been received/stored as expected.

There are two required environment variables in the collection:

```
baseUrl: <the-API_URL-from-the-env-file>
apiKey: <the-API_KEY-from-the-env-file>
```

## Testing with Vercel & Insomnia

The easiest way to test the API is to use the Insomnia collection attached to the 'remote' environment (this is an option in the Insomnia collection). However, you will need to set the ```baseUrl``` environment variable to the URL of the Vercel deployment. You **must** also set the ```apiKey``` header variable to the API key.

## Further work to be done

...some light notes on improvements to consider to make this all even more awesome.

* Change the way the update endpoints work for both main services. Currently they accept the resource ID in the payload and I preference a more REST-ful approach and provide the ID in the URL (like the GET endpoints).
* Further tests to be added to the test suite.
* Add a comprehensive logging system.
* Consider adding a rate limiting system.
* Implement a appropriate JWT based authentication system. The API key is currently only used to authenticate requests to the API as a temporary measure.
* Add OpenAPI documentation.
* Add a more comprehensive error handling system.
