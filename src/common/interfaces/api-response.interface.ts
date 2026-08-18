export interface ApiMeta {
  total_records: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  count: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface ApiResponse<T> {
  type: 'success' | 'error';
  status: number;
  message: string;
  data: T;
  meta?: ApiMeta;
  timestamp: string;
}
