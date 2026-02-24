import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BacktestService } from '../../domain/services/backtest.service';
import { RunBacktestDto } from '../dto/run-backtest.dto';
import { BacktestResultPresenter } from '../presenters/backtest-result.presenter';
import { ComparisonResultPresenter } from '../presenters/comparison-result.presenter';

@ApiTags('Backtest')
@Controller('backtest')
export class BacktestController {
    constructor(private readonly backtestService: BacktestService) { }

    @ApiOperation({ summary: 'Run a Strategy Backtest' })
    @ApiResponse({ status: 201, description: 'Backtest results', type: BacktestResultPresenter })
    @Post('run')
    async run(@Body() dto: RunBacktestDto): Promise<BacktestResultPresenter> {
        const result = await this.backtestService.runBacktest(dto);
        return new BacktestResultPresenter(result);
    }

    @ApiOperation({ summary: 'Compare Brokers' })
    @ApiResponse({ status: 201, description: 'Comparison results', type: [ComparisonResultPresenter] })
    @Post('compare')
    async compare(@Body() dto: RunBacktestDto): Promise<ComparisonResultPresenter[]> {
        const results = await this.backtestService.compareBrokers(dto);
        return results.map(r => new ComparisonResultPresenter(r));
    }
}
