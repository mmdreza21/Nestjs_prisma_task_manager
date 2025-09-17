import { Injectable } from '@nestjs/common';
import { UpdateMcDto } from './dto/update-mc.dto';
import { ChildProcess, spawn } from 'child_process';

@Injectable()
export class McService {
  private mcProcess: ChildProcess | null = null;

  startServer() {
    if (this.mcProcess) {
      return { message: 'Server is already running!' };
    }

    try {
      const javaPath = '/usr/bin/java'; // Use absolute path if needed
      const serverJarPath = '~/minecraft-server/server.jar';

      this.mcProcess = spawn(
        javaPath,
        ['-Xms1G', '-Xmx2G', '-jar', serverJarPath, 'nogui'],
        {
          cwd: '../minecraft-server',
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe'], // Don't inherit stdin, capture logs
        },
      );

      this.mcProcess.stdout?.on('data', (data) => {
        console.log(`Minecraft: ${data.toString()}`);
      });

      this.mcProcess.stderr?.on('data', (data) => {
        console.error(`Minecraft Error: ${data.toString()}`);
      });

      this.mcProcess.on('exit', (code) => {
        console.log(`Minecraft server exited with code ${code}`);
        this.mcProcess = null;
      });

      return { message: 'Minecraft server started successfully' };
    } catch (error) {
      console.error('Error starting server:', error);
      return { message: 'Failed to start Minecraft server' };
    }
  }

  stopServer() {
    if (this.mcProcess) {
      this.mcProcess.kill('SIGTERM'); // Proper shutdown signal
      this.mcProcess = null;
      return { message: 'Minecraft server stopped successfully' };
    }
    return { message: 'No server is running' };
  }

  findAll() {
    return `This action returns all mc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mc`;
  }

  update(id: number, updateMcDto: UpdateMcDto) {
    return `This action updates a #${id} mc`;
  }

  remove(id: number) {
    return `This action removes a #${id} mc`;
  }
}
