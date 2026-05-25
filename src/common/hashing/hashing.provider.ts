import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
  abstract encrypt(value: string | Buffer): Promise<string>;

  abstract compareValueWithHash(
    value: string | Buffer,
    hash: string,
  ): Promise<boolean>;
}
