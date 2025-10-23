import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  providers: [TenantService],
  controllers: [TenantController]
})
export class TenantModule {}
