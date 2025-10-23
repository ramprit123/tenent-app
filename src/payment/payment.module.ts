import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
