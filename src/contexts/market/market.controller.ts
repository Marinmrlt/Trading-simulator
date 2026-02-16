import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssetPresenter } from './asset.presenter';
import { MarketService } from './market.service';
import { GetCandlesDto } from './dto/get-candles.dto';
import { CandlePresenter } from './candle.presenter';

@ApiTags('Market')
@Controller('market')
export class MarketController {
    constructor(private readonly marketService: MarketService) { }

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
}
