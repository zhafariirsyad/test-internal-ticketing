import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TicketCategory, TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ example: 'Laptop tidak bisa connect wifi' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'NETWORK', enum: TicketCategory })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty({ example: 'HIGH', enum: TicketPriority })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiProperty({
    example: 'Laptop tidak bisa terhubung ke wifi kantor sejak pagi.',
  })
  @IsString()
  @MinLength(5)
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/screenshot.png' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
