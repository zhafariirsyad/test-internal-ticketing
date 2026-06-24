import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketDto } from './dto/list-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';

type CurrentUser = {
  id: number;
  role: Role;
  email: string;
  name: string;
};

@Injectable()
export class TicketService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createTicketDto: CreateTicketDto,
    user: CurrentUser,
    attachmentUrl?: string,
  ) {
    const ticket = await this.prismaService.ticket.create({
      data: {
        title: createTicketDto.title,
        category: createTicketDto.category,
        priority: createTicketDto.priority,
        description: createTicketDto.description,
        attachmentUrl,
        createdById: user.id,
        status: TicketStatus.OPEN,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await this.prismaService.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        activity: `User ${user.name} membuat ticket baru`,
        newStatus: TicketStatus.OPEN,
      },
    });

    return ticket;
  }

  async findAll(query: ListTicketDto, user: CurrentUser) {
    const pages = query.page || 1;
    const limit = query.limit || 10;
    const skip = (pages - 1) * limit;

    const where: any = {};

    if (user.role == Role.USER) {
      where.createdById = user.id;
    }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.statuses && query.statuses.length > 0) {
      where.status = {
        in: query.statuses,
      };
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category;
    }

    const [items, total] = await Promise.all([
      this.prismaService.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prismaService.ticket.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        pages,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: CurrentUser) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    if (user.role === Role.USER && ticket.createdById !== user.id) {
      throw new ForbiddenException('Anda tidak bisa melihat ticket ini');
    }

    return ticket;
  }

  async updateStatus(
    id: number,
    updateTicketStatusDto: UpdateTicketStatusDto,
    user: CurrentUser,
  ) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    const hasAssignedToField = Object.prototype.hasOwnProperty.call(
      updateTicketStatusDto,
      'assignedToId',
    );

    let assignedAdmin:
      | {
          id: number;
          name: string;
          email: string;
          role: Role;
        }
      | null
      | undefined = undefined;

    if (
      hasAssignedToField &&
      typeof updateTicketStatusDto.assignedToId === 'number'
    ) {
      assignedAdmin = await this.prismaService.user.findUnique({
        where: {
          id: updateTicketStatusDto.assignedToId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!assignedAdmin) {
        throw new NotFoundException('Admin tujuan tidak ditemukan');
      }

      if (assignedAdmin.role !== Role.ADMIN) {
        throw new ForbiddenException('Ticket hanya bisa di-assign ke admin');
      }
    }

    const updateTicket = await this.prismaService.ticket.update({
      where: { id },
      data: {
        status: updateTicketStatusDto.status,
        assignedToId: hasAssignedToField
          ? (updateTicketStatusDto.assignedToId ?? null)
          : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const oldAssigneeName = ticket.assignedToId
      ? (
          await this.prismaService.user.findUnique({
            where: { id: ticket.assignedToId },
            select: { name: true },
          })
        )?.name || '-'
      : '-';

    const newAssigneeName = !hasAssignedToField
      ? oldAssigneeName
      : assignedAdmin
        ? assignedAdmin.name
        : '-';

    const activityParts: string[] = [];

    if (ticket.status !== updateTicketStatusDto.status) {
      activityParts.push(
        `Admin mengubah status dari ${ticket.status} menjadi ${updateTicketStatusDto.status}`,
      );
    }

    if (
      hasAssignedToField &&
      (updateTicketStatusDto.assignedToId ?? null) !==
        (ticket.assignedToId ?? null)
    ) {
      activityParts.push(
        `Admin mengubah assign ticket dari ${oldAssigneeName} menjadi ${newAssigneeName}`,
      );
    }

    if (activityParts.length === 0) {
      activityParts.push('Admin memperbarui ticket');
    }

    await this.prismaService.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        activity: activityParts.join(' '),
        oldStatus: ticket.status,
        newStatus: updateTicketStatusDto.status,
      },
    });

    return updateTicket;
  }

  async addComment(
    id: number,
    createTicketCommentDto: CreateTicketCommentDto,
    user: CurrentUser,
  ) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    if (user.role === Role.USER && ticket.createdById !== user.id) {
      throw new ForbiddenException('Anda tidak bisa melihat ticket ini');
    }

    const comment = await this.prismaService.ticketComment.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        comment: createTicketCommentDto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await this.prismaService.ticketActivity.create({
      data: {
        ticketId: id,
        userId: user.id,
        activity: `${user.role === Role.ADMIN ? 'Admin' : 'User'} added comment`,
      },
    });

    return comment;
  }
}
