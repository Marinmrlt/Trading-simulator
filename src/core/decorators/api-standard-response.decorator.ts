import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export class StandardResponseDto<T> {
    data: T;
    metadata: {
        statusCode: number;
        message: string;
        timestamp: string;
        path: string;
        [key: string]: any;
    };
}

export const ApiStandardResponse = <TModel extends Type<any>>(model: TModel, options?: { isArray?: boolean }) => {
    return applyDecorators(
        ApiExtraModels(StandardResponseDto, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(StandardResponseDto) },
                    {
                        properties: {
                            data: options?.isArray
                                ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                                : { $ref: getSchemaPath(model) },
                        },
                    },
                ],
            },
        }),
    );
};
