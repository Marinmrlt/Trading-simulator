import { ApiProperty } from '@nestjs/swagger';
import { OrderPresenter } from './order.presenter';

export class OcoOrderPresenter {
    @ApiProperty({ type: OrderPresenter })
    stopLossOrder: OrderPresenter;

    @ApiProperty({ type: OrderPresenter })
    takeProfitOrder: OrderPresenter;

    constructor(data: { stopLossOrder: any, takeProfitOrder: any }) {
        this.stopLossOrder = new OrderPresenter(data.stopLossOrder);
        this.takeProfitOrder = new OrderPresenter(data.takeProfitOrder);
    }
}
