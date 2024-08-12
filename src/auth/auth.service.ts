import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../utils/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async singIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    const user = await this.usersService.findOne(username);
    const isAuthorized = await comparePassword(password, user.password);

    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
