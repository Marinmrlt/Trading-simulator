import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPresenter } from './order.presenter';
import { TradeService } from './trade.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Trade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trade')
export class TradeController {
    constructor(private readonly tradeService: TradeService) { }

    @ApiOperation({ summary: 'Place an order', description: 'Create a new market or limit order.' })
    @ApiResponse({ status: 201, description: 'Order successfully placed.', type: OrderPresenter })
    @Post('order')
    public async placeOrder(@Req() req, @Body() orderDto: CreateOrderDto): Promise<OrderPresenter> {
        const userId = req.user.id;
        const order = await this.tradeService.placeOrder(userId, orderDto);
        return new OrderPresenter(order);
    }
}
