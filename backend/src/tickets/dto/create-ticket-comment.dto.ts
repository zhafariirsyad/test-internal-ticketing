import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTicketCommentDto {
  @ApiProperty({ example: 'Saya sedang cek issue ini.' })
  @IsString()
  @MinLength(1)
  comment: string;
}
