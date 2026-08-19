export type SearchResultType = 'event' | 'guest' | 'vendor' | 'moi' | 'ledger';

export class SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  link: string;
}

export class SearchResponseDto {
  items: SearchResultItem[];
}
