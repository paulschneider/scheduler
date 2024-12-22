import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface EnvironmentVariables {
  apiKey: string;
}

/**
 * This middleware is used to authenticate requests to the service.
 * It checks for the presence of an API key in the request headers.
 * If the API key is present, it is used to authenticate the request.
 * If the API key is not present, the request is rejected with a 403 status code.
 *
 */
@Injectable()
export class ServiceAuthMiddleware implements NestMiddleware {
  configService: ConfigService<EnvironmentVariables>;

  constructor(configService: ConfigService<EnvironmentVariables>) {
    this.configService = configService;
  }

  missingCredentialsReponse = {
    message: ['Required security credentials are missing or expired [apiKey]'],
    error: 'Missing required security credentials',
    statusCode: 403,
  };

  async use(req: Request, res: Response, next: NextFunction) {
    if ('apikey' in req.headers) {
      const apiKey = req.headers.apikey as string;

      if (!apiKey) {
        next(res.status(403).json(this.missingCredentialsReponse));
      }

      // A list of API keys we'll accept, anything else will be rejected
      const permissibleApiKeys = [
        this.configService.get<string>('apiKey', { infer: true }),
      ];

      if (!permissibleApiKeys.includes(apiKey)) {
        console.log('API key mismatch');

        return next(
          res.status(403).json({ message: 'Invalid API Key provided' }),
        );
      }

      // If we've made it this far, we're good to go
      return next();
    }

    // we didn't have what we needed
    next(res.status(403).json(this.missingCredentialsReponse));
  }
}
