import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({ example: 'IN_PROGRESS', enum: TicketStatus })
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;
}
