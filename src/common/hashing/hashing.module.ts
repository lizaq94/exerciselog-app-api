import { Module } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import { BcryptProvider } from './bcrypt.provider';

@Module({
  providers: [{ provide: HashingProvider, useClass: BcryptProvider }],
  exports: [HashingProvider],
})
export class HashingModule {}
