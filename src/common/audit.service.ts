import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * log object:
   *  {
   *    tenantId?: string,
   *    userId?: string,
   *    service: string,
   *    action: 'create'|'update'|'delete',
   *    entity: string,
   *    entityId?: string,
   *    diff?: any
   *  }
   */
  async log(entry: {
    tenantId?: string;
    userId?: string;
    service: string;
    action: string;
    entity: string;
    entityId?: string;
    diff?: any;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId,
          service: entry.service,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          diff: entry.diff || {},
        },
      });
    } catch (e) {
      // Do not block main flow on audit failure - log to console for now
      // In prod, pipe to a resilient logger or DLQ
      // eslint-disable-next-line no-console
      console.error('Failed to write audit log', e);
    }
  }
}
