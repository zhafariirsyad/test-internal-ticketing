import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 201, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiResponse({ status: 200, description: 'Data user berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { id: number }) {
    return this.authService.me(user.id);
  }
}
