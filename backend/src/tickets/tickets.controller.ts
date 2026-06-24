import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketDto } from './dto/list-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketService } from './tickets.service';
import { extname, join } from 'path';
import { renameSync, unlinkSync } from 'fs';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ summary: 'Ambil daftar ticket' })
  @ApiQuery({ name: 'search', required: false, example: 'wifi' })
  @ApiQuery({ name: 'status', required: false, example: 'OPEN' })
  @ApiQuery({
    name: 'statuses',
    required: false,
    example: 'OPEN,IN_PROGRESS',
    description: 'Pisahkan dengan koma untuk multi status',
  })
  @ApiQuery({ name: 'category', required: false, example: 'NETWORK' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Daftar ticket berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @Get()
  findAll(@Query() query: ListTicketDto, @CurrentUser() user: any) {
    return this.ticketService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Buat ticket baru' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Laptop tidak bisa connect wifi' },
        category: {
          type: 'string',
          enum: ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCOUNT', 'OTHER'],
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH'],
        },
        description: {
          type: 'string',
          example: 'Laptop tidak bisa terhubung ke wifi kantor sejak pagi.',
        },
        attachment: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'category', 'priority', 'description'],
    },
  })
  @ApiResponse({ status: 201, description: 'Ticket berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data ticket tidak valid' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @UseInterceptors(
    FileInterceptor('attachment', {
      dest: './uploads',
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: any,
  ) {
    let attachmentUrl: string | undefined;

    if (file) {
      const allowedMimeTypes = [
        'image/png',
        'image/jpeg',
        'application/pdf',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        unlinkSync(file.path);
        throw new BadRequestException(
          'Attachment hanya boleh png, jpg, jpeg, atau pdf',
        );
      }

      const fileExtension = extname(file.originalname);
      const fileName = `${Date.now()}-${file.filename}${fileExtension}`;
      const newPath = join(process.cwd(), 'uploads', fileName);

      renameSync(file.path, newPath);
      attachmentUrl = `/uploads/${fileName}`;
    }

    return this.ticketService.create(createTicketDto, user, attachmentUrl);
  }

  @ApiOperation({ summary: 'Ambil detail ticket berdasarkan id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Detail ticket berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @ApiResponse({ status: 403, description: 'Tidak boleh melihat ticket ini' })
  @ApiResponse({ status: 404, description: 'Ticket tidak ditemukan' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ticketService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update status ticket dan assign admin' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Status ticket berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Data status tidak valid' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @ApiResponse({
    status: 403,
    description: 'Hanya admin yang boleh update status',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket atau admin tujuan tidak ditemukan',
  })
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketService.updateStatus(id, updateTicketStatusDto, user);
  }

  @ApiOperation({ summary: 'Tambah komentar ke ticket' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 201, description: 'Komentar berhasil ditambahkan' })
  @ApiResponse({ status: 400, description: 'Komentar tidak valid' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  @ApiResponse({
    status: 403,
    description: 'Tidak boleh menambah komentar pada ticket ini',
  })
  @ApiResponse({ status: 404, description: 'Ticket tidak ditemukan' })
  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createTicketCommentDto: CreateTicketCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketService.addComment(id, createTicketCommentDto, user);
  }
}
