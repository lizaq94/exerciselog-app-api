import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashingProvider {
  public async encrypt(value: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(value, salt);
  }

  public async compareValueWithHash(
    value: string | Buffer,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }
}
