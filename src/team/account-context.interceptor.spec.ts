import { of } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { AccountContextInterceptor } from './account-context.interceptor';
import { TeamService } from './team.service';

function contextWithRequest(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

const next: CallHandler = { handle: () => of('handled') };

describe('AccountContextInterceptor', () => {
  it('sets request.accountId for an authenticated request', (done) => {
    const teamService = {
      resolveAccountId: jest.fn().mockResolvedValue('owner-1'),
    } as unknown as TeamService;
    const interceptor = new AccountContextInterceptor(teamService);
    const request: { user?: { userId: string }; accountId?: string } = {
      user: { userId: 'member-1' },
    };

    interceptor.intercept(contextWithRequest(request), next).subscribe(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn reference, not a real unbound call
      expect(teamService.resolveAccountId).toHaveBeenCalledWith('member-1');
      expect(request.accountId).toBe('owner-1');
      done();
    });
  });

  it('no-ops on an unauthenticated request', (done) => {
    const teamService = {
      resolveAccountId: jest.fn(),
    } as unknown as TeamService;
    const interceptor = new AccountContextInterceptor(teamService);
    const request: { accountId?: string } = {};

    interceptor.intercept(contextWithRequest(request), next).subscribe(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn reference, not a real unbound call
      expect(teamService.resolveAccountId).not.toHaveBeenCalled();
      expect(request.accountId).toBeUndefined();
      done();
    });
  });
});
