import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BacktestService } from './backtest.service';
import { RunBacktestDto } from './dto/run-backtest.dto';

@ApiTags('Backtest')
@Controller('backtest')
export class BacktestController {
    constructor(private readonly backtestService: BacktestService) { }

    @ApiOperation({ summary: 'Run a Strategy Backtest' })
    @Post('run')
    async run(@Body() dto: RunBacktestDto) {
        return this.backtestService.runBacktest(dto);
    }
}
