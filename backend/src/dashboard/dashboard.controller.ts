import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Ambil ringkasan dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Ringkasan dashboard berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @Get('summary')
  async getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user);
  }
}
