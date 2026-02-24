import { Controller, Post, Get, Delete, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOcoDto } from '../dto/create-oco.dto';
import { UpdateRiskDto } from '../dto/update-risk.dto';
import { OrderPresenter } from '../presenters/order.presenter';
import { OcoOrderPresenter } from '../presenters/oco-order.presenter';
import { RiskSettingsPresenter } from '../presenters/risk-settings.presenter';
import { PerformancePresenter } from '../presenters/performance.presenter';
import { LeaderboardEntryPresenter } from '../presenters/leaderboard.presenter';
import { TradeService } from '../../domain/services/trade.service';
import { RiskService } from '../../domain/services/risk.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('Trade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trade')
export class TradeController {
    constructor(
        private readonly tradeService: TradeService,
        private readonly riskService: RiskService,
    ) { }

    @ApiOperation({ summary: 'Place an order', description: 'Create a new market or limit order.' })
    @ApiResponse({ status: 201, description: 'Order successfully placed.', type: OrderPresenter })
    @Post('order')
    public async placeOrder(@Req() req, @Body() orderDto: CreateOrderDto): Promise<OrderPresenter> {
        const userId = req.user.id;
        const order = await this.tradeService.placeOrder(userId, orderDto);
        return new OrderPresenter(order);
    }

    @ApiOperation({ summary: 'Place OCO order', description: 'One Cancels Other: linked SL + TP orders.' })
    @ApiResponse({ status: 201, description: 'OCO orders placed.', type: OcoOrderPresenter })
    @Post('oco')
    public async placeOCO(@Req() req, @Body() ocoDto: CreateOcoDto): Promise<OcoOrderPresenter> {
        const userId = req.user.id;
        const result = await this.tradeService.placeOCO(userId, ocoDto);
        return new OcoOrderPresenter(result);
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

    @ApiOperation({ summary: 'Get risk settings', description: 'View your max position size % and daily loss limit.' })
    @ApiResponse({ status: 200, description: 'Risk management settings.', type: RiskSettingsPresenter })
    @Get('risk')
    public async getRiskSettings(@Req() req): Promise<RiskSettingsPresenter> {
        const userId = req.user.id;
        const settings = await this.riskService.getSettings(userId);
        return new RiskSettingsPresenter(settings);
    }

    @ApiOperation({ summary: 'Update risk settings', description: 'Modify max position size % or daily loss limit.' })
    @ApiResponse({ status: 200, description: 'Updated risk settings.', type: RiskSettingsPresenter })
    @Put('risk')
    public async updateRiskSettings(@Req() req, @Body() dto: UpdateRiskDto): Promise<RiskSettingsPresenter> {
        const userId = req.user.id;
        const settings = await this.riskService.updateSettings(userId, dto);
        return new RiskSettingsPresenter(settings);
    }

    @ApiOperation({ summary: 'Performance dashboard', description: 'Win rate, P&L, Sharpe ratio.' })
    @ApiResponse({ status: 200, description: 'Performance metrics.', type: PerformancePresenter })
    @Get('performance')
    public async getPerformance(@Req() req): Promise<PerformancePresenter> {
        const userId = req.user.id;
        const data = await this.tradeService.getPerformance(userId);
        return new PerformancePresenter(data);
    }

    @ApiOperation({ summary: 'Leaderboard', description: 'Top traders ranked by total P&L.' })
    @ApiResponse({ status: 200, description: 'Leaderboard.', type: [LeaderboardEntryPresenter] })
    @Get('leaderboard')
    public async getLeaderboard(): Promise<LeaderboardEntryPresenter[]> {
        const data = await this.tradeService.getLeaderboard();
        return data.map(e => new LeaderboardEntryPresenter(e));
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


