import WebSocket from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<number, WebSocketClient[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', async (ws: WebSocketClient, req) => {
      try {
        // Authenticate connection
        const token = req.url?.split('token=')[1];
        if (!token) {
          ws.close();
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        ws.userId = decoded.id;
        ws.isAlive = true;

        // Store client connection
        if (!this.clients.has(decoded.id)) {
          this.clients.set(decoded.id, []);
        }
        this.clients.get(decoded.id)?.push(ws);

        // Setup ping-pong for connection health check
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        ws.on('close', () => {
          this.removeClient(ws);
        });

        // Send initial connection success message
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Connected to real-time notifications'
        }));

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close();
      }
    });

    // Setup periodic health checks
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          this.removeClient(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private removeClient(ws: WebSocketClient) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        const index = userClients.indexOf(ws);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }
  }

  public sendNotification(userId: number, notification: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({
        type: 'notification',
        data: notification
      });
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  public broadcastMessage(message: any) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export default WebSocketService; 