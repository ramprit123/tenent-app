import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [AssetController],
  providers: [AssetService, PrismaService, AuditService],
  exports: [AssetService]
})
export class AssetModule {}
