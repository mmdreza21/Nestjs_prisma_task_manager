import { Module } from '@nestjs/common';
import { McService } from './mc.service';
import { McController } from './mc.controller';

@Module({
  controllers: [McController],
  providers: [McService],
})
export class McModule {}
