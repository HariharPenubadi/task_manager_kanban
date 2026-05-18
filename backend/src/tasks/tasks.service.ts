import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, projectId: string, title: string, description?: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new ForbiddenException('You do not have access to this project');

    return this.prisma.task.create({
      data: {
        title,
        description,
        status: TaskStatus.TODO,
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
      },
    });
  }

  findAllByProject(projectId: string, userId: string) {
    return this.prisma.task.findMany({
      where: { projectId, userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(taskId: string, userId: string, status: TaskStatus) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async remove(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}