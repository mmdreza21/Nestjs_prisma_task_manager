import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { NoteService } from './note.service';
import {
  CommonSwaggerGetNoAuth,
  CommonSwaggerPost,
} from 'src/common/decorators/common-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@ApiTags('Notes (Public)')
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @CommonSwaggerPost({
    summary: 'Create a new note (public)',
    description: '',
  })
  create(@Body() body: CreateNoteDto) {
    return this.noteService.create(body);
  }

  @CommonSwaggerGetNoAuth({
    summary: 'Get all notes (public)',
    description: 'Fetch all notes from the database .',
  })
  @Get()
  findAll() {
    return this.noteService.findAll();
  }

  @CommonSwaggerGetNoAuth({
    summary: 'Get one note (public)',
    description: 'Retrieve a single note by its ID.',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noteService.findOne(id);
  }

  @CommonSwaggerPost({
    summary: 'Update note (public)',
    description: 'Edit a note by ID .',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateNoteDto) {
    return this.noteService.update(id, body);
  }

  @CommonSwaggerPost({
    summary: 'Delete note (public)',
    description: 'Delete a note by its ID .',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noteService.remove(id);
  }
}
