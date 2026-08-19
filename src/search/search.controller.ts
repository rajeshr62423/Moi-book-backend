import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { SearchService } from './search.service';
import { SearchResponseDto } from './dto/search-result.dto';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query('q') q?: string,
  ): Promise<SearchResponseDto> {
    const items = await this.searchService.search(user.userId, q ?? '');
    return { items };
  }
}
