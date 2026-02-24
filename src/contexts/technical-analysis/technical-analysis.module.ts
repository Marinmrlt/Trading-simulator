import { Module } from '@nestjs/common';

// Application
import { TechnicalAnalysisController } from './application/controllers/technical-analysis.controller';

// Domain
import { TechnicalAnalysisService } from './domain/services/technical-analysis.service';

// Cross-module
import { MarketModule } from '../market/market.module';

@Module({
    imports: [MarketModule],
    controllers: [TechnicalAnalysisController],
    providers: [TechnicalAnalysisService],
    exports: [TechnicalAnalysisService],
})
export class TechnicalAnalysisModule { }
