import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    // 1. Explicitly list your frontend URLs (No wildcards)
    origin: [
      'http://localhost:3000',
      'https://betapp2-production-8a3e.up.railway.app'
    ],
    // 2. Credentials must be true to allow cookies/auth headers
    credentials: true, 
    methods: ['GET', 'POST'],
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('WebSocket Gateway Started');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  
  broadcastTick(tick: any) {
    if (!this.server) return;
    this.server.emit('tick', tick);
  }
  broadcastMarkets(markets: any[]) {
    if (!this.server) return;
    this.server.emit('markets', markets);
  }

  broadcastTrade(trade: any) {
    if (!this.server) return;
    this.server.emit('trade', trade);
  }

  broadcastSettlement(result: any) {
    if (!this.server) return;
    this.server.emit('settlement', result);
  }
}