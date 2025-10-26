import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';
import { buildPrismaQuery } from '../common/query.util';

@Injectable()
export class ComplaintService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // list with filter/pagination/sort/search
  async list(params: any = {}, searchableFields: string[] = []) {
    const { where, orderBy, skip, take } = buildPrismaQuery(params, searchableFields);
    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.complaint.count({ where }),
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
    const rec = await this.prisma.complaint.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('Complaint not found');
    return rec;
  }

  async create(data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    const rec = await this.prisma.complaint.create({ data });
    // audit log
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'complaint',
      action: 'create',
      entity: 'Complaint',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async update(id: string, data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    // ensure exists
    await this.findOne(id);
    const rec = await this.prisma.complaint.update({
      where: { id },
      data,
    });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'complaint',
      action: 'update',
      entity: 'Complaint',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async remove(id: string, ctx: { tenantId?: string; userId?: string } = {}) {
    await this.findOne(id);
    const rec = await this.prisma.complaint.delete({ where: { id } });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'complaint',
      action: 'delete',
      entity: 'Complaint',
      entityId: rec.id,
      diff: {},
    });
    return rec;
  }
}
