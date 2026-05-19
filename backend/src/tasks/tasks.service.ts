import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, projectId: string, title: string, description?: string, priority: Priority = 'MEDIUM') {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new ForbiddenException('Unauthorized');

    return this.prisma.task.create({
      data: {
        title,
        description,
        priority, 
        status: TaskStatus.TODO,
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
      },
    });
  }

  findAllByProject(projectId: string, userId: string) {
    return this.prisma.task.findMany({
      where: { projectId, userId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
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