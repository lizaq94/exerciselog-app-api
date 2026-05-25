import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { OwnershipGuard } from './guards/ownership.guard';

@Global()
@Module({
  providers: [CaslAbilityFactory, OwnershipGuard],
  exports: [CaslAbilityFactory, OwnershipGuard],
})
export class CaslModule {}
