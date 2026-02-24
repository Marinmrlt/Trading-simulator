import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssetPresenter } from '../presenters/asset.presenter';
import { MarketService } from '../../domain/services/market.service';
import { AlertService } from '../../domain/services/alert.service';
import { GetCandlesDto } from '../dto/get-candles.dto';
import { CreateAlertDto } from '../dto/create-alert.dto';
import { CandlePresenter } from '../presenters/candle.presenter';
import { AlertPresenter } from '../presenters/alert.presenter';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('Market')
@Controller('market')
export class MarketController {
    constructor(
        private readonly marketService: MarketService,
        private readonly alertService: AlertService,
    ) { }

    @ApiOperation({ summary: 'Get all assets', description: 'Retrieve a list of all available market assets.' })
    @ApiResponse({ status: 200, description: 'List of assets.', type: [AssetPresenter] })
    @Get('assets')
    public async getAssets(): Promise<AssetPresenter[]> {
        const assets = await this.marketService.getAssets();
        return assets.map(asset => new AssetPresenter(asset));
    }

    @ApiOperation({ summary: 'Get asset price', description: 'Retrieve price details for a specific symbol.' })
    @ApiResponse({ status: 200, description: 'Asset details.', type: AssetPresenter })
    @ApiResponse({ status: 404, description: 'Asset not found.' })
    @Get('price/:symbol')
    public async getPrice(@Param('symbol') symbol: string): Promise<AssetPresenter> {
        const asset = await this.marketService.getPrice(symbol.toUpperCase());
        if (!asset) {
            throw new NotFoundException('Asset not found');
        }
        return new AssetPresenter(asset);
    }

    @ApiOperation({ summary: 'Get candles', description: 'Retrieve OHLCV candle data for charting.' })
    @ApiResponse({ status: 200, description: 'Candle data.', type: [CandlePresenter] })
    @Get('candles')
    public async getCandles(@Query() query: GetCandlesDto): Promise<CandlePresenter[]> {
        const candles = await this.marketService.getCandles(query.symbol, query.timeframe);
        return candles.map(c => new CandlePresenter(c));
    }

    // --- Price Alerts (authenticated) ---

    @ApiOperation({ summary: 'Create price alert', description: 'Get notified when an asset hits a target price.' })
    @ApiResponse({ status: 201, description: 'Alert created.', type: AlertPresenter })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('alerts')
    public async createAlert(@Req() req, @Body() dto: CreateAlertDto): Promise<AlertPresenter> {
        const userId = req.user.id;
        const alert = await this.alertService.createAlert(userId, dto);
        return new AlertPresenter(alert);
    }

    @ApiOperation({ summary: 'Get my alerts', description: 'List all active and triggered alerts.' })
    @ApiResponse({ status: 200, description: 'List of alerts.', type: [AlertPresenter] })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('alerts')
    public async getAlerts(@Req() req): Promise<AlertPresenter[]> {
        const userId = req.user.id;
        const alerts = await this.alertService.getAlerts(userId);
        return alerts.map(a => new AlertPresenter(a));
    }

    @ApiOperation({ summary: 'Delete alert', description: 'Remove a price alert.' })
    @ApiResponse({ status: 200, description: 'Alert deleted.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('alerts/:id')
    public async deleteAlert(@Req() req, @Param('id') alertId: string) {
        const userId = req.user.id;
        await this.alertService.deleteAlert(userId, alertId);
        return { message: 'Alert deleted' };
    }
}
