import { Type } from 'class-transformer';

export class PaginationMeta {
  total: number;

  page: number;

  limit: number;
}

export class PaginationResponse<T> {
  @Type(() => Object) // will be replaced dynamically
  data: T[];

  meta: PaginationMeta;
}
