import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalSystemError extends HttpException {
  constructor(message: string = "Internal server error") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
