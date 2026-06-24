import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { TicketCategory, TicketStatus } from '@prisma/client';

export class ListTicketDto {
  @ApiPropertyOptional({ example: 'wifi' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'OPEN', enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    example: 'OPEN,IN_PROGRESS',
    description: 'Pisahkan dengan koma untuk multi status',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @IsEnum(TicketStatus, { each: true })
  statuses?: TicketStatus[];

  @ApiPropertyOptional({ example: 'NETWORK', enum: TicketCategory })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;
}
