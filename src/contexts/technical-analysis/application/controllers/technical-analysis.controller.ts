import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TechnicalAnalysisService } from '../../domain/services/technical-analysis.service';
import { BaseIndicatorDto, PeriodIndicatorDto, BollingerDto } from '../dto/indicator.dto';
import { IndicatorResultPresenter } from '../presenters/indicator-result.presenter';

@ApiTags('Technical Analysis')
@Controller('analysis')
export class TechnicalAnalysisController {
    constructor(private readonly service: TechnicalAnalysisService) { }

    @ApiOperation({ summary: 'Get SMA', description: 'Simple Moving Average' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('sma')
    async getSMA(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getSMA(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get EMA', description: 'Exponential Moving Average' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('ema')
    async getEMA(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getEMA(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get RSI', description: 'Relative Strength Index' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('rsi')
    async getRSI(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getRSI(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get MACD', description: 'Moving Average Convergence Divergence' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('macd')
    async getMACD(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getMACD(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Bollinger Bands', description: 'Bollinger Bands' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('bollinger')
    async getBollinger(@Query() dto: BollingerDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getBollinger(dto.symbol, dto.timeframe || '1h', dto.period || 20, dto.stdDev || 2);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Stochastic', description: 'Stochastic Oscillator' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('stochastic')
    async getStochastic(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getStochastic(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get ATR', description: 'Average True Range (Volatility)' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('atr')
    async getATR(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getATR(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get ADX', description: 'Average Directional Index (Trend Strength)' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('adx')
    async getADX(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getADX(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get CCI', description: 'Commodity Channel Index' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('cci')
    async getCCI(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getCCI(dto.symbol, dto.timeframe || '1h', dto.period || 20);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get OBV', description: 'On Balance Volume' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('obv')
    async getOBV(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getOBV(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Ichimoku', description: 'Ichimoku Cloud' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('ichimoku')
    async getIchimoku(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getIchimoku(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get VWAP', description: 'Volume Weighted Average Price' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('vwap')
    async getVWAP(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getVWAP(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get PSAR', description: 'Parabolic SAR' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('psar')
    async getPSAR(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getPSAR(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Williams %R', description: 'Williams %R' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('williamsr')
    async getWilliamsR(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getWilliamsR(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get MFI', description: 'Money Flow Index' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('mfi')
    async getMFI(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getMFI(dto.symbol, dto.timeframe || '1h', dto.period || 14);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Stochastic RSI', description: 'StochRSI' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('stochrsi')
    async getStochRSI(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getStochasticRSI(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get ROC', description: 'Rate of Change' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('roc')
    async getROC(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getROC(dto.symbol, dto.timeframe || '1h', dto.period || 12);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Force Index', description: 'Force Index' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('forceindex')
    async getForceIndex(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getForceIndex(dto.symbol, dto.timeframe || '1h', dto.period || 13);
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get Awesome Oscillator', description: 'Awesome Oscillator' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('awesome')
    async getAwesome(@Query() dto: BaseIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getAwesomeOscillator(dto.symbol, dto.timeframe || '1h');
        return new IndicatorResultPresenter(result);
    }

    @ApiOperation({ summary: 'Get TRIX', description: 'TRIX' })
    @ApiResponse({ status: 200, type: IndicatorResultPresenter })
    @Get('trix')
    async getTRIX(@Query() dto: PeriodIndicatorDto): Promise<IndicatorResultPresenter> {
        const result = await this.service.getTRIX(dto.symbol, dto.timeframe || '1h', dto.period || 18);
        return new IndicatorResultPresenter(result);
    }
}
