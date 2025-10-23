import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BuildingModule } from './building/building.module';
import { FlatModule } from './flat/flat.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ComplaintModule } from './complaint/complaint.module';
import { EventModule } from './event/event.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { AssetModule } from './asset/asset.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { UserModule } from './modules/user/user.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { RentPaymentModule } from './modules/rent-payment/rent-payment.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { NotificationModule } from './modules/notification/notification.module';

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
