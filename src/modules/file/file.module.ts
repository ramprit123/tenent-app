import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService, AuditService],
  exports: [FileService]
})
export class FileModule {}
