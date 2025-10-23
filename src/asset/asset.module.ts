import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

@Module({
  providers: [AssetService],
  controllers: [AssetController]
})
export class AssetModule {}
