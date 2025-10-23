import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';

@Module({
  providers: [BuildingService],
  controllers: [BuildingController],
})
export class BuildingModule {}
