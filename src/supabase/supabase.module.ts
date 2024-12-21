import { Module } from '@nestjs/common';
import { Client } from './supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [Client],
  exports: [Client],
})
export class SupabaseModule {}
