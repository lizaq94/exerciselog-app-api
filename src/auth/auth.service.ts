import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async singIn(signInDto: SignInDto) {
    const { username, password: pass } = signInDto;

    const user = await this.usersService.findOne(username);

    if (user.password !== pass) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;

    return result;
  }
}
