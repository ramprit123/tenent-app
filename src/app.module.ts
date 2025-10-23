import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SocietyModule } from './society/society.module';
import { BuildingModule } from './building/building.module';
import { FlatModule } from './flat/flat.module';
import { TenantModule } from './tenant/tenant.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ComplaintModule } from './complaint/complaint.module';
import { PaymentModule } from './payment/payment.module';
import { EventModule } from './event/event.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { VendorModule } from './vendor/vendor.module';
import { AssetModule } from './asset/asset.module';
import { NotificationModule } from './notification/notification.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [AuthModule, UserModule, SocietyModule, BuildingModule, FlatModule, TenantModule, MaintenanceModule, ComplaintModule, PaymentModule, EventModule, AnnouncementModule, VendorModule, AssetModule, NotificationModule, AuditLogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
