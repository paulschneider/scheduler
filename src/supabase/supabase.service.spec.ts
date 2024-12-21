import { Test } from '@nestjs/testing';
import { Client } from './supabase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../config/configuration';
import { createMock } from '@golevelup/ts-jest';

describe('SupabaseService', () => {
  let service: Client;
  let configService: ConfigService;

  /**
   * Setup the service and config service
   */
  beforeEach(async () => {
    const clientMock = createMock<Client>();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          load: [configuration],
        }),
      ],
      providers: [Client, { provide: Client, useValue: clientMock }],
    }).compile();

    service = await moduleRef.resolve<Client>(Client);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  /**
   * Validate that the service is defined
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Validate that the config is loaded correctly
   */
  it('should have loaded the correct config', () => {
    expect(configService.get<string>('apiKey')).toEqual('<this-is-a-fake-key>');
  });
});
