import { PartialType } from '@nestjs/swagger';
import { CreateMcDto } from './create-mc.dto';

export class UpdateMcDto extends PartialType(CreateMcDto) {}
