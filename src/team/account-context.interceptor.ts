import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import { TeamService } from './team.service';

interface RequestWithAccount {
  user?: { userId: string };
  accountId?: string;
}

/**
 * Resolves req.accountId once per authenticated request, before the route
 * handler runs — the caller's own userId, or (if they're an accepted team
 * member) the account owner's userId. Registered globally in main.ts so
 * every data-scoped controller can read it via @AccountId() without each
 * one re-running the lookup. No-ops on unauthenticated routes.
 */
@Injectable()
export class AccountContextInterceptor implements NestInterceptor {
  constructor(private readonly teamService: TeamService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithAccount>();
    if (!request.user?.userId) {
      return next.handle();
    }

    return from(this.teamService.resolveAccountId(request.user.userId)).pipe(
      switchMap((accountId) => {
        request.accountId = accountId;
        return next.handle();
      }),
    );
  }
}
