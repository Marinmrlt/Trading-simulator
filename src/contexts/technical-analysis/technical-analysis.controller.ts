import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TechnicalAnalysisService } from './technical-analysis.service';

@ApiTags('Technical Analysis')
@Controller('analysis')
export class TechnicalAnalysisController {
    constructor(private readonly service: TechnicalAnalysisService) { }

    @ApiOperation({ summary: 'Get SMA', description: 'Simple Moving Average' })
    @ApiQuery({ name: 'symbol', example: 'BTC' })
    @ApiQuery({ name: 'period', example: 14 })
    @Get('sma')
    async getSMA(
        @Query('symbol') symbol: string,
        @Query('period') period: string,
        @Query('timeframe') timeframe: string = '1h',
    ) {
        if (!symbol || !period) throw new BadRequestException('Missing params');
        return this.service.getSMA(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get EMA', description: 'Exponential Moving Average' })
    @Get('ema')
    async getEMA(
        @Query('symbol') symbol: string,
        @Query('period') period: string,
        @Query('timeframe') timeframe: string = '1h',
    ) {
        if (!symbol || !period) throw new BadRequestException('Missing params');
        return this.service.getEMA(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get RSI', description: 'Relative Strength Index' })
    @Get('rsi')
    async getRSI(
        @Query('symbol') symbol: string,
        @Query('period') period: string = '14',
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getRSI(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get MACD', description: 'Moving Average Convergence Divergence' })
    @Get('macd')
    async getMACD(
        @Query('symbol') symbol: string,
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getMACD(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get Bollinger Bands', description: 'Bollinger Bands' })
    @Get('bollinger')
    async getBollinger(
        @Query('symbol') symbol: string,
        @Query('period') period: string = '20',
        @Query('stdDev') stdDev: string = '2',
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getBollinger(symbol, timeframe, parseInt(period), parseFloat(stdDev));
    }

    @ApiOperation({ summary: 'Get Stochastic', description: 'Stochastic Oscillator' })
    @Get('stochastic')
    async getStochastic(
        @Query('symbol') symbol: string,
        @Query('period') period: string = '14',
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getStochastic(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get ATR', description: 'Average True Range (Volatility)' })
    @Get('atr')
    async getATR(
        @Query('symbol') symbol: string,
        @Query('period') period: string = '14',
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getATR(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get ADX', description: 'Average Directional Index (Trend Strength)' })
    @Get('adx')
    async getADX(
        @Query('symbol') symbol: string,
        @Query('period') period: string = '14',
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getADX(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get CCI', description: 'Commodity Channel Index' })
    @Get('cci')
    async getCCI(
        @Query('symbol') symbol: string,
        @Query('period') period: string = '20',
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getCCI(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get OBV', description: 'On Balance Volume' })
    @Get('obv')
    async getOBV(
        @Query('symbol') symbol: string,
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getOBV(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get Ichimoku', description: 'Ichimoku Cloud' })
    @Get('ichimoku')
    async getIchimoku(
        @Query('symbol') symbol: string,
        @Query('timeframe') timeframe: string = '1h',
    ) {
        return this.service.getIchimoku(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get VWAP', description: 'Volume Weighted Average Price' })
    @Get('vwap')
    async getVWAP(@Query('symbol') symbol: string, @Query('timeframe') timeframe: string = '1h') {
        return this.service.getVWAP(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get PSAR', description: 'Parabolic SAR' })
    @Get('psar')
    async getPSAR(@Query('symbol') symbol: string, @Query('timeframe') timeframe: string = '1h') {
        return this.service.getPSAR(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get Williams %R', description: 'Williams %R' })
    @Get('williamsr')
    async getWilliamsR(@Query('symbol') symbol: string, @Query('period') period: string = '14', @Query('timeframe') timeframe: string = '1h') {
        return this.service.getWilliamsR(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get MFI', description: 'Money Flow Index' })
    @Get('mfi')
    async getMFI(@Query('symbol') symbol: string, @Query('period') period: string = '14', @Query('timeframe') timeframe: string = '1h') {
        return this.service.getMFI(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get Stochastic RSI', description: 'StochRSI' })
    @Get('stochrsi')
    async getStochRSI(@Query('symbol') symbol: string, @Query('timeframe') timeframe: string = '1h') {
        // Using defaults for now or add query params
        return this.service.getStochasticRSI(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get ROC', description: 'Rate of Change' })
    @Get('roc')
    async getROC(@Query('symbol') symbol: string, @Query('period') period: string = '12', @Query('timeframe') timeframe: string = '1h') {
        return this.service.getROC(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get Force Index', description: 'Force Index' })
    @Get('forceindex')
    async getForceIndex(@Query('symbol') symbol: string, @Query('period') period: string = '13', @Query('timeframe') timeframe: string = '1h') {
        return this.service.getForceIndex(symbol, timeframe, parseInt(period));
    }

    @ApiOperation({ summary: 'Get Awesome Oscillator', description: 'Awesome Oscillator' })
    @Get('awesome')
    async getAwesome(@Query('symbol') symbol: string, @Query('timeframe') timeframe: string = '1h') {
        return this.service.getAwesomeOscillator(symbol, timeframe);
    }

    @ApiOperation({ summary: 'Get TRIX', description: 'TRIX' })
    @Get('trix')
    async getTRIX(@Query('symbol') symbol: string, @Query('period') period: string = '18', @Query('timeframe') timeframe: string = '1h') {
        return this.service.getTRIX(symbol, timeframe, parseInt(period));
    }
}
