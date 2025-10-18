import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  // Create a new note
  async create(data: { title: string; content: string }) {
    return this.prisma.note.create({ data });
  }

  // Get all notes
  async findAll() {
    return this.prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get one note by ID
  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  // Update note by ID
  async update(id: string, data: Partial<{ title: string; content: string }>) {
    try {
      return await this.prisma.note.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Note not found');
    }
  }

  // Delete note by ID
  async remove(id: string) {
    try {
      return await this.prisma.note.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Note not found');
    }
  }
}
