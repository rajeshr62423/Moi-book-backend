import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Mirrors thrown exceptions into the same ApiResponse<T> envelope
 * ResponseInterceptor uses for success responses, so callers only ever
 * parse one shape. class-validator's ValidationPipe throws a
 * BadRequestException whose `message` is an array of field errors; those
 * are surfaced under `data.errors` rather than collapsed into one string.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status: number = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : undefined;

    let message = 'Internal server error';
    let errors: string[] | undefined;

    if (isHttp) {
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const b = body as { message?: string | string[]; error?: string };
        if (Array.isArray(b.message)) {
          errors = b.message;
          message = 'Validation failed';
        } else {
          message = b.message ?? b.error ?? exception.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    // 500, spelled out to avoid comparing a plain number against an enum member.
    if (!isHttp || status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    const payload: ApiResponse<null> = {
      type: 'error',
      status,
      message,
      data: errors ? ({ errors } as unknown as null) : null,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}
