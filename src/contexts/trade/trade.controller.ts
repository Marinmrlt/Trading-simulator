import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPresenter } from './order.presenter';
import { TradeService } from './trade.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Trade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trade')
export class TradeController {
    constructor(private readonly tradeService: TradeService) { }

    @ApiOperation({ summary: 'Place an order', description: 'Create a new market or limit order.' })
    @ApiResponse({ status: 201, description: 'Order successfully placed.', type: OrderPresenter })
    @Post('order')
    public async placeOrder(@Req() req, @Body() orderDto: CreateOrderDto): Promise<OrderPresenter> {
        const userId = req.user.id;
        const order = await this.tradeService.placeOrder(userId, orderDto);
        return new OrderPresenter(order);
    }

    @ApiOperation({ summary: 'Get order history', description: 'Retrieve all orders for the current user.' })
    @ApiResponse({ status: 200, description: 'List of orders.', type: [OrderPresenter] })
    @Get('orders')
    public async getOrders(@Req() req): Promise<OrderPresenter[]> {
        const userId = req.user.id;
        const orders = await this.tradeService.getOrders(userId);
        return orders.map(o => new OrderPresenter(o));
    }

    @ApiOperation({ summary: 'Get open positions', description: 'Retrieve open positions (FILLED BUY orders without close).' })
    @ApiResponse({ status: 200, description: 'List of open positions.', type: [OrderPresenter] })
    @Get('positions')
    public async getPositions(@Req() req): Promise<OrderPresenter[]> {
        const userId = req.user.id;
        const positions = await this.tradeService.getOpenPositions(userId);
        return positions.map(p => new OrderPresenter(p));
    }

    @ApiOperation({ summary: 'Performance dashboard', description: 'Win rate, P&L, Sharpe ratio.' })
    @ApiResponse({ status: 200, description: 'Performance metrics.' })
    @Get('performance')
    public async getPerformance(@Req() req) {
        const userId = req.user.id;
        return this.tradeService.getPerformance(userId);
    }

    @ApiOperation({ summary: 'Leaderboard', description: 'Top traders ranked by total P&L.' })
    @ApiResponse({ status: 200, description: 'Leaderboard.' })
    @Get('leaderboard')
    public async getLeaderboard() {
        return this.tradeService.getLeaderboard();
    }

    @ApiOperation({ summary: 'Cancel an order', description: 'Cancel an open (LIMIT) order and unlock funds.' })
    @ApiResponse({ status: 200, description: 'Order cancelled.', type: OrderPresenter })
    @Delete('order/:id')
    public async cancelOrder(@Req() req, @Param('id') orderId: string): Promise<OrderPresenter> {
        const userId = req.user.id;
        const order = await this.tradeService.cancelOrder(userId, orderId);
        return new OrderPresenter(order);
    }
}
