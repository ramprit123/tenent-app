import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';
import { buildPrismaQuery } from '../common/query.util';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // list with filter/pagination/sort/search
  async list(params: any = {}, searchableFields: string[] = []) {
    const { where, orderBy, skip, take } = buildPrismaQuery(params, searchableFields);
    const [data, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.maintenance.count({ where }),
    ]);
    return {
      data,
      meta: {
        total,
        page: params.page ? Number(params.page) : 1,
        pageSize: params.pageSize ? Number(params.pageSize) : (take || total),
      },
    };
  }

  async findOne(id: string) {
    const rec = await this.prisma.maintenance.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('Maintenance not found');
    return rec;
  }

  async create(data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    const rec = await this.prisma.maintenance.create({ data });
    // audit log
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'maintenance',
      action: 'create',
      entity: 'Maintenance',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async update(id: string, data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    // ensure exists
    await this.findOne(id);
    const rec = await this.prisma.maintenance.update({
      where: { id },
      data,
    });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'maintenance',
      action: 'update',
      entity: 'Maintenance',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async remove(id: string, ctx: { tenantId?: string; userId?: string } = {}) {
    await this.findOne(id);
    const rec = await this.prisma.maintenance.delete({ where: { id } });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'maintenance',
      action: 'delete',
      entity: 'Maintenance',
      entityId: rec.id,
      diff: {},
    });
    return rec;
  }
}
