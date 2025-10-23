import { Controller, Get, Query, Param, Post, Body, Put, Delete, Req } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { QueryDto } from '../../common/query.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

/**
 * NOTE:
 * - This controller uses a permissive DTO (data:any) for create/update.
 * - Replace/extend DTOs with explicit fields later.
 * - For security, add AuthGuard and RolesGuard decorators per route.
 */

@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

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
  async create(@Body() dto: CreateAnnouncementDto, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.create(dto.data || dto, ctx);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.update(id, dto.data || dto, ctx);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.remove(id, ctx);
  }
}
