import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    client.emit('system.connected', {
      status: 'ok',
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    client.emit('system.disconnected', {
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  emitWarehouseUpdated(payload: unknown) {
    this.server.emit('warehouse.updated', payload);
  }

  emitRawMaterialBagsUpdated(payload: unknown) {
    this.server.emit('raw-material-bags.updated', payload);
  }

  emitProductionUpdated(payload: unknown) {
    this.server.emit('production.updated', payload);
  }

  emitOrderUpdated(payload: unknown) {
    this.server.emit('order.updated', payload);
  }

  emitUploadUpdated(payload: unknown) {
    this.server.emit('upload.updated', payload);
  }
}
