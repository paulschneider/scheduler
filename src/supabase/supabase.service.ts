import { Injectable } from '@nestjs/common';
import {
  createClient,
  SupabaseClient,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Database } from './types/database.types';

export type User = SupabaseUser;

interface EnvironmentVariables {
  supabase: {
    instanceUrl: string;
    instanceKey: string;
    instanceServiceRoleKey: string;
  };
}

@Injectable()
export class Client {
  public static connection: SupabaseClient;
  public static configService: ConfigService<EnvironmentVariables>;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    Client.connection = createClient<Database>(
      this.configService.get<string>('supabase.instanceUrl', { infer: true }),
      this.configService.get<string>('supabase.instanceServiceRoleKey', {
        infer: true,
      }),
    );
  }
}
