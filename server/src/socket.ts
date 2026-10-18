import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    // Client can join admin room or specific order room
    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('join:order', (orderNumber: string) => {
      if (orderNumber) {
        socket.join(`order:${orderNumber}`);
      }
    });

    socket.on('leave:order', (orderNumber: string) => {
      if (orderNumber) {
        socket.leave(`order:${orderNumber}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function notifyNewOrder(order: any) {
  if (io) {
    io.to('admin').emit('order:created', order);
  }
}

export function notifyOrderStatusUpdated(order: any) {
  if (io) {
    io.to('admin').emit('order:updated', order);
    io.to(`order:${order.orderNumber}`).emit('order:updated', order);
  }
}

export function notifyTableUpdated(table: any) {
  if (io) {
    io.to('admin').emit('table:updated', table);
    io.emit('table:public_update', { id: table.id, status: table.status });
  }
}
