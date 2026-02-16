import { Module } from '@nestjs/common';
import { TechnicalAnalysisController } from './technical-analysis.controller';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { MarketModule } from '../market/market.module';

@Module({
    imports: [MarketModule],
    controllers: [TechnicalAnalysisController],
    providers: [TechnicalAnalysisService],
    exports: [TechnicalAnalysisService],
})
export class TechnicalAnalysisModule { }
