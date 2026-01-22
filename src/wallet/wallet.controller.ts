import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletPresenter } from './wallet.presenter';
import { TransactionPresenter } from './transaction.presenter';
import { DepositDto } from './dto/deposit.dto';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @ApiOperation({ summary: 'Get wallet balances', description: 'Retrieve all wallets for the current user.' })
    @ApiResponse({ status: 200, description: 'List of wallets.', type: [WalletPresenter] })
    @Get()
    public async getBalances(@Req() req): Promise<WalletPresenter[]> {
        const userId = req.user.id;
        const wallets = await this.walletService.getBalances(userId);
        return wallets.map(w => new WalletPresenter(w));
    }

    @ApiOperation({ summary: 'Get transaction history', description: 'Retrieve all transactions (deposits, trades).' })
    @ApiResponse({ status: 200, description: 'List of transactions.', type: [TransactionPresenter] })
    @Get('transactions')
    public async getTransactions(@Req() req): Promise<TransactionPresenter[]> {
        const userId = req.user.id;
        const transactions = await this.walletService.getTransactions(userId);
        return transactions.map(t => new TransactionPresenter(t));
    }

    @ApiOperation({ summary: 'Deposit funds', description: 'Deposit funds into a wallet.' })
    @ApiResponse({ status: 201, description: 'Deposit successful.', type: WalletPresenter })
    @Post('deposit')
    public async deposit(@Req() req, @Body() depositDto: DepositDto): Promise<WalletPresenter> {
        const userId = req.user.id;
        const wallet = await this.walletService.deposit(userId, depositDto.amount, depositDto.currency);
        return new WalletPresenter(wallet);
    }
}
