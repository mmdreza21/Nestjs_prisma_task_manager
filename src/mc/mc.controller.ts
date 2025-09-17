import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { McService } from './mc.service';

@ApiTags('minecraft') // Organizes API under 'minecraft' in Swagger
@Controller('mc')
export class McController {
  constructor(private readonly mcService: McService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start the Minecraft server' })
  @ApiResponse({
    status: 201,
    description: 'Minecraft server started successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to start Minecraft server' })
  startServer() {
    return this.mcService.startServer();
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop the Minecraft server' })
  @ApiResponse({
    status: 200,
    description: 'Minecraft server stopped successfully',
  })
  @ApiResponse({ status: 400, description: 'No server running' })
  stopServer() {
    return this.mcService.stopServer();
  }
}
