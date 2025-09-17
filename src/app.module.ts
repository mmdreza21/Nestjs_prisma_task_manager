import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { PrismaModule } from './prisma/prisma.module';
import { McModule } from './mc/mc.module';

@Module({
  imports: [UsersModule, AuthModule, TaskModule, PrismaModule, McModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
