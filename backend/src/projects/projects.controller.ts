import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() body: Prisma.ProjectCreateWithoutUserInput) {
    return this.projectsService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Prisma.ProjectUpdateInput) {
    return this.projectsService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.projectsService.remove(id, req.user.userId);
  }
}