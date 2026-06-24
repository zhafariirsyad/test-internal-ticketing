import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Ambil daftar admin untuk assign ticket' })
  @ApiResponse({ status: 200, description: 'Daftar admin berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @ApiResponse({
    status: 403,
    description: 'Hanya admin yang boleh mengakses endpoint ini',
  })
  @Roles(Role.ADMIN)
  @Get('admins')
  findAdmins() {
    return this.usersService.findAdmins();
  }
}
