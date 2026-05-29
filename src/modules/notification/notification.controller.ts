import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Req() req: Request & { user: Express.User }) {
    return this.notificationService.findAll(req.user.id);
  }

  @Get('unread')
  findUnread(@Req() req: Request & { user: Express.User }) {
    return this.notificationService.findUnread(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: Request & { user: Express.User }) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}