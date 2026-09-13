// Types globaux partagés entre features

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SelectOption {
  value: string;
  label: string;
}
