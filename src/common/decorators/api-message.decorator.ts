import { SetMetadata } from '@nestjs/common';

export const API_MESSAGE_KEY = 'api_message';

/**
 * Sets the `message` field the ResponseInterceptor wraps a controller's
 * return value with, e.g. @ApiMessage('Login successful'). Without it, the
 * interceptor falls back to a generic message derived from the HTTP method.
 */
export const ApiMessage = (message: string) =>
  SetMetadata(API_MESSAGE_KEY, message);
