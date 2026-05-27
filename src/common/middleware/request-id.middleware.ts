import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerRequestId = req.headers['x-request-id'];
    const requestId =
      (Array.isArray(headerRequestId) ? headerRequestId[0] : headerRequestId) ||
      randomUUID();
    req['requestId'] = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
