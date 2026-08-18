import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Paginated } from '../interfaces/paginated.interface';
import { API_MESSAGE_KEY } from '../decorators/api-message.decorator';

function isPaginated(value: unknown): value is Paginated<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as Paginated<unknown>).items) &&
    typeof (value as Paginated<unknown>).meta === 'object'
  );
}

function defaultMessage(method: string): string {
  switch (method) {
    case 'POST':
      return 'Resource created successfully';
    case 'DELETE':
      return 'Resource deleted successfully';
    default:
      return 'Request successful';
  }
}

/**
 * Wraps every controller return value in the app-wide ApiResponse<T>
 * envelope. A controller returning { items, meta } (see Paginated<T>) gets
 * `data`/`meta` split accordingly; anything else becomes `data` as-is.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<{ method: string }>();
    const customMessage = this.reflector.get<string | undefined>(
      API_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((result) => {
        const status = response.statusCode;
        const paginated = isPaginated(result);
        return {
          type: 'success',
          status,
          message: customMessage ?? defaultMessage(request.method),
          data: (paginated ? result.items : result) as T,
          ...(paginated ? { meta: result.meta } : {}),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
