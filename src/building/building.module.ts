import { Module } from '@nestjs/common';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';

@Module({
  providers: [BuildingService],
  controllers: [BuildingController]
})
export class BuildingModule {}
