import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        // Client connected
    }

    handleDisconnect(client: Socket) {
        // Client disconnected
    }

    emitTicker(symbol: string, price: number) {
        this.server.emit('ticker', { symbol, price, timestamp: new Date() });
    }

    emitOrderUpdate(userId: string, data: Record<string, any>) {
        this.server.emit(`order.${userId}`, { ...data, timestamp: new Date() });
    }

    emitTradeAlert(userId: string, data: Record<string, any>) {
        this.server.emit(`alert.${userId}`, { ...data, timestamp: new Date() });
    }
}

