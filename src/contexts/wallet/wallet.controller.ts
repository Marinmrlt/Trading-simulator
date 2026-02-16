import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletPresenter } from './wallet.presenter';
import { TransactionPresenter } from './transaction.presenter';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
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

    @ApiOperation({ summary: 'Get portfolio summary', description: 'Total portfolio value in USD using live market prices.' })
    @ApiResponse({ status: 200, description: 'Portfolio summary with total USD value.' })
    @Get('portfolio')
    public async getPortfolio(@Req() req) {
        const userId = req.user.id;
        return this.walletService.getPortfolioSummary(userId);
    }

    @ApiOperation({ summary: 'Get transaction history', description: 'Retrieve all transactions (deposits, withdrawals, trades).' })
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

    @ApiOperation({ summary: 'Withdraw funds', description: 'Withdraw available funds from a wallet.' })
    @ApiResponse({ status: 201, description: 'Withdrawal successful.', type: WalletPresenter })
    @Post('withdraw')
    public async withdraw(@Req() req, @Body() withdrawDto: WithdrawDto): Promise<WalletPresenter> {
        const userId = req.user.id;
        const wallet = await this.walletService.withdraw(userId, withdrawDto.amount, withdrawDto.currency);
        return new WalletPresenter(wallet);
    }

    @ApiOperation({ summary: 'Reset account', description: 'Wipe all wallets and reset to $10,000 USD.' })
    @ApiResponse({ status: 201, description: 'Account reset successful.', type: WalletPresenter })
    @Post('reset')
    public async resetAccount(@Req() req): Promise<WalletPresenter> {
        const userId = req.user.id;
        const wallet = await this.walletService.resetAccount(userId);
        return new WalletPresenter(wallet);
    }
}

