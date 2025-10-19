import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [NoteController],
  providers: [NoteService],
  imports: [PrismaModule],
})
export class NoteModule {}
