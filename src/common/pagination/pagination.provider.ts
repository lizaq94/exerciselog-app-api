import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PaginationProvider {
  public generatePaginationLinks(
    request: Request,
    totalPages: number,
    currentPage: number,
    limit: number,
  ) {
    if (totalPages < 1 || currentPage < 1)
      return {
        first: null,
        last: null,
        current: null,
        next: null,
        previous: null,
      };

    const baseUrl = `${request.protocol}://${request.get('host')}${request.path}`;

    const buildUrl = (page?: number) => {
      if (!page || page < 1 || page > totalPages) return null; // zwróć null zamiast undefined
      const queryParams = new URLSearchParams(
        request.query as Record<string, string>,
      );
      queryParams.set('page', page.toString());
      queryParams.set('limit', limit.toString());
      return `${baseUrl}?${queryParams.toString()}`;
    };

    return {
      first: buildUrl(1),
      last: buildUrl(totalPages),
      current: buildUrl(currentPage),
      next: buildUrl(currentPage < totalPages ? currentPage + 1 : null),
      previous: buildUrl(currentPage > 1 ? currentPage - 1 : null),
    };
  }
}
