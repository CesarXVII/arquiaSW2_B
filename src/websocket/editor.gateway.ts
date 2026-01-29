import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  Server,
  Socket,
} from 'socket.io';

type RoomUser = {
  name: string,
  color: string,
};

@WebSocketGateway({
  namespace: '/editor',
  cors: {
    origin: '*',
  },
})
export class EditorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private roomsUsers: Record<string, Record<string, RoomUser>> = {};

  handleConnection(client: Socket): void {
    client.connected;
  }

  handleDisconnect(client: Socket): void {
    const {
      id,
    } = client;

    for (const roomId of Object.keys(this.roomsUsers)) {
      if (this.roomsUsers[roomId] && this.roomsUsers[roomId][id]) {
        delete this.roomsUsers[roomId][id];
        this.server.to(roomId).emit('usersOnline', this.roomsUsers[roomId]);
      }
    }
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string,
      userName?: string,
      color?: string,
    },
  ): void {
    const {
      roomId,
      userName,
      color,
    } = data;

    if (!roomId) return;

    const safeName = (
      userName && userName.trim().length > 0
    )
      ? userName.trim()
      : `Usuario ${client.id.slice(-4)}`;
    const safeColor = color || '#2196F3';

    client.join(roomId);

    if (!this.roomsUsers[roomId]) {
      this.roomsUsers[roomId] = {};
    }

    this.roomsUsers[roomId][client.id] = {
      name: safeName,
      color: safeColor,
    };

    client.to(roomId).emit('userJoined', {
      clientId: client.id,
      name: safeName,
      color: safeColor,
    });

    this.server.to(roomId).emit('usersOnline', this.roomsUsers[roomId]);
  }

  @SubscribeMessage('modelChange')
  modelChange(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string,
      change: any,
    },
  ): void {
    const {
      roomId,
      change,
    } = data || {};

    if (!roomId) return;
    client.to(roomId).emit('modelChange', change);
  }

  @SubscribeMessage('cursorMove')
  cursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string,
      cursor: {
        x: number,
        y: number,
        label?: string,
        color?: string,
        hidden?: boolean,
      },
    },
  ): void {
    const {
      roomId,
      cursor,
    } = data || {};

    if (!roomId || !cursor) return;

    client.to(roomId).emit('cursorMove', {
      clientId: client.id,
      cursor,
    });
  }

  @SubscribeMessage('lockNode')
  lockNode(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string,
      nodeKey: string,
    },
  ): void {
    const {
      roomId,
      nodeKey,
    } = data || {};

    if (!roomId || !nodeKey) return;

    client.to(roomId).emit('lockNode', {
      nodeKey,
      clientId: client.id,
    });
  }

  @SubscribeMessage('unlockNode')
  unlockNode(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string,
      nodeKey: string,
    },
  ): void {
    const {
      roomId,
      nodeKey,
    } = data || {};

    if (!roomId || !nodeKey) return;

    client.to(roomId).emit('unlockNode', {
      nodeKey,
      clientId: client.id,
    });
  }
}