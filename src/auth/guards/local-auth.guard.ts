import {
  BadRequestException,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    return super.canActivate(context);
  }
}
