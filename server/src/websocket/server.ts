/**
 * WebSocket Server — real-time market data broadcaster
 *
 * Channels:
 *   quotes      → spot price updates every 3s
 *   macro       → FX + CBOT indices every 5s
 *   alerts      → weather / risk alerts (event-driven)
 *   orders      → order book changes (event-driven)
 *
 * Clients subscribe by sending: { type: "subscribe", channel: "quotes" }
 */

import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import { marketDataService } from '../services/marketData';
import { WsMessage } from '../types';
import { logger } from '../services/logger';

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
  userId?: string;
  isAlive: boolean;
}

class AgroWebSocketServer {
  private wss!: WebSocketServer;
  private clients = new Map<WebSocket, Client>();
  private intervals: NodeJS.Timeout[] = [];

  init(httpServer: Server): void {
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const ip = req.socket.remoteAddress;
      logger.debug('WS client connected', { ip, total: this.wss.clients.size });

      const client: Client = { ws, subscriptions: new Set(), isAlive: true };
      this.clients.set(ws, client);

      this.send(ws, { type: 'ping', timestamp: new Date().toISOString() });

      ws.on('message', (raw) => this.handleMessage(ws, raw.toString()));

      ws.on('pong', () => {
        const c = this.clients.get(ws);
        if (c) c.isAlive = true;
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.debug('WS client disconnected', { total: this.wss.clients.size });
      });

      ws.on('error', (err) => {
        logger.warn('WS client error', { error: err.message });
        this.clients.delete(ws);
      });
    });

    this.startBroadcasting();
    this.startHeartbeat();
    logger.info('WebSocket server ready at /ws');
  }

  private handleMessage(ws: WebSocket, raw: string): void {
    try {
      const msg: WsMessage = JSON.parse(raw);

      if (msg.type === 'pong') {
        const c = this.clients.get(ws);
        if (c) c.isAlive = true;
        return;
      }

      if (msg.type === 'subscribe' && msg.channel) {
        const c = this.clients.get(ws);
        if (c) {
          c.subscriptions.add(msg.channel);
          logger.debug('WS subscribe', { channel: msg.channel });
          // Immediately push current snapshot to new subscriber
          this.pushSnapshot(ws, msg.channel);
        }
        return;
      }

      if (msg.type === 'unsubscribe' && msg.channel) {
        this.clients.get(ws)?.subscriptions.delete(msg.channel);
        return;
      }
    } catch {
      this.send(ws, { type: 'error', data: 'Invalid JSON' });
    }
  }

  private async pushSnapshot(ws: WebSocket, channel: string): Promise<void> {
    if (channel === 'quotes') {
      const quotes = await marketDataService.getQuotes();
      this.send(ws, { type: 'quote_update', channel: 'quotes', data: quotes, timestamp: new Date().toISOString() });
    }
    if (channel === 'macro') {
      const macro = await marketDataService.getMacro();
      this.send(ws, { type: 'macro_update', channel: 'macro', data: macro, timestamp: new Date().toISOString() });
    }
  }

  private startBroadcasting(): void {
    // Quotes: every 3 seconds
    this.intervals.push(
      setInterval(async () => {
        await marketDataService.refresh();
        const quotes = marketDataService.getQuotesCache();
        this.broadcast('quotes', { type: 'quote_update', channel: 'quotes', data: quotes, timestamp: new Date().toISOString() });
      }, 3000)
    );

    // Macro: every 5 seconds
    this.intervals.push(
      setInterval(() => {
        const macro = marketDataService.getMacroCache();
        if (macro.length > 0) {
          this.broadcast('macro', { type: 'macro_update', channel: 'macro', data: macro, timestamp: new Date().toISOString() });
        }
      }, 5000)
    );
  }

  private startHeartbeat(): void {
    this.intervals.push(
      setInterval(() => {
        this.clients.forEach((client, ws) => {
          if (!client.isAlive) {
            ws.terminate();
            this.clients.delete(ws);
            return;
          }
          client.isAlive = false;
          ws.ping();
        });
      }, 30000)
    );
  }

  broadcast(channel: string, message: WsMessage): void {
    const payload = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }

  /** Emit to all connected clients regardless of subscription (for alerts) */
  broadcastAll(message: WsMessage): void {
    const payload = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }

  private send(ws: WebSocket, msg: WsMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  get connectedCount() { return this.clients.size; }

  shutdown(): void {
    this.intervals.forEach(clearInterval);
    this.wss.close();
  }
}

export const wsServer = new AgroWebSocketServer();
