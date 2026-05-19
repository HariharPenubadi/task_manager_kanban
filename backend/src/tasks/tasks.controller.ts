import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskStatus, Priority } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest, 
    @Body('projectId') projectId: string,
    @Body('title') title: string,
    @Body('description') description?: string,
    @Body('priority') priority?: Priority,
  ) {
    return this.tasksService.create(req.user.userId, projectId, title, description, priority);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query('projectId') projectId: string) {
    return this.tasksService.findAllByProject(projectId, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: AuthenticatedRequest, 
    @Param('id') id: string, 
    @Body('status') status: TaskStatus
  ) {
    return this.tasksService.updateStatus(id, req.user.userId, status);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tasksService.remove(id, req.user.userId);
  }
}