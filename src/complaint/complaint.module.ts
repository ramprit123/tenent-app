import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';

@Module({
  providers: [ComplaintService],
  controllers: [ComplaintController]
})
export class ComplaintModule {}
