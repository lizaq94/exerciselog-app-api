import { PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';

export interface PaginatedResult<T> extends PaginatorTypes.PaginatedResult<T> {
  links: {
    first: string | null;
    previous: string | null;
    current: string | null;
    next: string | null;
    last: string | null;
  };
}
