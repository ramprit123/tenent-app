import { Module } from '@nestjs/common';
import { FlatService } from './flat.service';
import { FlatController } from './flat.controller';

@Module({
  providers: [FlatService],
  controllers: [FlatController]
})
export class FlatModule {}
