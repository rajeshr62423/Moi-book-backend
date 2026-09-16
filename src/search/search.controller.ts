import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountId } from '../team/account-id.decorator';
import { SearchService } from './search.service';
import { SearchResponseDto } from './dto/search-result.dto';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @AccountId() accountId: string,
    @Query('q') q?: string,
  ): Promise<SearchResponseDto> {
    const items = await this.searchService.search(accountId, q ?? '');
    return { items };
  }
}
