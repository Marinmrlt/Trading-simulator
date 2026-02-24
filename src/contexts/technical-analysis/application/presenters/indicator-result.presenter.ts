import { ApiProperty } from '@nestjs/swagger';

export class IndicatorResultPresenter {
    @ApiProperty({ description: 'Indicator values (number array or object array)', oneOf: [{ type: 'array', items: { type: 'number' } }, { type: 'array', items: { type: 'object' } }] })
    values: any[];

    constructor(values: any[]) {
        this.values = values;
    }
}
