import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) return client.disconnect();

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneUser('id', payload.userId);
      if (!user) return client.disconnect();

      this.onlineUsers.set(user.id, client.id);
      console.log(`User connected: ${user.email}`);
    } catch (err) {
      console.log('Socket connection failed', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = Array.from(this.onlineUsers.entries()).find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (!senderId) return;

    const recipientSocketId = this.onlineUsers.get(data.to);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('message', {
        from: senderId,
        message: data.message,
      });
    }
  }
}
