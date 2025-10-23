/**
 * script.js
 *
 * Generates/overwrites NestJS module-level CRUD boilerplate for multiple modules
 * - Controller (CRUD + list with filter/pagination/sort/search)
 * - Service (Prisma calls + audit)
 * - DTOs (Create, Update, Query)
 * - Utility files (query util)
 * - AuditService and PrismaService stub (if missing)
 *
 * Usage: node script.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const run = (c) => {
  console.log("RUN:", c);
  execSync(c, { stdio: "inherit" });
};

const modules = [
  "tenant",
  "user",
  "property",
  "flat",
  "occupant",
  "kyc-record",
  "lease",
  "agreement",
  "rent-payment",
  "maintenance",
  "complaint",
  "file",
  "audit-log",
  "vendor",
  "event",
  "announcement",
  "asset",
  "notification",
];

// helpers
const ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

// common templates
const prismaServiceTpl = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
`;

const auditServiceTpl = `import { Injectable } from '@nestjs/common';
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
`;

// query util: parse common query params -> prisma args
const queryUtilTpl = `import { Prisma } from '@prisma/client';

type QueryParams = {
  q?: string; // free text search
  filter?: string; // JSON string or key1:value1,key2:value2
  sort?: string; // e.g. createdAt:desc,name:asc
  page?: string | number;
  pageSize?: string | number;
};

/**
 * buildPrismaQuery
 * - simple parser for common "filter", "q", "sort", pagination
 * - returns { where, orderBy, skip, take }
 */
export function buildPrismaQuery<T = any>(params: QueryParams, searchableFields: string[] = []) {
  const where: any = {};
  const orderBy: Prisma.Enumerable<Prisma.{$ORDER_BY}> = [];
  let skip: number | undefined;
  let take: number | undefined;

  // pagination
  const page = params.page ? Number(params.page) : 1;
  const pageSize = params.pageSize ? Number(params.pageSize) : 20;
  if (page && pageSize) {
    skip = (page - 1) * pageSize;
    take = pageSize;
  }

  // filters: accept either JSON string or key:val,key2:val2
  if (params.filter) {
    let parsed = {};
    try {
      parsed = JSON.parse(params.filter as string);
    } catch {
      // parse key:val,key2:val2
      const parts = (params.filter as string).split(',');
      for (const part of parts) {
        const [k, ...rest] = part.split(':');
        if (!k) continue;
        const v = rest.join(':');
        parsed[k] = isNaN(Number(v)) ? v : Number(v);
      }
    }
    // merge simple equality filters
    Object.assign(where, parsed);
  }

  // full-text-ish search over provided searchableFields
  if (params.q && searchableFields.length) {
    const q = params.q;
    where.OR = searchableFields.map((f) => ({ [f]: { contains: q, mode: 'insensitive' } }));
  }

  // sorting: 'createdAt:desc,name:asc'
  if (params.sort) {
    const parts = (params.sort as string).split(',');
    for (const part of parts) {
      const [field, dir] = part.split(':');
      if (!field) continue;
      const d = dir && dir.toLowerCase() === 'desc' ? 'desc' : 'asc';
      orderBy.push({ [field]: d } as any);
    }
  } else {
    // default fallback: createdAt desc if exists
    orderBy.push({ createdAt: 'desc' } as any);
  }

  return { where, orderBy, skip, take };
}
`;

// Note: we need to replace placeholder {$ORDER_BY} with actual order type name; use 'Prisma.SortOrder' or simpler: any
const finalizedQueryUtilTpl = queryUtilTpl.replace(/\{\$ORDER_BY\}/g, 'SortOrder');

// DTOs: generic QueryDto, CreateDto, UpdateDto templates
const queryDtoTpl = `import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number;
}
`;

// helper to create file (overwrite)
const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
  console.log("WROTE:", filePath);
};

// create common files (if missing or always replace? we'll overwrite audit and util and prisma stub if missing)
ensureDir("src/common");
writeFile("src/common/query.util.ts", finalizedQueryUtilTpl);
writeFile("src/common/query.dto.ts", queryDtoTpl);

// PrismaService & AuditService (overwrite only if missing)
if (!fs.existsSync("src/prisma.service.ts")) {
  writeFile("src/prisma.service.ts", prismaServiceTpl);
} else {
  console.log("src/prisma.service.ts exists - skipping overwrite");
}

writeFile("src/common/audit.service.ts", auditServiceTpl);

// For each module create controller, service, dto files
for (const mod of modules) {
  const moduleName = mod; // e.g. 'user' or 'kyc-record'
  const className = moduleName.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
  // map to Prisma model name (best-effort): convert kebab-case to PascalCase and remove hyphens
  // special-case rename for some modules:
  const modelNameMap = {
    "kyc-record": "KycRecord",
    "rent-payment": "RentPayment",
    "audit-log": "AuditLog",
    "tenant": "Tenant",
    "user": "User",
    "property": "Property",
    "flat": "Flat",
    "occupant": "Occupant",
    "lease": "Lease",
    "agreement": "Agreement",
    "maintenance": "Maintenance",
    "complaint": "Complaint",
    "file": "File",
    "vendor": "Vendor",
    "event": "Event",
    "announcement": "Announcement",
    "asset": "Asset",
    "notification": "Notification",
  };
  const modelName = modelNameMap[moduleName] || className;

  const moduleDir = path.join("src", "modules", moduleName);
  ensureDir(moduleDir);

  // DTOs: create and update are permissive any-based (you can customize later)
  const createDto = `import { IsOptional, IsNotEmpty } from 'class-validator';

export class Create${modelName}Dto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
`;

  const updateDto = `import { IsOptional } from 'class-validator';

export class Update${modelName}Dto {
  @IsOptional()
  data?: any;
}
`;

  // Service template
  const serviceTpl = `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';
import { buildPrismaQuery } from '../../common/query.util';

@Injectable()
export class ${className}Service {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // list with filter/pagination/sort/search
  async list(params: any = {}, searchableFields: string[] = []) {
    const { where, orderBy, skip, take } = buildPrismaQuery(params, searchableFields);
    const [data, total] = await Promise.all([
      this.prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.count({ where }),
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
    const rec = await this.prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('${modelName} not found');
    return rec;
  }

  async create(data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    const rec = await this.prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.create({ data });
    // audit log
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: '${moduleName}',
      action: 'create',
      entity: '${modelName}',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async update(id: string, data: any, ctx: { tenantId?: string; userId?: string } = {}) {
    // ensure exists
    await this.findOne(id);
    const rec = await this.prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.update({
      where: { id },
      data,
    });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: '${moduleName}',
      action: 'update',
      entity: '${modelName}',
      entityId: rec.id,
      diff: data,
    });
    return rec;
  }

  async remove(id: string, ctx: { tenantId?: string; userId?: string } = {}) {
    await this.findOne(id);
    const rec = await this.prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.delete({ where: { id } });
    await this.audit.log({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      service: '${moduleName}',
      action: 'delete',
      entity: '${modelName}',
      entityId: rec.id,
      diff: {},
    });
    return rec;
  }
}
`;

  // Controller template with guards placeholders (user to wire real guards)
  const controllerTpl = `import { Controller, Get, Query, Param, Post, Body, Put, Delete, Req } from '@nestjs/common';
import { ${className}Service } from './${moduleName}.service';
import { QueryDto } from '../../common/query.dto';
import { Create${modelName}Dto } from './dto/create-${moduleName}.dto';
import { Update${modelName}Dto } from './dto/update-${moduleName}.dto';

/**
 * NOTE:
 * - This controller uses a permissive DTO (data:any) for create/update.
 * - Replace/extend DTOs with explicit fields later.
 * - For security, add AuthGuard and RolesGuard decorators per route.
 */

@Controller('${moduleName}')
export class ${className}Controller {
  constructor(private readonly service: ${className}Service) {}

  @Get()
  async list(@Query() query: QueryDto, @Req() req: any) {
    // pass query and optionally tenant/user info from req (req.tenantId, req.user.id)
    return this.service.list(query, []);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Create${modelName}Dto, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.create(dto.data || dto, ctx);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Update${modelName}Dto, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.update(id, dto.data || dto, ctx);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.remove(id, ctx);
  }
}
`;

  // Module file content wiring service + controller + prisma + audit
  const moduleTpl = `import { Module } from '@nestjs/common';
import { ${className}Service } from './${moduleName}.service';
import { ${className}Controller } from './${moduleName}.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service, PrismaService, AuditService],
  exports: [${className}Service]
})
export class ${className}Module {}
`;

  // write files (overwrite)
  writeFile(path.join(moduleDir, `${moduleName}.service.ts`), serviceTpl);
  writeFile(path.join(moduleDir, `${moduleName}.controller.ts`), controllerTpl);
  writeFile(path.join(moduleDir, `${moduleName}.module.ts`), moduleTpl);
  ensureDir(path.join(moduleDir, "dto"));
  writeFile(path.join(moduleDir, `dto/create-${moduleName}.dto.ts`), createDto);
  writeFile(path.join(moduleDir, `dto/update-${moduleName}.dto.ts`), updateDto);
}

console.log("✅ CRUD modules generated/overwritten for:", modules.join(", "));
console.log("👉 Next: import generated modules in your AppModule and wire guards (Auth, Roles) and tenant resolver where needed.");
