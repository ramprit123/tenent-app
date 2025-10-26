import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { AssetModule } from './modules/asset/asset.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { BuildingModule } from './modules/building/building.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { EventModule } from './modules/event/event.module';
import { FlatModule } from './modules/flat/flat.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RentPaymentModule } from './modules/rent-payment/rent-payment.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { VendorModule } from './modules/vendor/vendor.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BuildingModule,
    FlatModule,
    TenantModule,
    MaintenanceModule,
    ComplaintModule,
    RentPaymentModule,
    EventModule,
    AnnouncementModule,
    VendorModule,
    AssetModule,
    NotificationModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
