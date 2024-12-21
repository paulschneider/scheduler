import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SupabaseModule } from './supabase/supabase.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleController } from './schedule/schedule.controller';
import { TaskController } from './task/task.controller';
import { ServiceAuthMiddleware } from './common/middleware/service.auth.middleware';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    SupabaseModule,
    ScheduleModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ServiceAuthMiddleware)
      .forRoutes(ScheduleController, TaskController);
  }
}
