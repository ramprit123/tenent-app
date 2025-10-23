import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AuditService],
  exports: [UserService]
})
export class UserModule {}
