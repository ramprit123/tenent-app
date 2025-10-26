import { Module } from '@nestjs/common';
import { RentPaymentService } from './rent-payment.service';
import { RentPaymentController } from './rent-payment.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [RentPaymentController],
  providers: [RentPaymentService, PrismaService, AuditService],
  exports: [RentPaymentService]
})
export class RentPaymentModule {}
