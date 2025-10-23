import { Controller, Get, Query, Param, Post, Body, Put, Delete, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { QueryDto } from '../../common/query.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

/**
 * NOTE:
 * - This controller uses a permissive DTO (data:any) for create/update.
 * - Replace/extend DTOs with explicit fields later.
 * - For security, add AuthGuard and RolesGuard decorators per route.
 */

@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

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
  async create(@Body() dto: CreateNotificationDto, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.create(dto.data || dto, ctx);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNotificationDto, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.update(id, dto.data || dto, ctx);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const ctx = { tenantId: req?.tenantId, userId: req?.user?.sub || req?.user?.id };
    return this.service.remove(id, ctx);
  }
}
