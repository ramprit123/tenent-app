import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { buildPrismaQuery } from '../common/query.util';
import { AuditService } from '../common/audit.service';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // list with filter/pagination/sort/search
  async list(params: any = {}, searchableFields: string[] = []) {
    const { where, orderBy, skip, take } = buildPrismaQuery(params, searchableFields);
    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.announcement.count({ where }),
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
    const rec = await this.prisma.announcement.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('Announcement not found');
    return rec;
  }

  async create(data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    const rec = await this.prisma.announcement.create({ data });
    // audit log
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'announcement',
      action: 'create',
      entity: 'Announcement',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async update(id: string, data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    // ensure exists
    await this.findOne(id);
    const rec = await this.prisma.announcement.update({
      where: { id },
      data,
    });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'announcement',
      action: 'update',
      entity: 'Announcement',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async remove(id: string, ctx: { tenantId?: string; userId?: string } = {}) {
    await this.findOne(id);
    const rec = await this.prisma.announcement.delete({ where: { id } });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: 'announcement',
      action: 'delete',
      entity: 'Announcement',
      entityId: rec.id,
      diff: {},
    });
    return rec;
  }
}
