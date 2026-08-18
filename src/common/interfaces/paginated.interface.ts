import { ApiMeta } from './api-response.interface';

/**
 * Return this shape from a controller method for a list endpoint; the
 * ResponseInterceptor lifts `meta` to the top level of the envelope and
 * sets `data` to `items`, matching ApiResponse<T[]>'s optional `meta` field.
 */
export interface Paginated<T> {
  items: T[];
  meta: ApiMeta;
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
  totalRecords: number,
): Paginated<T> {
  const totalPages = perPage > 0 ? Math.ceil(totalRecords / perPage) : 0;
  return {
    items,
    meta: {
      total_records: totalRecords,
      total_pages: totalPages,
      current_page: page,
      per_page: perPage,
      count: items.length,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
    },
  };
}
