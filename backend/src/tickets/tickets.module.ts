import { Module } from '@nestjs/common';
import { TicketController } from './tickets.controller';
import { TicketService } from './tickets.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketsModule {}
