import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAdmins() {
    return this.prismaService.user.findMany({
      where: {
        role: Role.ADMIN,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
