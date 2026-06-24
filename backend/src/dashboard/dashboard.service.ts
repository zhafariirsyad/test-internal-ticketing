import { Injectable } from '@nestjs/common';
import { Role, TicketStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSummary(user: CurrentUser) {
    if (user.role === Role.ADMIN) {
      const [total, open, inProgress, done, rejected] = await Promise.all([
        this.prismaService.ticket.count(), // total
        this.prismaService.ticket.count({
          where: { status: 'OPEN' },
        }),
        this.prismaService.ticket.count({
          where: { status: 'IN_PROGRESS' },
        }),
        this.prismaService.ticket.count({
          where: { status: 'DONE' },
        }),
        this.prismaService.ticket.count({
          where: { status: 'REJECTED' },
        }),
      ]);

      return {
        role: Role.ADMIN,
        total,
        open,
        inProgress,
        done,
        rejected,
      };
    }

    const whereUser = { createdById: user.id };
    const [total, ongoing, done] = await Promise.all([
      this.prismaService.ticket.count({
        where: whereUser,
      }),
      this.prismaService.ticket.count({
        where: {
          ...whereUser,
          status: {
            in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
          },
        },
      }),
      this.prismaService.ticket.count({
        where: {
          ...whereUser,
          status: TicketStatus.DONE,
        },
      }),
    ]);

    return {
      role: Role.USER,
      total,
      ongoing,
      done,
    };
  }
}
