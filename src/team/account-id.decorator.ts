import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Use on a route guarded by JwtAuthGuard, downstream of the globally-registered
 * AccountContextInterceptor: @AccountId() accountId. Resolves to the account
 * whose data the current request should read/write — the caller's own userId,
 * or (if they're an accepted team member) the account owner's userId instead.
 * Falls back to request.user.userId if the interceptor hasn't run (e.g. in a
 * unit test that skips it), so it degrades to "no sharing" rather than erroring.
 */
export const AccountId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ accountId?: string; user?: { userId: string } }>();
    return request.accountId ?? request.user?.userId ?? '';
  },
);
